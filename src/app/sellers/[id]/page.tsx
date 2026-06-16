import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { signOut } from '../../auth/actions'

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

export default async function SellerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url, bio')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, category, condition, status, created_at, image_urls')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const isMe = user?.id === id

  return (
    <div className="min-h-screen" style={{ background: 'var(--goguma-cream)' }}>
      {/* 상단 네비게이션 */}
      <nav className="bg-white border-b-4 px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--goguma-dark)' }}>
        <div className="flex items-center gap-3">
          <Link href="/products" className="btn-cartoon btn-ghost"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            ← 목록
          </Link>
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="text-2xl">🍠</span>
            <span className="text-lg font-black" style={{ color: 'var(--goguma-dark)' }}>고구마마켓</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <form action={signOut}>
              <button type="submit" className="btn-cartoon btn-ghost"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                로그아웃
              </button>
            </form>
          ) : (
            <Link href="/auth/login" className="btn-cartoon btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              로그인
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-10">
        {/* 판매자 프로필 카드 */}
        <div className="card-cartoon mb-8">
          <div className="flex items-start gap-4">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.nickname ?? '판매자'}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-4 flex-shrink-0"
                style={{ borderColor: 'var(--goguma-dark)' }}
              />
            ) : (
              <div className="text-5xl w-16 h-16 rounded-full border-4 flex items-center justify-center bg-amber-50 flex-shrink-0"
                style={{ borderColor: 'var(--goguma-dark)' }}>
                🍠
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black" style={{ color: 'var(--goguma-dark)' }}>
                  {profile.nickname ?? '고구마 이웃'}
                </h1>
                {isMe && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: '#fff3e0', color: 'var(--goguma-orange)', border: '1.5px solid var(--goguma-orange)' }}>
                    나
                  </span>
                )}
              </div>
              {profile.bio ? (
                <p className="text-sm font-medium mt-2 whitespace-pre-line" style={{ color: '#555' }}>
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm mt-2" style={{ color: '#ccc' }}>자기소개가 없어요.</p>
              )}
            </div>
          </div>
          {isMe && (
            <div className="mt-4 pt-4 border-t-2 border-dashed" style={{ borderColor: '#eee' }}>
              <Link href="/dashboard" className="btn-cartoon btn-ghost text-sm w-full text-center"
                style={{ padding: '8px', display: 'block' }}>
                ✏️ 프로필 수정하러 가기
              </Link>
            </div>
          )}
        </div>

        {/* 판매글 목록 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black" style={{ color: 'var(--goguma-dark)' }}>
            판매 중인 물건 <span style={{ color: 'var(--goguma-orange)' }}>{products?.length ?? 0}</span>개
          </h2>
        </div>

        {(!products || products.length === 0) ? (
          <div className="card-cartoon text-center py-14">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-black" style={{ color: 'var(--goguma-dark)' }}>
              {isMe ? '아직 판매글이 없어요' : '판매 중인 물건이 없어요'}
            </p>
            {isMe && (
              <Link href="/sell" className="btn-cartoon btn-primary mt-4 inline-block">
                + 첫 판매글 올리기
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((product) => {
              const badge = STATUS_BADGE[product.status] ?? STATUS_BADGE['판매중']
              const emoji = CATEGORY_EMOJI[product.category] ?? '📦'
              return (
                <Link key={product.id} href={`/products/${product.id}`}
                  className="card-cartoon flex items-center gap-4 hover:scale-[1.01] transition-transform"
                  style={{ padding: '16px 20px' }}>
                  {/* 썸네일 */}
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl"
                    style={{ background: 'var(--goguma-cream)', border: '2px solid #eee' }}>
                    {product.image_urls?.[0] ? (
                      <Image
                        src={product.image_urls[0]}
                        alt={product.title}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : emoji}
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
        )}
      </main>
    </div>
  )
}
