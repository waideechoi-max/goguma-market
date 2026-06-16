'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const bio = formData.get('bio') as string | null
  const avatarUrl = formData.get('avatar_url') as string | null

  const updates: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }
  if (bio !== null) updates.bio = bio
  if (avatarUrl !== null) updates.avatar_url = avatarUrl

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: '프로필 저장에 실패했어요.' }

  revalidatePath('/dashboard')
  return {}
}

export async function deleteAvatar(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.avatar_url) {
    const path = profile.avatar_url.split(`/avatars/`)[1]
    if (path) {
      await supabase.storage.from('avatars').remove([path])
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: '사진 삭제에 실패했어요.' }

  revalidatePath('/dashboard')
  return {}
}
