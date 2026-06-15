'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nickname = formData.get('nickname') as string
  const username = email.split('@')[0]

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname, username },
    },
  })

  if (error) {
    const msg = error.message || '가입 중 오류가 발생했습니다. 다시 시도해 주세요.'
    redirect(`/auth/signup?error=${encodeURIComponent(msg)}`)
  }

  redirect('/dashboard?welcome=1')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message || '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.'
    redirect(`/auth/login?error=${encodeURIComponent(msg)}`)
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
