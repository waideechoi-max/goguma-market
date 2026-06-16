'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { updateProfile, deleteAvatar } from './profile-actions'

export default function ProfileEditForm({
  userId,
  initialAvatarUrl,
  initialBio,
}: {
  userId: string
  initialAvatarUrl: string | null
  initialBio: string | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [bio, setBio] = useState(initialBio ?? '')
  const [preview, setPreview] = useState<string | null>(null)
  const [newFile, setNewFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('사진 크기는 5MB 이하여야 해요.')
      return
    }
    setNewFile(file)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  function handleRemoveAvatar() {
    setNewFile(null)
    setPreview(null)
    setAvatarUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleCancel() {
    setAvatarUrl(initialAvatarUrl)
    setBio(initialBio ?? '')
    setNewFile(null)
    setPreview(null)
    setError(null)
    setIsOpen(false)
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      let uploadedUrl: string | null = avatarUrl

      if (newFile) {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const ext = newFile.name.split('.').pop()
        const path = `${userId}/${Date.now()}.${ext}`

        // 기존 아바타 삭제
        if (initialAvatarUrl) {
          const oldPath = initialAvatarUrl.split('/avatars/')[1]
          if (oldPath) await supabase.storage.from('avatars').remove([oldPath])
        }

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, newFile, { upsert: true })

        if (uploadError) {
          setError('사진 업로드에 실패했어요.')
          return
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        uploadedUrl = publicUrl
      } else if (avatarUrl === null && initialAvatarUrl !== null) {
        // 사진 삭제 요청
        const result = await deleteAvatar()
        if (result.error) { setError(result.error); return }
        setIsOpen(false)
        return
      }

      const formData = new FormData()
      formData.append('bio', bio)
      if (uploadedUrl !== null) formData.append('avatar_url', uploadedUrl)
      else if (avatarUrl === null) formData.append('avatar_url', '')

      const result = await updateProfile(formData)
      if (result.error) { setError(result.error); return }

      setAvatarUrl(uploadedUrl)
      setNewFile(null)
      setPreview(null)
      setIsOpen(false)
    })
  }

  const displayImage = preview ?? avatarUrl

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-cartoon btn-ghost text-sm"
        style={{ padding: '6px 14px' }}>
        ✏️ 프로필 수정
      </button>
    )
  }

  return (
    <div className="card-cartoon mt-4" style={{ padding: '20px' }}>
      <h3 className="font-black text-base mb-4" style={{ color: 'var(--goguma-dark)' }}>
        프로필 수정
      </h3>

      {error && <div className="error-box mb-3 text-sm">{error}</div>}

      {/* 사진 업로드 */}
      <div className="flex flex-col items-center gap-3 mb-5">
        <div className="relative w-24 h-24">
          {displayImage ? (
            <>
              <Image
                src={displayImage}
                alt="프로필 사진"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-4"
                style={{ borderColor: 'var(--goguma-dark)' }}
              />
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'var(--goguma-dark)', border: '2px solid white' }}>
                ×
              </button>
            </>
          ) : (
            <div
              className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl bg-amber-50 cursor-pointer"
              style={{ borderColor: 'var(--goguma-dark)', borderStyle: 'dashed' }}
              onClick={() => fileRef.current?.click()}>
              🍠
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn-cartoon btn-ghost text-xs"
          style={{ padding: '5px 14px' }}>
          📷 사진 선택
        </button>
        <p className="text-xs" style={{ color: '#bbb' }}>JPG, PNG, GIF · 최대 5MB</p>
      </div>

      {/* 자기소개 */}
      <div className="flex flex-col gap-1 mb-5">
        <label className="text-sm font-black" style={{ color: 'var(--goguma-dark)' }}>
          자기소개
        </label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="자신을 소개해 보세요! (최대 200자)"
          maxLength={200}
          rows={3}
          className="input-cartoon text-sm"
          style={{ resize: 'none' }}
        />
        <span className="text-xs text-right" style={{ color: '#bbb' }}>{bio.length}/200</span>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="btn-cartoon btn-ghost text-sm"
          style={{ padding: '8px 16px' }}>
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="btn-cartoon btn-primary text-sm"
          style={{ padding: '8px 20px', opacity: isPending ? 0.6 : 1 }}>
          {isPending ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
