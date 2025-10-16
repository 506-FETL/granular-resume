import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { AccountSettingsCard } from './components/account-settings-card'
import { PreferencesCard } from './components/preferences-card'
import { ProfileInfoCard } from './components/profile-info-card'
import { useProfileData } from './components/use-profile-data'

export default function ProfilePage() {
  const {
    user,
    loading,
    image,
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
    return (
      <div className='flex h-[calc(100vh-200px)] items-center justify-center'>
        <Spinner className='h-8 w-8' />
      </div>
    )
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
        image={image}
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
