import { getCurrentUser } from '@/lib/supabase/user'

export type SupabaseUser = Awaited<ReturnType<typeof getCurrentUser>> | null
