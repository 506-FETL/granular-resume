import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { IconClock, IconDeviceDesktop, IconKey, IconMapPin, IconShield } from '@tabler/icons-react'

interface SessionInfoProps {
  lastSignInAt?: string
  provider?: string
  formatDate: (dateString?: string) => string
}

export function SessionInfo({ lastSignInAt, provider, formatDate }: SessionInfoProps) {
  const getDeviceInfo = () => {
    if (typeof navigator === 'undefined') return '浏览器'

    const ua = navigator.userAgent
    const os = ua.includes('Mac')
      ? 'macOS'
      : ua.includes('Windows')
        ? 'Windows'
        : ua.includes('Linux')
          ? 'Linux'
          : '未知系统'
    const browser = ua.includes('Chrome')
      ? 'Chrome'
      : ua.includes('Firefox')
        ? 'Firefox'
        : ua.includes('Safari')
          ? 'Safari'
          : '其他浏览器'

    return `${os} · ${browser}`
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between'>
        <div className='space-y-0.5'>
          <Label className='flex items-center gap-2'>
            <IconKey className='h-4 w-4' />
            会话信息
          </Label>
          <p className='text-muted-foreground text-sm'>当前登录会话的详细信息</p>
        </div>
        <Badge variant='outline' className='gap-1'>
          <IconDeviceDesktop className='h-3 w-3' />
          当前设备
        </Badge>
      </div>

      <div className='bg-muted/50 space-y-3 rounded-lg border p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <IconClock className='text-muted-foreground h-4 w-4' />
            <div>
              <p className='text-sm font-medium'>最后登录时间</p>
              <p className='text-muted-foreground text-xs'>{lastSignInAt ? formatDate(lastSignInAt) : '未知'}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <IconShield className='text-muted-foreground h-4 w-4' />
            <div>
              <p className='text-sm font-medium'>登录方式</p>
              <p className='text-muted-foreground text-xs'>{provider === 'email' ? '邮箱密码' : provider}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <IconMapPin className='text-muted-foreground h-4 w-4' />
            <div>
              <p className='text-sm font-medium'>设备信息</p>
              <p className='text-muted-foreground text-xs'>{getDeviceInfo()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
