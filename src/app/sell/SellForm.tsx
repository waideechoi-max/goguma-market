'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { createProduct } from './actions'

const CATEGORIES = ['디지털/가전', '의류/잡화', '가구/인테리어', '도서/음반', '스포츠/레저', '생활/주방', '기타']
const CONDITIONS = [
  { value: '새것같음', label: '새것같음 ✨', desc: '사용감 없음' },
  { value: '상태좋음', label: '상태좋음 👍', desc: '사용했지만 깨끗함' },
  { value: '보통', label: '보통 😊', desc: '사용감 있음' },
  { value: '나쁨', label: '나쁨 🤷', desc: '하자 있음' },
]

export default function SellForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const remaining = 5 - files.length
    const newFiles = selected.slice(0, remaining)
    setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
    setFiles(prev => [...prev, ...newFiles])
    e.target.value = ''
  }

  function removeImage(i: number) {
    URL.revokeObjectURL(previews[i])
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    if (files.length > 0) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('로그인이 필요해요.'); return }

      for (const file of files) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file)
        if (!uploadError) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(path)
          formData.append('image_url', data.publicUrl)
        }
      }
    }

    startTransition(async () => {
      const result = await createProduct(null, formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && <div className="error-box">{error}</div>}

      {/* 사진 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          사진 <span className="font-normal text-xs" style={{ color: '#aaa' }}>(선택, 최대 5장)</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {previews.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '2px solid var(--goguma-dark)' }}>
              <Image src={url} alt={`사진 ${i + 1}`} fill className="object-cover" unoptimized />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black leading-none"
                style={{ background: 'rgba(44,24,16,0.85)', color: 'white', lineHeight: 1 }}>
                ×
              </button>
            </div>
          ))}
          {files.length < 5 && (
            <label className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer flex-shrink-0"
              style={{ border: '2px dashed #ccc', background: '#fafafa' }}>
              <span className="text-2xl">📷</span>
              <span className="text-xs font-medium" style={{ color: '#aaa' }}>{files.length}/5</span>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden" onChange={handleFileChange} />
            </label>
          )}
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

      <button
        type="submit"
        disabled={isPending}
        className="btn-cartoon btn-primary w-full"
        style={{ fontSize: '1.1rem', opacity: isPending ? 0.7 : 1 }}>
        {isPending ? '등록 중... ⏳' : '📦 판매글 올리기'}
      </button>
    </form>
  )
}
