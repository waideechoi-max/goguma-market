'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
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
  image_urls: string[] | null
}

export default function EditForm({ product }: { product: Product }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const initialUrls = product.image_urls ?? []
  const [keptUrls, setKeptUrls] = useState<string[]>(initialUrls)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const totalCount = keptUrls.length + newFiles.length

  function removeExisting(url: string) {
    setKeptUrls(prev => prev.filter(u => u !== url))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const remaining = 5 - totalCount
    const toAdd = selected.slice(0, remaining)
    setNewPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
    setNewFiles(prev => [...prev, ...toAdd])
    e.target.value = ''
  }

  function removeNew(i: number) {
    URL.revokeObjectURL(newPreviews[i])
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i))
    setNewFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    // 삭제할 URL (원래 있었지만 유저가 X 누른 것들)
    const deletedUrls = initialUrls.filter(u => !keptUrls.includes(u))
    deletedUrls.forEach(url => formData.append('delete_url', url))

    // 유지할 기존 URL
    keptUrls.forEach(url => formData.append('image_url', url))

    // 새 파일 업로드
    if (newFiles.length > 0) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('로그인이 필요해요.'); return }

      for (const file of newFiles) {
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
      const result = await updateProduct(product.id, null, formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && <div className="error-box">{error}</div>}

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

      {/* 사진 */}
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm" style={{ color: 'var(--goguma-dark)' }}>
          사진 <span className="font-normal text-xs" style={{ color: '#aaa' }}>(최대 5장)</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {/* 기존 이미지 */}
          {keptUrls.map((url, i) => (
            <div key={`existing-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '2px solid var(--goguma-dark)' }}>
              <Image src={url} alt={`기존 사진 ${i + 1}`} fill className="object-cover" />
              <button type="button" onClick={() => removeExisting(url)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black leading-none"
                style={{ background: 'rgba(44,24,16,0.85)', color: 'white', lineHeight: 1 }}>
                ×
              </button>
            </div>
          ))}
          {/* 새 이미지 미리보기 */}
          {newPreviews.map((url, i) => (
            <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '2px solid var(--goguma-orange)' }}>
              <Image src={url} alt={`새 사진 ${i + 1}`} fill className="object-cover" unoptimized />
              <button type="button" onClick={() => removeNew(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black leading-none"
                style={{ background: 'rgba(255,107,53,0.9)', color: 'white', lineHeight: 1 }}>
                ×
              </button>
            </div>
          ))}
          {/* 추가 버튼 */}
          {totalCount < 5 && (
            <label className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer flex-shrink-0"
              style={{ border: '2px dashed #ccc', background: '#fafafa' }}>
              <span className="text-2xl">📷</span>
              <span className="text-xs font-medium" style={{ color: '#aaa' }}>{totalCount}/5</span>
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
        disabled={isPending}
        className="btn-cartoon btn-primary w-full"
        style={{ fontSize: '1.1rem', opacity: isPending ? 0.7 : 1 }}>
        {isPending ? '저장 중... ⏳' : '✅ 수정 완료'}
      </button>
    </form>
  )
}
