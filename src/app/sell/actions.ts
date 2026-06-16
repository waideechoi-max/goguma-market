'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createProduct(prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const priceRaw = formData.get('price') as string
  const category = formData.get('category') as string
  const condition = formData.get('condition') as string

  if (!title) return { error: '제목을 입력해 주세요.' }
  if (!priceRaw || isNaN(Number(priceRaw))) return { error: '가격을 숫자로 입력해 주세요.' }
  if (Number(priceRaw) < 0) return { error: '가격은 0원 이상이어야 해요.' }

  const imageUrls = formData.getAll('image_url') as string[]

  const { error } = await supabase.from('products').insert({
    user_id: user.id,
    title,
    description: description || null,
    price: Number(priceRaw),
    category,
    condition,
    image_urls: imageUrls,
  })

  if (error) {
    return { error: '저장 중 오류가 발생했어요. 다시 시도해 주세요.' }
  }

  redirect('/dashboard?sold=1')
}
