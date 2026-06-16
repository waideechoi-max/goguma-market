'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { addComment, updateComment, deleteComment, type CommentRow } from './comment-actions'

// 댓글 하나 (수정/삭제/대댓글 버튼 포함)
function CommentItem({
  comment,
  currentUserId,
  isReply,
  onReply,
  onEdit,
  onDelete,
}: {
  comment: CommentRow
  currentUserId: string | null
  isReply: boolean
  onReply: (id: string, nickname: string) => void
  onEdit: (comment: CommentRow) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{
        background: isReply ? '#f5f0ff' : '#fafafa',
        border: `1.5px solid ${isReply ? '#e0d5f5' : '#eee'}`,
        marginLeft: isReply ? '20px' : '0',
        borderLeft: isReply ? '3px solid #c4b0e8' : undefined,
      }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black" style={{ color: 'var(--goguma-dark)' }}>
          {isReply ? '↩ ' : '🍠 '}{comment.nickname}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: '#ccc' }}>
            {new Date(comment.created_at).toLocaleDateString('ko-KR')}
          </span>
          {!isReply && currentUserId && (
            <button
              type="button"
              onClick={() => onReply(comment.id, comment.nickname)}
              className="text-xs font-bold"
              style={{ color: '#9b7ed4' }}>
              답글
            </button>
          )}
          {currentUserId === comment.user_id && (
            <>
              <button
                type="button"
                onClick={() => onEdit(comment)}
                className="text-xs font-bold"
                style={{ color: '#aaa' }}>
                수정
              </button>
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="text-xs font-bold"
                style={{ color: 'var(--goguma-red)' }}>
                삭제
              </button>
            </>
          )}
        </div>
      </div>
      <p className="text-sm font-medium whitespace-pre-line mt-1" style={{ color: '#444' }}>
        {comment.content}
      </p>
    </div>
  )
}

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
  const [replyingTo, setReplyingTo] = useState<{ id: string; nickname: string } | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingComment, setEditingComment] = useState<CommentRow | null>(null)
  const [editContent, setEditContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const topLevel = comments.filter(c => c.parent_id === null)
  const repliesOf = (parentId: string) => comments.filter(c => c.parent_id === parentId)
  const totalCount = comments.length

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

  function handleReply() {
    if (!replyContent.trim() || !replyingTo) return
    setError(null)
    startTransition(async () => {
      const result = await addComment(productId, replyContent.trim(), replyingTo.id)
      if (result.error) { setError(result.error); return }
      if (result.comment) {
        setComments(prev => [...prev, result.comment!])
        setReplyContent('')
        setReplyingTo(null)
      }
    })
  }

  function startEdit(comment: CommentRow) {
    setEditingComment(comment)
    setEditContent(comment.content)
    setError(null)
    setReplyingTo(null)
  }

  function handleUpdate() {
    if (!editContent.trim() || !editingComment) return
    setError(null)
    startTransition(async () => {
      const result = await updateComment(editingComment.id, editContent.trim())
      if (result.error) { setError(result.error); return }
      setComments(prev => prev.map(c =>
        c.id === editingComment.id ? { ...c, content: editContent.trim() } : c
      ))
      setEditingComment(null)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('댓글을 삭제할까요?')) return
    setError(null)
    startTransition(async () => {
      const result = await deleteComment(id)
      if (result.error) { setError(result.error); return }
      // 대댓글도 함께 제거
      setComments(prev => prev.filter(c => c.id !== id && c.parent_id !== id))
    })
  }

  return (
    <div className="card-cartoon">
      <h2 className="font-black text-lg mb-4" style={{ color: 'var(--goguma-dark)' }}>
        💬 댓글 {totalCount}개
      </h2>

      {error && <div className="error-box mb-3 text-sm">{error}</div>}

      {/* 댓글 목록 */}
      {topLevel.length === 0 ? (
        <p className="text-sm font-medium text-center py-6" style={{ color: '#ccc' }}>
          아직 댓글이 없어요. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {topLevel.map(comment => (
            <div key={comment.id} className="flex flex-col gap-2">
              {/* 수정 중인 댓글 */}
              {editingComment?.id === comment.id ? (
                <div className="p-3 rounded-xl flex flex-col gap-2"
                  style={{ background: '#fafafa', border: '1.5px solid #eee' }}>
                  <span className="text-xs font-black" style={{ color: 'var(--goguma-dark)' }}>
                    🍠 {comment.nickname}
                  </span>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    maxLength={500}
                    rows={2}
                    className="input-cartoon text-sm"
                    style={{ resize: 'none', padding: '8px 12px' }}
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditingComment(null)}
                      className="btn-cartoon btn-ghost text-xs" style={{ padding: '5px 14px' }}>
                      취소
                    </button>
                    <button type="button" onClick={handleUpdate}
                      disabled={isPending || !editContent.trim()}
                      className="btn-cartoon btn-primary text-xs"
                      style={{ padding: '5px 14px', opacity: isPending ? 0.6 : 1 }}>
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <CommentItem
                  comment={comment}
                  currentUserId={currentUserId}
                  isReply={false}
                  onReply={(id, nickname) => {
                    setReplyingTo({ id, nickname })
                    setEditingComment(null)
                  }}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                />
              )}

              {/* 대댓글 목록 */}
              {repliesOf(comment.id).map(reply => (
                editingComment?.id === reply.id ? (
                  <div key={reply.id} className="p-3 rounded-xl flex flex-col gap-2 ml-5"
                    style={{ background: '#f5f0ff', border: '1.5px solid #e0d5f5', borderLeft: '3px solid #c4b0e8' }}>
                    <span className="text-xs font-black" style={{ color: 'var(--goguma-dark)' }}>
                      ↩ {reply.nickname}
                    </span>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      maxLength={500}
                      rows={2}
                      className="input-cartoon text-sm"
                      style={{ resize: 'none', padding: '8px 12px' }}
                    />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingComment(null)}
                        className="btn-cartoon btn-ghost text-xs" style={{ padding: '5px 14px' }}>
                        취소
                      </button>
                      <button type="button" onClick={handleUpdate}
                        disabled={isPending || !editContent.trim()}
                        className="btn-cartoon btn-primary text-xs"
                        style={{ padding: '5px 14px', opacity: isPending ? 0.6 : 1 }}>
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    isReply={true}
                    onReply={() => {}}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                )
              ))}

              {/* 답글 입력창 */}
              {replyingTo?.id === comment.id && currentUserId && (
                <div className="flex flex-col gap-2 p-3 rounded-xl ml-5"
                  style={{ background: '#f5f0ff', border: '1.5px solid #c4b0e8' }}>
                  <span className="text-xs font-bold" style={{ color: '#9b7ed4' }}>
                    ↩ {replyingTo.nickname} 님에게 답글
                  </span>
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="답글을 입력해 주세요..."
                    maxLength={500}
                    rows={2}
                    className="input-cartoon text-sm"
                    style={{ resize: 'none' }}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => { setReplyingTo(null); setReplyContent('') }}
                      className="btn-cartoon btn-ghost text-xs" style={{ padding: '5px 14px' }}>
                      취소
                    </button>
                    <button type="button" onClick={handleReply}
                      disabled={isPending || !replyContent.trim()}
                      className="btn-cartoon btn-primary text-xs"
                      style={{ padding: '5px 14px', opacity: isPending || !replyContent.trim() ? 0.5 : 1 }}>
                      답글 달기
                    </button>
                  </div>
                </div>
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
