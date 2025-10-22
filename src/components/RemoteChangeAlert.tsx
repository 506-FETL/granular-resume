import useUnifiedResumeStore from '@/store/resume/unified'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'

/**
 * 远程变更提醒组件
 * 当检测到其他用户的更新时使用 toast 显示
 */
export function RemoteChangeAlert() {
  const hasRemoteChanges = useUnifiedResumeStore((state) => state.hasRemoteChanges)
  const remoteChangeNotification = useUnifiedResumeStore((state) => state.remoteChangeNotification)
  const acceptRemoteChanges = useUnifiedResumeStore((state) => state.acceptRemoteChanges)
  const toastIdRef = useRef<string | number | null>(null)

  useEffect(() => {
    if (hasRemoteChanges && remoteChangeNotification) {
      // 如果已经有 toast 显示，先关闭它
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
      }

      // 显示新的 toast
      toastIdRef.current = toast.info(remoteChangeNotification, {
        description: 'Automerge 已自动合并变更，无需手动处理冲突。',
        duration: 10000, // 10秒后自动消失
        action: {
          label: '知道了',
          onClick: () => {
            acceptRemoteChanges()
            toastIdRef.current = null
          },
        },
        onDismiss: () => {
          acceptRemoteChanges()
          toastIdRef.current = null
        },
        onAutoClose: () => {
          acceptRemoteChanges()
          toastIdRef.current = null
        },
        icon: <CheckCircle className='h-5 w-5' />,
      })
    }
  }, [hasRemoteChanges, remoteChangeNotification, acceptRemoteChanges])

  useEffect(() => {
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
      }
    }
  }, [])

  return null
}
