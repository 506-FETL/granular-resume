import supabase from '../client'

export async function getUserProfile() {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) return null

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

  if (error) console.log(error)

  return data.user
}

export async function changeAvatar(file: File) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('未登陆')

  const path = user.id

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
