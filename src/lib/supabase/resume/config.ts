import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import supabase from '../client'
import { getCurrentUser } from '../user'

export async function updateResumeConfig(resumeId: string, data: any) {
  const user = await getCurrentUser()

  const { error } = await supabase.from('resume_config').update(data).eq('id', resumeId).eq('user_id', user.id)

  if (error) throw error
}

export async function subscribeToResumeConfigUpdates(
  callback: (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => void,
) {
  const user = await getCurrentUser()

  const channel = supabase
    .channel(`resume_config_changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'resume_config', filter: `user_id=eq.${user.id}` },
      (payload) => {
        callback(payload)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
