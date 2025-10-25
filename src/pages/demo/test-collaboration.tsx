import useAutomergeResumeStore from '@/store/resume/form-automerge'
import { getCurrentUser } from '@/lib/supabase/user'
import { useEffect, useState } from 'react'
import { RealtimeCursors } from '@/components/realtime-cursors'
import useCurrentResumeStore from '@/store/resume/current'

const TEST_RESUME_ID = useCurrentResumeStore((state) => state.resumeId)

export default function TestCollaborationPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  const { basics, isInitialized, isLoading, lastSyncTime, syncError, initializeDocument, updateForm, cleanup } =
    useAutomergeResumeStore()

  // 获取当前用户
  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser)
    })
  }, [])

  // 初始化文档 - 只执行一次
  useEffect(() => {
    if (!user?.id || hasInitialized) return

    setHasInitialized(true)
    initializeDocument(TEST_RESUME_ID || '', user.id)

    return () => {
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleUpdateName = () => {
    const newName = `用户 ${Math.floor(Math.random() * 1000)}`
    updateForm('basics', {
      name: newName,
    })
  }

  if (!user) {
    return (
      <div className='p-8'>
        <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
          ⚠️ 请先登录才能测试实时协作
        </div>
      </div>
    )
  }

  return (
    <div className='p-8 max-w-4xl mx-auto relative'>
      {/* 实时光标 */}
      {user && (
        <RealtimeCursors
          roomName={`resume-collaboration:${TEST_RESUME_ID}`}
          username={user.email || `User-${user.id.slice(0, 8)}`}
        />
      )}

      <div className='bg-white shadow-lg rounded-lg p-6 mb-6'>
        <h1 className='text-3xl font-bold mb-2'>🔗 实时协作测试</h1>
        <p className='text-gray-600 mb-4'>打开多个浏览器窗口/标签页来测试实时协作功能</p>

        <div className='flex items-center gap-3 mb-6'>
          {isLoading && (
            <div className='flex items-center gap-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
              <span className='text-sm text-gray-600'>正在加载...</span>
            </div>
          )}

          {isInitialized && (
            <>
              <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'>✅ 已连接</span>
              {lastSyncTime && (
                <span className='text-xs text-gray-500'>最后同步: {new Date(lastSyncTime).toLocaleTimeString()}</span>
              )}
            </>
          )}

          {!isLoading && !isInitialized && (
            <div className='flex flex-col gap-2'>
              <span className='px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium'>❌ 初始化失败</span>
              {syncError && <div className='text-xs text-red-600 bg-red-50 p-2 rounded'>错误: {syncError}</div>}
            </div>
          )}
        </div>
      </div>

      <div className='bg-white shadow-lg rounded-lg p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>当前数据</h2>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>姓名</label>
            <div className='text-2xl font-bold text-blue-600'>{basics.name || '(未设置)'}</div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>联系电话</label>
            <div className='text-lg text-gray-800'>{basics.phone || '(未设置)'}</div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>邮箱</label>
            <div className='text-lg text-gray-800'>{basics.email || '(未设置)'}</div>
          </div>
        </div>
      </div>

      <div className='bg-white shadow-lg rounded-lg p-6'>
        <h2 className='text-xl font-semibold mb-4'>操作</h2>

        <div className='flex flex-wrap gap-3'>
          <button
            onClick={handleUpdateName}
            disabled={!isInitialized}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition'
          >
            🎲 随机修改姓名
          </button>

          <button
            onClick={() => updateForm('basics', { phone: `1${Math.floor(Math.random() * 10000000000)}` })}
            disabled={!isInitialized}
            className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition'
          >
            📱 随机修改电话
          </button>

          <button
            onClick={() => updateForm('basics', { email: `user${Date.now()}@test.com` })}
            disabled={!isInitialized}
            className='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition'
          >
            📧 随机修改邮箱
          </button>
        </div>

        <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded'>
          <h3 className='font-semibold text-blue-900 mb-2'>💡 测试说明</h3>
          <ol className='list-decimal list-inside space-y-1 text-sm text-blue-800'>
            <li>在多个浏览器窗口中打开此页面</li>
            <li>在任意窗口中点击按钮修改数据</li>
            <li>观察其他窗口中的数据是否实时更新</li>
            <li>尝试在不同窗口同时修改数据，观察冲突解决</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
