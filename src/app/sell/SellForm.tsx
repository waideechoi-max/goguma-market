'use client'

import { useActionState } from 'react'
import { createProduct } from './actions'

const CATEGORIES = ['디지털/가전', '의류/잡화', '가구/인테리어', '도서/음반', '스포츠/레저', '생활/주방', '기타']
const CONDITIONS = [
  { value: '새것같음', label: '새것같음 ✨', desc: '사용감 없음' },
  { value: '상태좋음', label: '상태좋음 👍', desc: '사용했지만 깨끗함' },
  { value: '보통', label: '보통 😊', desc: '사용감 있음' },
  { value: '나쁨', label: '나쁨 🤷', desc: '하자 있음' },
]

export default function SellForm() {
  const [state, action, pending] = useActionState(createProduct, null)

  return (
    <form action={action} className="flex flex-col gap-6">
      {state?.error && (
        <div className="error-box">{state.error}</div>
      )}

      {/* 제목 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          제목 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
        </label>
        <input
          name="title"
          type="text"
          className="input-cartoon"
          placeholder="예) 아이폰 15 팔아요"
          maxLength={50}
          required
        />
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          카테고리 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
        </label>
        <select name="category" className="input-cartoon" defaultValue="기타">
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
            placeholder="0"
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
          {CONDITIONS.map((cond, i) => (
            <label key={cond.value}
              className="flex items-center gap-3 p-3 rounded-xl border-3 cursor-pointer transition-all"
              style={{ border: '3px solid var(--goguma-dark)', background: 'white' }}>
              <input
                type="radio"
                name="condition"
                value={cond.value}
                defaultChecked={i === 1}
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
          placeholder="물건에 대해 자세히 설명해 주세요. (브랜드, 구매 시기, 사용감 등)"
          rows={5}
          maxLength={1000}
          style={{ resize: 'none' }}
        />
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={pending}
        className="btn-cartoon btn-primary w-full"
        style={{ fontSize: '1.1rem', opacity: pending ? 0.7 : 1 }}>
        {pending ? '등록 중... ⏳' : '📦 판매글 올리기'}
      </button>
    </form>
  )
}
