import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { UpdatePasswordDialog } from '@/components/update-password-dialog'
import { SessionInfo } from './session-info'

interface AccountSettingsCardProps {
  sessionInfo: {
    lastSignInAt?: string
    provider?: string
  } | null
  formatDate: (dateString?: string) => string
}

export function AccountSettingsCard({ sessionInfo, formatDate }: AccountSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>账户设置</CardTitle>
        <CardDescription>管理你的账户安全和偏好</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <Label>修改密码</Label>
            <p className='text-muted-foreground text-sm'>更新你的账户密码以保护安全</p>
          </div>
          <UpdatePasswordDialog />
        </div>

        <Separator />

        {sessionInfo && <SessionInfo {...sessionInfo} formatDate={formatDate} />}
      </CardContent>
    </Card>
  )
}
