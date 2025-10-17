import { useCurrentUserName } from '@/hooks/use-current-user-name'
import { useDebounce } from '@/hooks/use-debounce'
import supabase from '@/lib/supabase/client'
import { changeAvatar, getCurrentUser } from '@/lib/supabase/user'
import type { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function useProfileData() {
  const currentName = useCurrentUserName()
  const [user, setUser] = useState<User | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // 编辑状态
  const [editingName, setEditingName] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)

  // 会话信息
  const [sessionInfo, setSessionInfo] = useState<{
    lastSignInAt?: string
    provider?: string
  } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        toast.error('请先登录')
        navigate('/login')
        return
      }
      setUser(currentUser)
      setFullName(currentUser.user_metadata.full_name || '')
      setEmail(currentUser.email || '')

      // 获取会话信息
      const { data: session } = await supabase.auth.getSession()
      if (session.session) {
        setSessionInfo({
          lastSignInAt: currentUser.last_sign_in_at || undefined,
          provider: currentUser.app_metadata.provider || 'email',
        })
      }

      setLoading(false)
    }
    fetchUser()
  }, [navigate])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB')
      return
    }

    setUploading(true)
    try {
      await changeAvatar(file)
      toast.success('头像更新成功')
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      toast.error('头像上传失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  // 更新用户名
  const updateFullName = useCallback(async () => {
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
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      })

      if (error) throw error

      toast.success('用户名更新成功')
      setEditingName(false)

      // 刷新用户信息
      const updatedUser = await getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Failed to update name:', error)
      toast.error('用户名更新失败，请稍后重试')
    } finally {
      setSavingName(false)
    }
  }, [fullName, currentName])

  // 防抖更新用户名
  const debouncedUpdateName = useDebounce(updateFullName, 500)

  // 更新邮箱
  const updateEmail = useCallback(async () => {
    if (!email.trim()) {
      toast.error('邮箱地址不能为空')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('请输入有效的邮箱地址')
      return
    }

    if (email === user?.email) {
      setEditingEmail(false)
      return
    }

    setSavingEmail(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
      })

      if (error) throw error

      toast.success('邮箱更新请求已发送，请查收验证邮件')
      setEditingEmail(false)

      // 刷新用户信息
      const updatedUser = await getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
        setEmail(updatedUser.email || '')
      }
    } catch (error) {
      console.error('Failed to update email:', error)
      toast.error('邮箱更新失败，请稍后重试')
    } finally {
      setSavingEmail(false)
    }
  }, [email, user?.email])

  // 防抖更新邮箱
  const debouncedUpdateEmail = useDebounce(updateEmail, 500)

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知'
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    // 如果是最近的时间，显示相对时间
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return diffInMinutes < 1 ? '刚刚' : `${diffInMinutes} 分钟前`
    } else if (diffInHours < 24) {
      return `${diffInHours} 小时前`
    } else if (diffInDays < 7) {
      return `${diffInDays} 天前`
    }

    // 否则显示完整日期
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRegistrationDate = (dateString?: string) => {
    if (!dateString) return '未知'
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

  return {
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
  }
}
