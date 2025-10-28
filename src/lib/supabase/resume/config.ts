import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import supabase from '../client'
import { getCurrentUser } from '../user'

const camelToSnakeKeyMap: Record<string, string> = {
  jobIntent: 'job_intent',
  applicationInfo: 'application_info',
  eduBackground: 'edu_background',
  workExperience: 'work_experience',
  internshipExperience: 'internship_experience',
  campusExperience: 'campus_experience',
  projectExperience: 'project_experience',
  skillSpecialty: 'skill_specialty',
  honorsCertificates: 'honors_certificates',
  selfEvaluation: 'self_evaluation',
  lastAutomergeSync: 'last_automerge_sync',
  totalChangesCount: 'total_changes_count',
  documentVersion: 'document_version',
}

function normalizeResumePayload(data: Record<string, any>) {
  const normalized: Record<string, any> = {}

  Object.entries(data).forEach(([key, value]) => {
    const mappedKey = camelToSnakeKeyMap[key] ?? key
    normalized[mappedKey] = value
  })

  return normalized
}

export async function updateResumeConfig(resumeId: string, data: Record<string, any>) {
  const user = await getCurrentUser()

  if (!user) throw new Error('用户未登陆')

  const payload = normalizeResumePayload(data)

  const { error } = await supabase
    .from('resume_config')
    .update(payload)
    .eq('resume_id', resumeId)
    .eq('user_id', user.id)

  if (error) throw error
}

export async function subscribeToResumeConfigUpdates(
  callback: (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => void,
) {
  const user = await getCurrentUser()

  if (!user) throw new Error('用户未登陆')

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
