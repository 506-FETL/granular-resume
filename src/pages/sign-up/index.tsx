import { SignUpForm } from '@/components/sign-up-form'
import { LightRays } from '@/components/ui/light-rays'
import { alreadyLoggedRedirect } from '@/hooks/use-redirect'

const Signup = () => {
  alreadyLoggedRedirect()

  return (
    <>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4'>
        <SignUpForm className='max-w-lg  mx-auto' />
      </div>
      <LightRays />
    </>
  )
}

export default Signup
