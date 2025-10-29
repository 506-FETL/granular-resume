import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/use-debounce'
import supabase from '@/lib/supabase/client'
import { IconLock } from '@tabler/icons-react'
import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Spinner } from './ui/spinner'

export function UpdatePasswordDialog() {
  const [open, setOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = useCallback(() => {
    if (!oldPassword) {
      toast.error('请输入旧密码')
      return false
    }

    if (!newPassword) {
      toast.error('请输入新密码')
      return false
    }

    if (newPassword.length < 6) {
      toast.error('新密码至少需要 6 个字符')
      return false
    }

    if (newPassword === oldPassword) {
      toast.error('新密码不能与旧密码相同')
      return false
    }

    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致')
      return false
    }

    return true
  }, [oldPassword, newPassword, confirmPassword])

  const handleUpdatePassword = useCallback(async () => {
    if (!validatePassword()) return

    setLoading(true)
    try {
      // 先验证旧密码
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        toast.error('无法获取用户信息')
        setLoading(false)
        return
      }

      // 尝试使用旧密码登录来验证
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      })

      if (signInError) {
        toast.error('旧密码错误')
        setLoading(false)
        return
      }

      // 更新密码
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      toast.success('密码修改成功')
      setOpen(false)
      // 清空表单
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Failed to update password:', error)
      toast.error('密码修改失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [validatePassword, oldPassword, newPassword])

  // 使用防抖 hook
  const debouncedSubmit = useDebounce(handleUpdatePassword, 500)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    debouncedSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>修改密码</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <IconLock className='h-5 w-5' />
            修改密码
          </DialogTitle>
          <DialogDescription>为了保护您的账户安全，请输入旧密码并设置新密码</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='old-password'>旧密码</Label>
              <Input
                id='old-password'
                type='password'
                placeholder='请输入旧密码'
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='new-password'>新密码</Label>
              <Input
                id='new-password'
                type='password'
                placeholder='请输入新密码（至少 6 个字符）'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirm-password'>确认新密码</Label>
              <Input
                id='confirm-password'
                type='password'
                placeholder='请再次输入新密码'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={loading}>
              取消
            </Button>
            <Button type='submit' disabled={loading}>
              {loading && <Spinner className='mr-2 h-4 w-4' />}
              确认修改
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
