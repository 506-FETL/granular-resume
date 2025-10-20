import supabase from '../client'
import { getCurrentUser } from '../user'

export async function updateResumeConfig(resumeId: string, data: any) {
  const user = await getCurrentUser()

  const { error } = await supabase.from('resume_config').update(data).eq('id', resumeId).eq('user_id', user.id)

  if (error) throw error
}
