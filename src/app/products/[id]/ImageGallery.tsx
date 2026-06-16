'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ImageGallery({ urls, title }: { urls: string[]; title: string }) {
  const [selected, setSelected] = useState(0)

  if (urls.length === 0) return null

  return (
    <div className="mb-6">
      {/* 메인 이미지 */}
      <div className="card-cartoon overflow-hidden p-0" style={{ aspectRatio: '4/3' }}>
        <div className="relative w-full h-full" style={{ minHeight: '240px' }}>
          <Image
            src={urls[selected]}
            alt={title}
            fill
            className="object-cover transition-opacity duration-200"
            priority
          />
        </div>
      </div>

      {/* 썸네일 목록 */}
      {urls.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all"
              style={{
                border: i === selected
                  ? '3px solid var(--goguma-orange)'
                  : '2px solid #ddd',
                opacity: i === selected ? 1 : 0.6,
              }}>
              <Image src={url} alt={`사진 ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
