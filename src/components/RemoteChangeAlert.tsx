import { AlertCircle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'motion/react'
import useUnifiedResumeStore from '@/store/resume/unified'

/**
 * 远程变更提醒组件
 * 当检测到其他用户的更新时显示
 */
export function RemoteChangeAlert() {
  const hasRemoteChanges = useUnifiedResumeStore((state) => state.hasRemoteChanges)
  const remoteChangeNotification = useUnifiedResumeStore((state) => state.remoteChangeNotification)
  const acceptRemoteChanges = useUnifiedResumeStore((state) => state.acceptRemoteChanges)
  const dismissRemoteChanges = useUnifiedResumeStore((state) => state.dismissRemoteChanges)

  return (
    <AnimatePresence>
      {hasRemoteChanges && remoteChangeNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className='fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]'
        >
          <div className='bg-blue-50 dark:bg-blue-950 border-2 border-blue-500 rounded-lg shadow-lg p-4'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />

              <div className='flex-1 space-y-2'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-semibold text-blue-900 dark:text-blue-100'>检测到新的更改</h4>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 -mt-1 -mr-1'
                    onClick={dismissRemoteChanges}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                <p className='text-sm text-blue-800 dark:text-blue-200'>{remoteChangeNotification}</p>

                <p className='text-xs text-blue-600 dark:text-blue-400'>Automerge 已自动合并变更，无需手动处理冲突。</p>

                <Button
                  size='sm'
                  className='bg-blue-600 hover:bg-blue-700 text-white w-full'
                  onClick={acceptRemoteChanges}
                >
                  <CheckCircle className='h-4 w-4 mr-2' />
                  知道了
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
