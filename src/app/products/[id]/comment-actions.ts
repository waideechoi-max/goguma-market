'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CommentRow = {
  id: string
  content: string
  created_at: string
  user_id: string
  nickname: string
}

export async function addComment(productId: string, content: string): Promise<{ comment?: CommentRow; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .single()

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ product_id: productId, user_id: user.id, content })
    .select('id, content, created_at, user_id')
    .single()

  if (error || !comment) return { error: '댓글 등록에 실패했어요.' }

  revalidatePath(`/products/${productId}`)
  return {
    comment: {
      ...comment,
      nickname: profile?.nickname ?? '고구마 이웃',
    },
  }
}

export async function updateComment(commentId: string, content: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { data: existing } = await supabase
    .from('comments')
    .select('user_id, product_id')
    .eq('id', commentId)
    .single()

  if (!existing || existing.user_id !== user.id) return { error: '수정 권한이 없어요.' }

  const { error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)

  if (error) return { error: '댓글 수정에 실패했어요.' }

  revalidatePath(`/products/${existing.product_id}`)
  return {}
}

export async function deleteComment(commentId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { data: existing } = await supabase
    .from('comments')
    .select('user_id, product_id')
    .eq('id', commentId)
    .single()

  if (!existing || existing.user_id !== user.id) return { error: '삭제 권한이 없어요.' }

  const { error } = await supabase.from('comments').delete().eq('id', commentId)

  if (error) return { error: '댓글 삭제에 실패했어요.' }

  revalidatePath(`/products/${existing.product_id}`)
  return {}
}
