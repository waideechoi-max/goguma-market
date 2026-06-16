'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function urlToStoragePath(url: string): string {
  // https://....supabase.co/storage/v1/object/public/product-images/USER_ID/FILE
  const marker = '/product-images/'
  const idx = url.indexOf(marker)
  return idx !== -1 ? url.slice(idx + marker.length) : ''
}

export async function updateProduct(id: string, prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: product } = await supabase.from('products').select('user_id').eq('id', id).single()
  if (!product || product.user_id !== user.id) return { error: '수정 권한이 없어요.' }

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const priceRaw = formData.get('price') as string
  const category = formData.get('category') as string
  const condition = formData.get('condition') as string
  const status = formData.get('status') as string
  const imageUrls = formData.getAll('image_url') as string[]
  const deleteUrls = formData.getAll('delete_url') as string[]

  if (!title) return { error: '제목을 입력해 주세요.' }
  if (!priceRaw || isNaN(Number(priceRaw))) return { error: '가격을 숫자로 입력해 주세요.' }
  if (Number(priceRaw) < 0) return { error: '가격은 0원 이상이어야 해요.' }

  // Storage에서 삭제 표시된 파일 제거
  if (deleteUrls.length > 0) {
    const paths = deleteUrls.map(urlToStoragePath).filter(Boolean)
    if (paths.length > 0) {
      await supabase.storage.from('product-images').remove(paths)
    }
  }

  const { error } = await supabase.from('products').update({
    title,
    description: description || null,
    price: Number(priceRaw),
    category,
    condition,
    status,
    image_urls: imageUrls,
  }).eq('id', id)

  if (error) return { error: '저장 중 오류가 발생했어요. 다시 시도해 주세요.' }

  revalidatePath(`/products/${id}`)
  redirect(`/products/${id}?updated=1`)
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: product } = await supabase
    .from('products')
    .select('user_id, image_urls')
    .eq('id', id)
    .single()
  if (!product || product.user_id !== user.id) return { error: '삭제 권한이 없어요.' }

  // Storage에서 이미지 파일 모두 삭제
  if (product.image_urls && product.image_urls.length > 0) {
    const paths = (product.image_urls as string[]).map(urlToStoragePath).filter(Boolean)
    if (paths.length > 0) {
      await supabase.storage.from('product-images').remove(paths)
    }
  }

  await supabase.from('products').delete().eq('id', id)

  revalidatePath('/products')
  redirect('/products?deleted=1')
}
