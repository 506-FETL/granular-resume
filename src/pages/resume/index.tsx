import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { subscribeToResumeConfigUpdates } from '@/lib/supabase/resume'
import { deleteResume, getAllResumesFromUser } from '@/lib/supabase/resume/form'
import useCurrentResumeStore, { type ResumeType } from '@/store/resume/current'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CreateResumeCard } from './components/CreateResumeCard'
import { ResumeCard } from './components/ResumeCard'

interface Resume {
  id: string
  created_at: string
  type: ResumeType
  display_name?: string
  description?: string
}

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { setCurrentResume } = useCurrentResumeStore()

  useEffect(() => {
    loadResumes()

    async function loadResumes() {
      try {
        const data = await getAllResumesFromUser()
        setResumes(data)
      } catch (error: any) {
        toast.error(error.message)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
  }, [navigate])

  useEffect(() => {
    let unSubscribe: () => void | undefined

    subscribeToResumeConfigUpdates((payload) => {
      switch (payload.eventType) {
        case 'INSERT': {
          const resume = {
            id: payload.new.id,
            created_at: payload.new.created_at,
            type: payload.new.type,
            display_name: payload.new.display_name,
            description: payload.new.description,
          }
          setResumes((prev) => [...prev, resume])
          break
        }
        case 'UPDATE': {
          setResumes((prev) =>
            prev.map((resume) =>
              resume.id === payload.new.id
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
      }
    })
      .then((unsub) => {
        unSubscribe = unsub
      })
      .catch((error) => {
        toast.error('订阅简历配置更新失败, 请刷新页面重试' + error.details)
      })

    return () => {
      unSubscribe?.()
    }
  }, [])

  function handleEditResume(resume: Resume) {
    setCurrentResume(resume.id, resume.type)
    navigate(`/editor/${resume.id}`)
  }

  async function handleDeleteResume(id: string) {
    const deletePromise = deleteResume(id).then(() => {
      setResumes((prev) => prev.filter((resume) => resume.id !== id))
    })

    toast.promise(deletePromise, {
      loading: '正在删除简历...',
      success: '简历已删除',
      error: '删除失败，请重试',
    })
  }

  if (loading) return <ResumePageSkeleton />

  return (
    <div className='container mx-auto p-8'>
      <motion.div
        className='mb-8'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className='text-3xl font-bold tracking-tight'>我的简历</h1>
        <p className='text-muted-foreground mt-2'>管理和编辑你的简历</p>
      </motion.div>

      <motion.div
        className='grid grid-cols-1 items-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <AnimatePresence mode='popLayout'>
          {resumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
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
              <ResumeCard resume={resume} onEdit={handleEditResume} onDelete={handleDeleteResume} />
            </motion.div>
          ))}

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
            <CreateResumeCard />
          </motion.div>
        </AnimatePresence>
      </motion.div>
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
