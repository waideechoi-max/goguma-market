'use client'

import { deleteProduct } from './actions'

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm('정말 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return
    await deleteProduct(id)
  }

  return (
    <button
      onClick={handleDelete}
      className="btn-cartoon w-full"
      style={{
        fontSize: '1rem',
        background: '#FFF0F0',
        color: 'var(--goguma-red)',
        borderColor: 'var(--goguma-red)',
        boxShadow: '4px 4px 0px var(--goguma-red)',
      }}>
      🗑️ 판매글 삭제
    </button>
  )
}
