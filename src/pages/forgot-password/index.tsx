import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { LightRays } from '@/components/ui/light-rays'
import { useAlreadyLoggedRedirect } from '@/hooks/use-redirect'

function ForgotPassword() {
  useAlreadyLoggedRedirect('/')

  return (
    <>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
        <ForgotPasswordForm className="max-w-lg  mx-auto" />
      </div>
      <LightRays />
    </>
  )
}

export default ForgotPassword
