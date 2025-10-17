import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { AccountSettingsCard } from './components/account-settings-card'
import { PreferencesCard } from './components/preferences-card'
import { ProfileInfoCard } from './components/profile-info-card'
import { useProfileData } from './components/use-profile-data'

export default function ProfilePage() {
  const {
    user,
    loading,
    currentName,
    uploading,
    fullName,
    email,
    editingName,
    editingEmail,
    savingName,
    savingEmail,
    sessionInfo,
    setFullName,
    setEmail,
    handleFileChange,
    handleEditName,
    debouncedUpdateName,
    handleCancelName,
    handleEditEmail,
    debouncedUpdateEmail,
    handleCancelEmail,
    formatDate,
    formatRegistrationDate,
  } = useProfileData()

  if (!user || loading) {
    return <ProfilePageSkeleton />
  }

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      {/* 页面标题 */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>个人信息</h1>
        <p className='text-muted-foreground mt-2'>管理你的账户信息和偏好设置</p>
      </div>

      <Separator />

      {/* 个人资料卡片 */}
      <ProfileInfoCard
        user={user}
        currentName={currentName}
        uploading={uploading}
        fullName={fullName}
        email={email}
        editingName={editingName}
        editingEmail={editingEmail}
        savingName={savingName}
        savingEmail={savingEmail}
        onFileChange={handleFileChange}
        onFullNameChange={setFullName}
        onEmailChange={setEmail}
        onEditName={handleEditName}
        onSaveName={debouncedUpdateName}
        onCancelName={handleCancelName}
        onEditEmail={handleEditEmail}
        onSaveEmail={debouncedUpdateEmail}
        onCancelEmail={handleCancelEmail}
        formatRegistrationDate={formatRegistrationDate}
      />

      {/* 账户设置卡片 */}
      <AccountSettingsCard sessionInfo={sessionInfo} formatDate={formatDate} />

      {/* 偏好设置卡片 */}
      <PreferencesCard />
    </div>
  )
}

function ProfilePageSkeleton() {
  return (
    <div className='mx-auto max-w-4xl space-y-6 animate-in fade-in-50 duration-500'>
      {/* 页面标题骨架 */}
      <div className='space-y-3'>
        <Skeleton className='h-9 w-48 rounded-lg' />
        <Skeleton className='h-5 w-80' />
      </div>

      <Separator />

      {/* 个人资料卡片骨架 */}
      <div className='rounded-xl border bg-card shadow-sm p-6 space-y-6'>
        <div className='flex items-start gap-6'>
          {/* 头像骨架 */}
          <div className='flex flex-col items-center gap-3'>
            <Skeleton className='h-32 w-32 rounded-full' />
            <Skeleton className='h-9 w-28 rounded-md' />
          </div>

          {/* 用户信息骨架 */}
          <div className='flex-1 space-y-5'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-10 w-full max-w-md rounded-md' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-10 w-full max-w-md rounded-md' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-5 w-48' />
            </div>
          </div>
        </div>
      </div>

      {/* 账户设置卡片骨架 */}
      <div className='rounded-xl border bg-card shadow-sm p-6 space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-32 rounded-lg' />
          <Skeleton className='h-4 w-64' />
        </div>
        <Separator />
        <div className='space-y-4'>
          <div className='flex items-center justify-between py-3'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-48' />
            </div>
            <Skeleton className='h-9 w-24 rounded-md' />
          </div>
          <Separator />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-5 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-5 w-full' />
            </div>
          </div>
        </div>
      </div>

      {/* 偏好设置卡片骨架 */}
      <div className='rounded-xl border bg-card shadow-sm p-6 space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-28 rounded-lg' />
          <Skeleton className='h-4 w-56' />
        </div>
        <Separator />
        <div className='space-y-4'>
          <div className='flex items-center justify-between py-3'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-3 w-40' />
            </div>
            <Skeleton className='h-10 w-32 rounded-md' />
          </div>
          <Separator />
          <div className='flex items-center justify-between py-3'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-3 w-52' />
            </div>
            <Skeleton className='h-6 w-11 rounded-full' />
          </div>
        </div>
      </div>
    </div>
  )
}
