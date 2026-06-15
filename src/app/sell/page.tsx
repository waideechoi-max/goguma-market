import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SellForm from './SellForm'

export default async function SellPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--goguma-cream)' }}>
      {/* 상단 네비게이션 */}
      <nav className="bg-white border-b-4 px-6 py-4 flex items-center gap-4"
        style={{ borderColor: 'var(--goguma-dark)' }}>
        <Link href="/dashboard"
          className="btn-cartoon btn-ghost"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          ← 뒤로
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍠</span>
          <span className="text-lg font-black" style={{ color: 'var(--goguma-dark)' }}>
            판매글 작성
          </span>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="card-cartoon">
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">📦</div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--goguma-dark)' }}>
              내 물건 팔기
            </h1>
            <p className="text-sm font-medium mt-1" style={{ color: '#888' }}>
              팔고 싶은 물건 정보를 입력해 주세요!
            </p>
          </div>

          <SellForm />
        </div>
      </main>
    </div>
  )
}
