import type { User } from '@supabase/supabase-js'
import { IconCalendar, IconMail, IconShield, IconUser } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCurrentUserName } from '@/hooks/use-current-user-name'
import { useDebounce } from '@/hooks/use-debounce'
import supabase from '@/lib/supabase/client'
import { updateProfile } from '@/lib/supabase/user'
import { EditableField } from './editable-field'
import { ProfileAvatar } from './profile-avatar'
import { ReadonlyField } from './readonly-field'

interface ProfileInfoCardProps {
  user: User
}

export function ProfileInfoCard({ user: initialUser }: ProfileInfoCardProps) {
  const currentName = useCurrentUserName()
  const [user, setUser] = useState(initialUser)

  // 编辑状态
  const [editingName, setEditingName] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [fullName, setFullName] = useState(user.user_metadata.full_name || '')
  const [email, setEmail] = useState(user.email || '')
  const [savingName, setSavingName] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)

  // 订阅用户认证状态变化,自动刷新用户信息
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // 当用户信息更新时刷新
      if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user)
        setFullName(session.user.user_metadata.full_name || '')
        setEmail(session.user.email || '')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 更新用户名
  const updateFullName = async () => {
    if (!fullName.trim()) {
      toast.error('用户名不能为空')
      return
    }

    if (fullName === currentName) {
      setEditingName(false)
      return
    }

    setSavingName(true)
    try {
      await updateProfile({ data: { full_name: fullName } })

      toast.success('用户名更新成功')
      setEditingName(false)
    }
    catch {
      toast.error('用户名更新失败，请稍后重试')
    }
    finally {
      setSavingName(false)
    }
  }

  // 防抖更新用户名
  const debouncedUpdateName = useDebounce(updateFullName, 500)

  // 更新邮箱
  const updateEmail = async () => {
    if (!email.trim()) {
      toast.error('邮箱地址不能为空')
      return
    }

    if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email)) {
      toast.error('请输入有效的邮箱地址')
      return
    }

    if (email === user?.email) {
      setEditingEmail(false)
      return
    }

    setSavingEmail(true)
    try {
      await updateProfile({ email })

      toast.success('邮箱更新请求已发送，请查收验证邮件')
      setEditingEmail(false)
    }
    catch {
      toast.error('邮箱更新失败，请稍后重试')
    }
    finally {
      setSavingEmail(false)
    }
  }

  // 防抖更新邮箱
  const debouncedUpdateEmail = useDebounce(updateEmail, 500)

  const formatRegistrationDate = (dateString?: string) => {
    if (!dateString)
      return '未知'
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEditName = () => setEditingName(true)
  const handleCancelName = () => {
    setFullName(user?.user_metadata.full_name || '')
    setEditingName(false)
  }

  const handleEditEmail = () => setEditingEmail(true)
  const handleCancelEmail = () => {
    setEmail(user?.email || '')
    setEditingEmail(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>你的基本账户信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <ProfileAvatar />
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">{currentName}</h3>
            <p className="text-muted-foreground flex items-center gap-2">
              <IconMail className="h-4 w-4" />
              {email}
            </p>
            <Badge variant={user.email_confirmed_at ? 'outline' : 'destructive'} className="mt-2 gap-1">
              <IconShield className="h-3 w-3" />
              {user.email_confirmed_at ? '邮箱已验证' : '邮箱未验证'}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <EditableField
            id="name"
            label="用户名"
            icon={<IconUser className="h-4 w-4" />}
            value={fullName}
            isEditing={editingName}
            isSaving={savingName}
            onValueChange={setFullName}
            onEdit={handleEditName}
            onSave={debouncedUpdateName}
            onCancel={handleCancelName}
          />

          <EditableField
            id="email"
            label="邮箱地址"
            icon={<IconMail className="h-4 w-4" />}
            type="email"
            value={email}
            isEditing={editingEmail}
            isSaving={savingEmail}
            onValueChange={setEmail}
            onEdit={handleEditEmail}
            onSave={debouncedUpdateEmail}
            onCancel={handleCancelEmail}
          />

          <ReadonlyField
            id="created"
            label="注册时间"
            icon={<IconCalendar className="h-4 w-4" />}
            value={formatRegistrationDate(user.created_at)}
          />

          <ReadonlyField
            id="updated"
            label="最后更新"
            icon={<IconCalendar className="h-4 w-4" />}
            value={formatRegistrationDate(user.updated_at || user.created_at)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
