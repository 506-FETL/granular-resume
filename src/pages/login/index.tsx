import { LoginForm } from '@/components/login-form'
import { useEffect } from 'react'

const Login = () => {
  useEffect(() => {}, [])

  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4'>
      <LoginForm className='max-w-lg mx-auto' />
    </div>
  )
}

export default Login
