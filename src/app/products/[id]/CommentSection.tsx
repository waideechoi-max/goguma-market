'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { addComment, updateComment, deleteComment, type CommentRow } from './comment-actions'

export default function CommentSection({
  productId,
  initialComments,
  currentUserId,
}: {
  productId: string
  initialComments: CommentRow[]
  currentUserId: string | null
}) {
  const [comments, setComments] = useState<CommentRow[]>(initialComments)
  const [newContent, setNewContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!newContent.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await addComment(productId, newContent.trim())
      if (result.error) { setError(result.error); return }
      if (result.comment) {
        setComments(prev => [...prev, result.comment!])
        setNewContent('')
      }
    })
  }

  function startEdit(comment: CommentRow) {
    setEditingId(comment.id)
    setEditContent(comment.content)
    setError(null)
  }

  function handleUpdate(id: string) {
    if (!editContent.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await updateComment(id, editContent.trim())
      if (result.error) { setError(result.error); return }
      setComments(prev => prev.map(c => c.id === id ? { ...c, content: editContent.trim() } : c))
      setEditingId(null)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('댓글을 삭제할까요?')) return
    setError(null)
    startTransition(async () => {
      const result = await deleteComment(id)
      if (result.error) { setError(result.error); return }
      setComments(prev => prev.filter(c => c.id !== id))
    })
  }

  return (
    <div className="card-cartoon">
      <h2 className="font-black text-lg mb-4" style={{ color: 'var(--goguma-dark)' }}>
        💬 댓글 {comments.length}개
      </h2>

      {error && <div className="error-box mb-3 text-sm">{error}</div>}

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm font-medium text-center py-6" style={{ color: '#ccc' }}>
          아직 댓글이 없어요. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {comments.map(comment => (
            <div key={comment.id} className="p-3 rounded-xl"
              style={{ background: '#fafafa', border: '1.5px solid #eee' }}>
              {/* 댓글 헤더 */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black" style={{ color: 'var(--goguma-dark)' }}>
                  🍠 {comment.nickname}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: '#ccc' }}>
                    {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  {currentUserId === comment.user_id && editingId !== comment.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(comment)}
                        className="text-xs font-bold"
                        style={{ color: '#aaa' }}>
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        disabled={isPending}
                        className="text-xs font-bold"
                        style={{ color: 'var(--goguma-red)' }}>
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 댓글 내용 or 수정 폼 */}
              {editingId === comment.id ? (
                <div className="flex flex-col gap-2 mt-2">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    maxLength={500}
                    rows={2}
                    className="input-cartoon text-sm"
                    style={{ resize: 'none', padding: '8px 12px' }}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn-cartoon btn-ghost text-xs"
                      style={{ padding: '5px 14px' }}>
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(comment.id)}
                      disabled={isPending || !editContent.trim()}
                      className="btn-cartoon btn-primary text-xs"
                      style={{ padding: '5px 14px', opacity: isPending ? 0.6 : 1 }}>
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium whitespace-pre-line mt-1" style={{ color: '#444' }}>
                  {comment.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 새 댓글 입력 */}
      {currentUserId ? (
        <div className="flex flex-col gap-2">
          <div className="border-t-2 border-dashed pt-4" style={{ borderColor: '#eee' }} />
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="댓글을 입력해 주세요... (최대 500자)"
            maxLength={500}
            rows={2}
            className="input-cartoon text-sm"
            style={{ resize: 'none' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#ccc' }}>{newContent.length}/500</span>
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending || !newContent.trim()}
              className="btn-cartoon btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.9rem',
                opacity: isPending || !newContent.trim() ? 0.5 : 1 }}>
              {isPending ? '등록 중...' : '💬 댓글 달기'}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t-2 border-dashed pt-4 text-center" style={{ borderColor: '#eee' }}>
          <p className="text-sm font-medium" style={{ color: '#aaa' }}>
            댓글을 달려면{' '}
            <Link href="/auth/login" className="font-black" style={{ color: 'var(--goguma-orange)' }}>
              로그인
            </Link>
            이 필요해요
          </p>
        </div>
      )}
    </div>
  )
}
