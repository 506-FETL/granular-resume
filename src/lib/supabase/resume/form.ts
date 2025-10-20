import supabase from '../client'
import { getCurrentUser } from '../user'

export async function getAllResumesFromUser() {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('resume_config')
    .select('id,created_at,type,display_name,description')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(0, 10)

  if (error) {
    throw error
  }

  return data
}

export async function getResumeById(id: string) {
  const user = await getCurrentUser()

  const { data, error } = await supabase.from('resume_config').select('*').eq('user_id', user.id).eq('id', id).single()

  if (error) {
    throw error
  }

  return data
}

export async function createNewResume(
  info: { display_name?: string; description?: string } = {
    display_name: '简历',
    description: new Date().toLocaleDateString(),
  },
  type: string = 'default',
) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('resume_config')
    .insert({
      user_id: user.id,
      type,
      ...info,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteResume(id: string) {
  const user = await getCurrentUser()

  const { error } = await supabase.from('resume_config').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    throw error
  }

  return true
}
