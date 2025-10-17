import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { User } from '@supabase/supabase-js'
import { IconCalendar, IconMail, IconUser } from '@tabler/icons-react'
import { EditableField } from './editable-field'
import { ProfileHeader } from './profile-header'
import { ReadonlyField } from './readonly-field'

interface ProfileInfoCardProps {
  user: User
  currentName: string
  uploading: boolean
  fullName: string
  email: string
  editingName: boolean
  editingEmail: boolean
  savingName: boolean
  savingEmail: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFullNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onEditName: () => void
  onSaveName: () => void
  onCancelName: () => void
  onEditEmail: () => void
  onSaveEmail: () => void
  onCancelEmail: () => void
  formatRegistrationDate: (dateString?: string) => string
}

export function ProfileInfoCard({
  user,
  currentName,
  uploading,
  fullName,
  email,
  editingName,
  editingEmail,
  savingName,
  savingEmail,
  onFileChange,
  onFullNameChange,
  onEmailChange,
  onEditName,
  onSaveName,
  onCancelName,
  onEditEmail,
  onSaveEmail,
  onCancelEmail,
  formatRegistrationDate,
}: ProfileInfoCardProps) {
  console.log(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>你的基本账户信息</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <ProfileHeader
          name={currentName}
          email={user.email || ''}
          emailConfirmed={!!user.email_confirmed_at}
          uploading={uploading}
          onFileChange={onFileChange}
        />

        <Separator />

        <div className='grid gap-4 sm:grid-cols-2'>
          <EditableField
            id='name'
            label='用户名'
            icon={<IconUser className='h-4 w-4' />}
            value={fullName}
            isEditing={editingName}
            isSaving={savingName}
            onValueChange={onFullNameChange}
            onEdit={onEditName}
            onSave={onSaveName}
            onCancel={onCancelName}
          />

          <EditableField
            id='email'
            label='邮箱地址'
            icon={<IconMail className='h-4 w-4' />}
            type='email'
            value={email}
            isEditing={editingEmail}
            isSaving={savingEmail}
            onValueChange={onEmailChange}
            onEdit={onEditEmail}
            onSave={onSaveEmail}
            onCancel={onCancelEmail}
          />

          <ReadonlyField
            id='created'
            label='注册时间'
            icon={<IconCalendar className='h-4 w-4' />}
            value={formatRegistrationDate(user.created_at)}
          />

          <ReadonlyField
            id='updated'
            label='最后更新'
            icon={<IconCalendar className='h-4 w-4' />}
            value={formatRegistrationDate(user.updated_at || user.created_at)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
