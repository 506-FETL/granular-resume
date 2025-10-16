import supabase from '../client'

export const SignUpWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) throw error
}

export const SignInWithEmailAndPassword = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw error
}

export const SignOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}
