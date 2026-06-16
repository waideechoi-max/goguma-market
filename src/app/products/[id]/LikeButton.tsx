'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike } from './actions'

export default function LikeButton({
  productId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: {
  productId: string
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }

    const nextLiked = !liked
    setLiked(nextLiked)
    setCount(prev => nextLiked ? prev + 1 : prev - 1)

    startTransition(async () => {
      const result = await toggleLike(productId)
      if (result?.error) {
        setLiked(!nextLiked)
        setCount(prev => nextLiked ? prev - 1 : prev + 1)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all"
      style={{
        border: `2px solid ${liked ? '#e53e3e' : '#ddd'}`,
        background: liked ? '#fff5f5' : 'white',
        color: liked ? '#e53e3e' : '#999',
        opacity: isPending ? 0.7 : 1,
        cursor: isPending ? 'default' : 'pointer',
      }}>
      <span className="text-lg leading-none">{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  )
}
