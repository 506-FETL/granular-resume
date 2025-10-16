import supabase from '../client'

export async function getUserProfile() {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) throw userErr ?? new Error('未登陆')

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, updated_at')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getSession()

  if (error) console.log(error)

  return data
}

export async function changeAvatar(file: File) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('未登陆')

  const path = `${user.id}/${Date.now()}-${file.name}`

  const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (upErr) throw upErr

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const avatarUrl = data.publicUrl

  const { error: profErr } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (profErr) throw profErr

  return avatarUrl
}
