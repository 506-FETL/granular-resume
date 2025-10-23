/* eslint-disable no-console */
import { SyncResumesDialog } from '@/components/SyncResumesDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { deleteOfflineResume, getAllOfflineResumes, isOfflineResumeId } from '@/lib/offline-resume-manager'
import { syncOfflineResumesToCloud } from '@/lib/resume-sync-service'
import { subscribeToResumeConfigUpdates } from '@/lib/supabase/resume'
import { deleteResume, getAllResumesFromUser } from '@/lib/supabase/resume/form'
import { getCurrentUser } from '@/lib/supabase/user'
import useCurrentResumeStore, { type ResumeType } from '@/store/resume/current'
import { CloudUpload, Wifi, WifiOff } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CreateResumeCard } from './components/CreateResumeCard'
import { ResumeCard } from './components/ResumeCard'
import HeadBars from './components/HeadBars'

interface Resume {
  resume_id: string
  created_at: string
  type: ResumeType
  display_name?: string
  description?: string
  isOffline?: boolean // 标记是否为离线简历
}

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [offlineResumes, setOfflineResumes] = useState<Resume[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set())
  const [localDeletingIds, setLocalDeletingIds] = useState<Set<string>>(new Set()) // 本地正在删除的简历ID
  const navigate = useNavigate()
  const { setCurrentResume } = useCurrentResumeStore()

  useEffect(() => {
    loadResumes()

    async function loadResumes() {
      try {
        // 检查用户是否登录
        const user = await getCurrentUser()
        setIsOnline(!!user)

        let allResumes: Resume[] = []

        // 加载在线简历（如果已登录）
        if (user) {
          try {
            const onlineResumes = await getAllResumesFromUser()
            allResumes = onlineResumes.map((r) => ({ ...r, isOffline: false }))
          } catch (error: any) {
            if (error.message !== '用户未登陆') {
              toast.error('加载在线简历失败')
            }
          }
        }

        // 加载离线简历
        let formattedOfflineResumes: Resume[] = []
        try {
          const localResumes = await getAllOfflineResumes()
          formattedOfflineResumes = localResumes.map((r) => ({
            resume_id: r.resume_id,
            created_at: r.created_at,
            type: r.type as ResumeType,
            display_name: r.display_name,
            description: r.description,
            isOffline: true,
          }))
          allResumes = [...allResumes, ...formattedOfflineResumes]
        } catch {
          // 忽略离线简历加载错误
        }

        setResumes(allResumes)

        // 如果已登录且有本地简历，只提示用户（不自动弹出对话框）
        if (user && formattedOfflineResumes.length > 0) {
          setOfflineResumes(formattedOfflineResumes)
          // 延迟显示提示，让用户先看到页面
          setTimeout(() => {
            toast.info(`检测到 ${formattedOfflineResumes.length} 个本地简历，点击右上角按钮可同步到云端`, {
              duration: 5000,
            })
          }, 1000)
        }
      } catch {
        // 错误处理
        toast.error('加载简历失败')
      } finally {
        setLoading(false)
      }
    }
  }, [navigate])

  useEffect(() => {
    // 只有在线模式才订阅在线简历更新
    if (!isOnline) return

    let unSubscribe: () => void | undefined

    subscribeToResumeConfigUpdates((payload) => {
      switch (payload.eventType) {
        case 'INSERT': {
          const resume = {
            resume_id: payload.new.resume_id,
            created_at: payload.new.created_at,
            type: payload.new.type,
            display_name: payload.new.display_name,
            description: payload.new.description,
            isOffline: false,
          }
          setResumes((prev) => {
            // 防止重复添加
            if (prev.some((r) => r.resume_id === resume.resume_id)) {
              return prev
            }
            return [resume, ...prev]
          })
          break
        }
        case 'UPDATE': {
          setResumes((prev) =>
            prev.map((resume) =>
              resume.resume_id === payload.new.resume_id
                ? {
                    ...resume,
                    display_name: payload.new.display_name,
                    description: payload.new.description,
                  }
                : resume,
            ),
          )
          break
        }
        case 'DELETE': {
          const deletedResumeId = payload.old.resume_id

          // 检查是否是本地操作触发的删除
          if (localDeletingIds.has(deletedResumeId)) {
            // 是本地删除，清除标记，不显示远程删除提示
            setLocalDeletingIds((prev) => {
              const newSet = new Set(prev)
              newSet.delete(deletedResumeId)
              return newSet
            })
            console.log('本地删除操作，跳过远程同步提示:', deletedResumeId)
            break
          }

          // 是远程删除，需要同步
          const syncPromise = async () => {
            // 重新加载在线简历
            const onlineResumes = await getAllResumesFromUser()
            const formattedOnlineResumes = onlineResumes.map((r) => ({ ...r, isOffline: false }))

            // 保留离线简历，只更新在线简历
            setResumes((prev) => {
              const offlineOnly = prev.filter((r) => r.isOffline)
              return [...formattedOnlineResumes, ...offlineOnly]
            })
          }

          toast.promise(syncPromise, {
            loading: `检测到远端删除了简历，正在同步...`,
            success: '简历已同步删除',
            error: '同步失败，请重试',
          })
          break
        }
      }
    })
      .then((unsub) => {
        unSubscribe = unsub
      })
      .catch((error) => {
        console.error(error.message)
      })

    return () => {
      unSubscribe?.()
    }
  }, [isOnline, localDeletingIds])

  function handleEditResume(resume: Resume) {
    setCurrentResume(resume.resume_id, resume.type)
    navigate('/editor')
  }

  async function handleDeleteResume(id: string) {
    // 判断是离线还是在线简历
    const isOfflineResume = isOfflineResumeId(id)

    // 如果是在线简历，标记为本地删除
    if (!isOfflineResume) {
      setLocalDeletingIds((prev) => new Set(prev).add(id))
    }

    const deletePromise = isOfflineResume
      ? deleteOfflineResume(id).then(() => {
          setResumes((prev) => prev.filter((resume) => resume.resume_id !== id))
        })
      : deleteResume(id).then(() => {
          setResumes((prev) => prev.filter((resume) => resume.resume_id !== id))
        })

    toast.promise(deletePromise, {
      loading: '正在删除简历...',
      success: '简历已删除',
      error: () => {
        // 删除失败，清除本地删除标记
        if (!isOfflineResume) {
          setLocalDeletingIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
          })
        }
        return '删除失败，请重试'
      },
    })
  }

  // 处理简历更新
  function handleResumeUpdate(resumeId: string, updates: { display_name: string; description: string }) {
    setResumes((prev) =>
      prev.map((resume) =>
        resume.resume_id === resumeId
          ? {
              ...resume,
              display_name: updates.display_name,
              description: updates.description,
            }
          : resume,
      ),
    )
  }

  // 处理同步简历
  async function handleSyncResumes(selectedIds: string[]) {
    if (selectedIds.length === 0) return

    setIsSyncing(true)
    setSyncingIds(new Set(selectedIds))

    try {
      const result = await syncOfflineResumesToCloud(selectedIds)

      if (result.success > 0) {
        // 从简历列表中移除已同步的本地简历，并重新加载在线简历
        setResumes((prev) => prev.filter((r) => !selectedIds.includes(r.resume_id)))

        // 重新加载在线简历
        const onlineResumes = await getAllResumesFromUser()
        const newOnlineResumes = onlineResumes.map((r) => ({ ...r, isOffline: false }))
        setResumes((prev) => {
          // 合并并去重
          const offline = prev.filter((r) => r.isOffline)
          return [...newOnlineResumes, ...offline]
        })

        // 更新离线简历列表
        const remaining = offlineResumes.filter((r) => !selectedIds.includes(r.resume_id))
        setOfflineResumes(remaining)

        if (remaining.length === 0) {
          setShowSyncDialog(false)
        }

        toast.success(`成功同步 ${result.success} 个简历到云端`)
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} 个简历同步失败`)
      }
    } catch {
      toast.error('同步失败，请稍后重试')
    } finally {
      setIsSyncing(false)
      setSyncingIds(new Set())
    }
  }

  if (loading) return <ResumePageSkeleton />

  const hasOfflineResumesToSync = offlineResumes.length > 0 && isOnline

  return (
    <div className='container mx-auto p-8'>
      <HeadBars
        setShowSyncDialog={setShowSyncDialog}
        hasOfflineResumesToSync={hasOfflineResumesToSync}
        isOnline={isOnline}
        offlineResumes={offlineResumes}
      />

      <motion.div
        className='grid grid-cols-1 items-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <AnimatePresence mode='popLayout'>
          {resumes.map((resume, index) => {
            const isSyncingThis = syncingIds.has(resume.resume_id)
            return (
              <motion.div
                key={resume.resume_id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                  opacity: isSyncingThis ? 0.5 : 1,
                  scale: isSyncingThis ? 0.95 : 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  y: -20,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  layout: { duration: 0.3 },
                }}
              >
                <ResumeCard
                  resume={resume}
                  onEdit={handleEditResume}
                  onDelete={handleDeleteResume}
                  onUpdate={handleResumeUpdate}
                  isOnline={isOnline}
                />
              </motion.div>
            )
          })}

          <motion.div
            key='create-card'
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: resumes.length * 0.05,
              layout: { duration: 0.3 },
            }}
          >
            <CreateResumeCard
              isOnline={isOnline}
              onResumeCreated={(resume) => {
                if (resume.isOffline) {
                  setResumes((prev) => [resume, ...prev])
                }
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 同步对话框 */}
      <SyncResumesDialog
        open={showSyncDialog}
        onOpenChange={setShowSyncDialog}
        offlineResumes={offlineResumes.map((r) => ({
          resume_id: r.resume_id,
          display_name: r.display_name || '未命名简历',
          description: r.description,
          type: r.type,
          created_at: r.created_at,
        }))}
        onSync={handleSyncResumes}
        isSyncing={isSyncing}
      />
    </div>
  )
}

const ResumePageSkeleton = () => (
  <div className='container mx-auto p-8'>
    <motion.div
      className='mb-8'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Skeleton className='h-9 w-48 mb-2' />
      <Skeleton className='h-5 w-64' />
    </motion.div>

    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {Array.from({ length: 8 }, (_, idx) => idx).map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between mb-4'>
                <Skeleton className='h-8 w-8 rounded-full' />
                <Skeleton className='h-4 w-20' />
              </div>
              <Skeleton className='h-6 w-3/4 mb-2' />
              <Skeleton className='h-4 w-1/2' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-10 w-full' />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
)
