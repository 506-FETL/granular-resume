import { LightRays } from '@/components/ui/light-rays'
import { useIsMobile } from '@/hooks/use-mobile'
import useAlreadyLoggedRedirect from '@/hooks/use-redirect'
import { LoginForm } from './components/login-form'

function Login() {
  useAlreadyLoggedRedirect()
  const isMobile = useIsMobile()

  return (
    <>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
        <LoginForm className="max-w-lg mx-auto" />
      </div>
      {!isMobile && <LightRays />}
    </>
  )
}

export default Login
