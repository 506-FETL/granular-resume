import { DocumentManager } from '@/lib/automerge/document-manager'
import type { AutomergeResumeDocument } from '@/lib/automerge/schema'
import { getCurrentUser } from '@/lib/supabase/user'
import { useEffect, useState } from 'react'

export default function TestAutomergePage() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [docManager, setDocManager] = useState<DocumentManager | null>(null)
  const [doc, setDoc] = useState<AutomergeResumeDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 获取当前用户
  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser)
    })
  }, [])

  // 初始化 Automerge 文档
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    // 使用真实的 resume_id（从你的数据库中获取）
    const testResumeId = '773ab0bf-8abd-45dd-980a-b23f21ca2842' // 使用你提供的 resume_id

    const manager = new DocumentManager(testResumeId, user.id)

    manager
      .initialize()
      .then((handle) => {
        setDocManager(manager)

        // 监听文档变化
        handle.on('change', ({ doc }) => {
          setDoc(doc)
          // eslint-disable-next-line no-console
          console.log('📝 文档已更新', doc)
        })

        setDoc(handle.doc())
        setIsLoading(false)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('❌ 初始化失败', err)
        setIsLoading(false)
      })

    return () => {
      manager.destroy()
    }
  }, [user])

  const handleUpdateName = () => {
    if (!docManager) return

    docManager.change((doc) => {
      if (!doc.basics) {
        doc.basics = {
          name: '',
          email: '',
          phone: '',
          gender: '不填',
          nation: '',
          heightCm: 0,
          weightKg: 0,
          workYears: '不填',
          birthMonth: '',
          nativePlace: '',
          customFields: [],
          maritalStatus: '不填',
          politicalStatus: '不填',
        }
      }
      doc.basics.name = '测试用户 ' + new Date().toLocaleTimeString()
    })
  }

  const handleUpdateEmail = () => {
    if (!docManager) return

    docManager.change((doc) => {
      if (!doc.basics) {
        doc.basics = {
          name: '',
          email: '',
          phone: '',
          gender: '不填',
          nation: '',
          heightCm: 0,
          weightKg: 0,
          workYears: '不填',
          birthMonth: '',
          nativePlace: '',
          customFields: [],
          maritalStatus: '不填',
          politicalStatus: '不填',
        }
      }
      doc.basics.email = `test${Date.now()}@example.com`
    })
  }

  const handleSaveToSupabase = async () => {
    if (!docManager || !docManager.getHandle()) return

    await docManager.saveToSupabase(docManager.getHandle()!)
    alert('✅ 已手动保存到 Supabase！')
  }

  if (!user) {
    return (
      <div className='p-8'>
        <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
          ⚠️ 请先登录才能测试 Automerge
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='p-8'>
        <div className='text-center'>加载中...</div>
      </div>
    )
  }

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>🧪 Automerge 测试页面</h1>

      <div className='space-y-6'>
        {/* 状态信息 */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h2 className='font-semibold text-lg mb-2'>📊 系统状态</h2>
          <div className='space-y-1 text-sm'>
            <p>✅ Automerge Repo: 已初始化</p>
            <p>✅ Document Manager: 已创建</p>
            <p>✅ IndexedDB: resume-automerge-v1</p>
            <p>📝 当前文档版本: {doc?._metadata?.version || 0}</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <h2 className='font-semibold text-lg mb-4'>🎮 测试操作</h2>
          <div className='flex flex-wrap gap-3'>
            <button
              onClick={handleUpdateName}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
            >
              更新姓名
            </button>

            <button
              onClick={handleUpdateEmail}
              className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition'
            >
              更新邮箱
            </button>

            <button
              onClick={handleSaveToSupabase}
              className='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition'
            >
              💾 手动保存到 Supabase
            </button>
          </div>
        </div>

        {/* 文档预览 */}
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <h2 className='font-semibold text-lg mb-2'>📄 当前文档内容</h2>
          <pre className='bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-xs'>{JSON.stringify(doc, null, 2)}</pre>
        </div>

        {/* 使用说明 */}
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <h2 className='font-semibold text-lg mb-2'>📚 测试步骤</h2>
          <ol className='list-decimal list-inside space-y-2 text-sm'>
            <li>点击"更新姓名"或"更新邮箱"按钮</li>
            <li>观察下方文档内容的实时变化</li>
            <li>查看浏览器控制台的日志输出</li>
            <li>打开 Chrome DevTools → Application → IndexedDB → resume-automerge-v1</li>
            <li>3秒后自动保存到 Supabase，或点击"手动保存"</li>
            <li>检查 Supabase automerge_documents 表是否有数据</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
