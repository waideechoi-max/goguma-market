import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '../auth/actions'

const CATEGORY_EMOJI: Record<string, string> = {
  '디지털/가전': '📱',
  '의류/잡화': '👗',
  '가구/인테리어': '🛋️',
  '도서/음반': '📚',
  '스포츠/레저': '⚽',
  '생활/주방': '🍳',
  '기타': '📦',
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  '판매중': { label: '판매중', bg: '#E8F5E9', color: 'var(--goguma-green)' },
  '예약중': { label: '예약중', bg: '#FFF3E0', color: 'var(--goguma-orange)' },
  '판매완료': { label: '판매완료', bg: '#F5F5F5', color: '#aaa' },
}

function formatPrice(price: number) {
  return price === 0 ? '나눔 🤝' : `${price.toLocaleString('ko-KR')}원`
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>
}) {
  const { deleted } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, category, condition, status, created_at, user_id')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--goguma-cream)' }}>
      {/* 상단 네비게이션 */}
      <nav className="bg-white border-b-4 px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--goguma-dark)' }}>
        <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="text-3xl">🍠</span>
          <span className="text-xl font-black" style={{ color: 'var(--goguma-dark)' }}>고구마마켓</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="btn-cartoon btn-ghost"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                내 마켓
              </Link>
              <form action={signOut}>
                <button type="submit" className="btn-cartoon btn-ghost"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth/login" className="btn-cartoon btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              로그인
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {deleted === '1' && (
          <div className="error-box mb-6 text-center" style={{ background: '#FFF3E0', borderColor: 'var(--goguma-orange)', color: 'var(--goguma-orange)' }}>
            🗑️ 판매글이 삭제됐어요.
          </div>
        )}

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--goguma-dark)' }}>
              🛍️ 판매 목록
            </h1>
            <p className="text-sm font-medium mt-1" style={{ color: '#888' }}>
              {products?.length ?? 0}개의 물건이 있어요
            </p>
          </div>
          {user && (
            <Link href="/sell" className="btn-cartoon btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
              + 팔기
            </Link>
          )}
        </div>

        {/* 판매글 없을 때 */}
        {(!products || products.length === 0) && (
          <div className="card-cartoon text-center py-16">
            <div className="text-5xl mb-4">🍠</div>
            <p className="font-black text-lg" style={{ color: 'var(--goguma-dark)' }}>
              아직 판매글이 없어요
            </p>
            <p className="text-sm font-medium mt-2 mb-6" style={{ color: '#aaa' }}>
              첫 번째 판매글을 올려보세요!
            </p>
            {user && (
              <Link href="/sell" className="btn-cartoon btn-primary">
                📦 판매글 올리기
              </Link>
            )}
          </div>
        )}

        {/* 판매글 목록 */}
        <div className="flex flex-col gap-4">
          {products?.map((product) => {
            const badge = STATUS_BADGE[product.status] ?? STATUS_BADGE['판매중']
            const emoji = CATEGORY_EMOJI[product.category] ?? '📦'
            return (
              <Link key={product.id} href={`/products/${product.id}`}
                className="card-cartoon flex items-center gap-4 hover:scale-[1.01] transition-transform"
                style={{ padding: '20px' }}>
                {/* 카테고리 아이콘 */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
                  style={{ background: 'var(--goguma-cream)', border: '2px solid #eee' }}>
                  {emoji}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: badge.bg, color: badge.color, border: `1.5px solid ${badge.color}` }}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-medium" style={{ color: '#bbb' }}>
                      {product.category}
                    </span>
                  </div>
                  <p className="font-black text-base truncate" style={{ color: 'var(--goguma-dark)' }}>
                    {product.title}
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: '#aaa' }}>
                    {product.condition} · {new Date(product.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {/* 가격 */}
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-base" style={{ color: 'var(--goguma-orange)' }}>
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
