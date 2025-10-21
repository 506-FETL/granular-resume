import type { UserAttributes } from '@supabase/supabase-js'
import supabase from '../client'

export async function getUserProfile() {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, updated_at')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) throw error

  return data.user
}

export async function changeAvatar(file: File) {
  const user = await getCurrentUser()

  const path = `${user.id}/${Date.now()}-${file.name}`

  const { error: upErr } = await supabase.storage.from('avatar').upload(path, file, {
    upsert: true,
  })
  if (upErr) throw upErr

  const { data } = supabase.storage.from('avatar').getPublicUrl(path)
  const avatarUrl = data.publicUrl

  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  })
  if (error) throw error

  return avatarUrl
}

export async function updateProfile(attributes: UserAttributes) {
  const { error } = await supabase.auth.updateUser(attributes)

  if (error) throw error
}
