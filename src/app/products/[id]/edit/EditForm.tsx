'use client'

import { useActionState } from 'react'
import { updateProduct } from '../actions'

const CATEGORIES = ['디지털/가전', '의류/잡화', '가구/인테리어', '도서/음반', '스포츠/레저', '생활/주방', '기타']
const CONDITIONS = [
  { value: '새것같음', label: '새것같음 ✨', desc: '사용감 없음' },
  { value: '상태좋음', label: '상태좋음 👍', desc: '사용했지만 깨끗함' },
  { value: '보통', label: '보통 😊', desc: '사용감 있음' },
  { value: '나쁨', label: '나쁨 🤷', desc: '하자 있음' },
]
const STATUSES = [
  { value: '판매중', label: '판매중', color: 'var(--goguma-green)' },
  { value: '예약중', label: '예약중', color: 'var(--goguma-orange)' },
  { value: '판매완료', label: '판매완료', color: '#aaa' },
]

type Product = {
  id: string
  title: string
  description: string | null
  price: number
  category: string
  condition: string
  status: string
}

export default function EditForm({ product }: { product: Product }) {
  const boundUpdate = updateProduct.bind(null, product.id)
  const [state, action, pending] = useActionState(boundUpdate, null)

  return (
    <form action={action} className="flex flex-col gap-6">
      {state?.error && (
        <div className="error-box">{state.error}</div>
      )}

      {/* 판매 상태 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          판매 상태 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
        </label>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <label key={s.value}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-3 cursor-pointer text-sm font-bold"
              style={{ border: '3px solid var(--goguma-dark)', background: 'white' }}>
              <input
                type="radio"
                name="status"
                value={s.value}
                defaultChecked={product.status === s.value}
                className="w-4 h-4"
                style={{ accentColor: s.color }}
              />
              <span style={{ color: s.color }}>{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 제목 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          제목 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
        </label>
        <input
          name="title"
          type="text"
          className="input-cartoon"
          defaultValue={product.title}
          maxLength={50}
          required
        />
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          카테고리 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
        </label>
        <select name="category" className="input-cartoon" defaultValue={product.category}>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* 가격 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          가격 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
        </label>
        <div className="relative">
          <input
            name="price"
            type="number"
            className="input-cartoon"
            defaultValue={product.price}
            min={0}
            max={99999999}
            required
            style={{ paddingRight: '3.5rem' }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-sm"
            style={{ color: '#aaa' }}>
            원
          </span>
        </div>
      </div>

      {/* 물건 상태 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          물건 상태 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CONDITIONS.map((cond) => (
            <label key={cond.value}
              className="flex items-center gap-3 p-3 rounded-xl border-3 cursor-pointer"
              style={{ border: '3px solid var(--goguma-dark)', background: 'white' }}>
              <input
                type="radio"
                name="condition"
                value={cond.value}
                defaultChecked={product.condition === cond.value}
                className="w-4 h-4 accent-orange-500"
              />
              <div>
                <div className="font-black text-sm">{cond.label}</div>
                <div className="text-xs font-medium" style={{ color: '#aaa' }}>{cond.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 설명 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          설명 <span className="font-normal text-xs" style={{ color: '#aaa' }}>(선택)</span>
        </label>
        <textarea
          name="description"
          className="input-cartoon"
          defaultValue={product.description ?? ''}
          rows={5}
          maxLength={1000}
          style={{ resize: 'none' }}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-cartoon btn-primary w-full"
        style={{ fontSize: '1.1rem', opacity: pending ? 0.7 : 1 }}>
        {pending ? '저장 중... ⏳' : '✅ 수정 완료'}
      </button>
    </form>
  )
}
