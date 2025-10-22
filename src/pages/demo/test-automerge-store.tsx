import useAutomergeResumeStore from '@/store/resume/form-automerge'
import { getCurrentUser } from '@/lib/supabase/user'
import { useEffect, useState } from 'react'

export default function TestAutomergeStorePage() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  const {
    basics,
    jobIntent,
    order,
    visibility,
    isInitialized,
    isLoading,
    isSyncing,
    lastSyncTime,
    syncError,
    initializeDocument,
    updateForm,
    updateOrder,
    toggleVisibility,
    manualSync,
    cleanup,
  } = useAutomergeResumeStore()

  // 获取当前用户
  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser)
    })
  }, [])

  // 初始化文档 - 只执行一次
  useEffect(() => {
    if (!user?.id || hasInitialized) return

    const testResumeId = '773ab0bf-8abd-45dd-980a-b23f21ca2842'
    setHasInitialized(true)
    initializeDocument(testResumeId, user.id)

    return () => {
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleUpdateName = () => {
    updateForm('basics', {
      name: '测试用户 ' + new Date().toLocaleTimeString(),
    })
  }

  const handleUpdateEmail = () => {
    updateForm('basics', {
      email: `test${Date.now()}@example.com`,
    })
  }

  const handleUpdateJobIntent = () => {
    updateForm('jobIntent', {
      jobIntent: '前端工程师 ' + new Date().toLocaleTimeString(),
    })
  }

  const handleToggleJobIntentVisibility = () => {
    toggleVisibility('jobIntent')
  }

  const handleReorderSections = () => {
    const newOrder = [...order]
    // 交换前两项
    if (newOrder.length >= 2) {
      ;[newOrder[0], newOrder[1]] = [newOrder[1], newOrder[0]]
      updateOrder(newOrder)
    }
  }

  if (!user) {
    return (
      <div className='p-8'>
        <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
          ⚠️ 请先登录才能测试 Automerge Store
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='p-8'>
        <div className='text-center'>正在初始化 Automerge 文档...</div>
      </div>
    )
  }

  return (
    <div className='p-8 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>🧪 Automerge Store 测试页面</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 左侧: 状态信息 */}
        <div className='space-y-6'>
          {/* 系统状态 */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h2 className='font-semibold text-lg mb-3'>📊 系统状态</h2>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2'>
                <span className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>文档状态: {isInitialized ? '已初始化' : '未初始化'}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                <span>同步状态: {isSyncing ? '同步中...' : '空闲'}</span>
              </div>
              <div>最后同步: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : '从未同步'}</div>
              {syncError && <div className='text-red-600 text-xs mt-2'>❌ {syncError}</div>}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className='bg-white border border-gray-200 rounded-lg p-4'>
            <h2 className='font-semibold text-lg mb-4'>🎮 测试操作</h2>
            <div className='grid grid-cols-2 gap-3'>
              <button
                onClick={handleUpdateName}
                disabled={!isInitialized}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm'
              >
                更新姓名
              </button>

              <button
                onClick={handleUpdateEmail}
                disabled={!isInitialized}
                className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm'
              >
                更新邮箱
              </button>

              <button
                onClick={handleUpdateJobIntent}
                disabled={!isInitialized}
                className='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm'
              >
                更新求职意向
              </button>

              <button
                onClick={handleToggleJobIntentVisibility}
                disabled={!isInitialized}
                className='px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm'
              >
                切换求职意向可见性
              </button>

              <button
                onClick={handleReorderSections}
                disabled={!isInitialized}
                className='px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm'
              >
                重新排序
              </button>

              <button
                onClick={manualSync}
                disabled={!isInitialized || isSyncing}
                className='px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm'
              >
                💾 手动同步
              </button>
            </div>
          </div>

          {/* 可见性状态 */}
          <div className='bg-white border border-gray-200 rounded-lg p-4'>
            <h2 className='font-semibold text-lg mb-3'>👁️ 可见性状态</h2>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-green-500' />
                <span>基本信息: 可见（不可隐藏）</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className={`w-2 h-2 rounded-full ${!visibility.jobIntent ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>求职意向: {!visibility.jobIntent ? '可见' : '隐藏'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧: 数据预览 */}
        <div className='space-y-6'>
          {/* 基本信息 */}
          <div className='bg-white border border-gray-200 rounded-lg p-4'>
            <h2 className='font-semibold text-lg mb-3'>📝 基本信息</h2>
            <div className='space-y-2 text-sm'>
              <div>
                <strong>姓名:</strong> {basics.name || '未填写'}
              </div>
              <div>
                <strong>邮箱:</strong> {basics.email || '未填写'}
              </div>
              <div>
                <strong>电话:</strong> {basics.phone || '未填写'}
              </div>
              <div>
                <strong>性别:</strong> {basics.gender}
              </div>
            </div>
          </div>

          {/* 求职意向 */}
          <div className='bg-white border border-gray-200 rounded-lg p-4'>
            <h2 className='font-semibold text-lg mb-3'>💼 求职意向</h2>
            <div className='space-y-2 text-sm'>
              <div>
                <strong>期望岗位:</strong> {jobIntent.jobIntent || '未填写'}
              </div>
              <div>
                <strong>期望薪资:</strong> {jobIntent.expectedSalary || '未填写'}
              </div>
              <div>
                <strong>期望城市:</strong> {jobIntent.intentionalCity || '未填写'}
              </div>
            </div>
          </div>

          {/* 章节顺序 */}
          <div className='bg-white border border-gray-200 rounded-lg p-4'>
            <h2 className='font-semibold text-lg mb-3'>📋 章节顺序</h2>
            <ol className='list-decimal list-inside space-y-1 text-sm'>
              {order.map((item, index) => (
                <li key={item}>
                  {item} {index < 2 && '⬆️'}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className='mt-6 bg-green-50 border border-green-200 rounded-lg p-4'>
        <h2 className='font-semibold text-lg mb-3'>📚 测试步骤</h2>
        <ol className='list-decimal list-inside space-y-2 text-sm'>
          <li>点击各种按钮测试数据更新</li>
          <li>观察右侧数据实时变化</li>
          <li>打开浏览器控制台查看日志</li>
          <li>打开 Chrome DevTools → Application → IndexedDB → resume-automerge-v1</li>
          <li>3秒后自动保存到 Supabase，或点击"手动同步"</li>
          <li>打开多个标签页测试协同编辑（未来功能）</li>
          <li>刷新页面验证数据持久化</li>
        </ol>
      </div>
    </div>
  )
}
