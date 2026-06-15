import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { signOut } from '../../auth/actions'
import DeleteButton from './DeleteButton'

const CATEGORY_EMOJI: Record<string, string> = {
  '디지털/가전': '📱',
  '의류/잡화': '👗',
  '가구/인테리어': '🛋️',
  '도서/음반': '📚',
  '스포츠/레저': '⚽',
  '생활/주방': '🍳',
  '기타': '📦',
}

const CONDITION_DESC: Record<string, string> = {
  '새것같음': '새것같음 ✨',
  '상태좋음': '상태좋음 👍',
  '보통': '보통 😊',
  '나쁨': '나쁨 🤷',
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  '판매중': { label: '판매중', bg: '#E8F5E9', color: 'var(--goguma-green)' },
  '예약중': { label: '예약중', bg: '#FFF3E0', color: 'var(--goguma-orange)' },
  '판매완료': { label: '판매완료', bg: '#F5F5F5', color: '#aaa' },
}

function formatPrice(price: number) {
  return price === 0 ? '나눔 🤝' : `${price.toLocaleString('ko-KR')}원`
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string }>
}) {
  const { id } = await params
  const { updated } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', product.user_id)
    .single()

  const badge = STATUS_BADGE[product.status] ?? STATUS_BADGE['판매중']
  const emoji = CATEGORY_EMOJI[product.category] ?? '📦'
  const isMyProduct = user?.id === product.user_id
  const isSoldOut = product.status === '판매완료'

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
        {updated === '1' && (
          <div className="success-box mb-6 text-center">
            ✅ 판매글이 수정됐어요!
          </div>
        )}

        {/* 이미지 자리 (추후 추가 예정) */}
        <div className="card-cartoon flex items-center justify-center mb-6"
          style={{ height: '200px', background: 'var(--goguma-cream)' }}>
          <div className="text-center">
            <div className="text-7xl mb-2">{emoji}</div>
            <p className="text-xs font-medium" style={{ color: '#ccc' }}>사진 준비중</p>
          </div>
        </div>

        {/* 상품 정보 카드 */}
        <div className="card-cartoon mb-4">
          {/* 상태 배지 + 카테고리 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold"
              style={{ background: badge.bg, color: badge.color, border: `2px solid ${badge.color}` }}>
              {badge.label}
            </span>
            <span className="text-sm font-medium" style={{ color: '#aaa' }}>
              {product.category}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--goguma-dark)' }}>
            {product.title}
          </h1>

          {/* 가격 */}
          <p className="text-3xl font-black mb-4" style={{ color: 'var(--goguma-orange)' }}>
            {formatPrice(product.price)}
          </p>

          {/* 태그 정보 */}
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50"
              style={{ border: '1.5px solid #e0c97a', color: '#a07020' }}>
              {CONDITION_DESC[product.condition] ?? product.condition}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: '#f0f0f0', color: '#666', border: '1.5px solid #ddd' }}>
              {new Date(product.created_at).toLocaleDateString('ko-KR')} 등록
            </span>
          </div>

          {/* 구분선 */}
          <div className="border-t-2 border-dashed my-4" style={{ borderColor: '#eee' }} />

          {/* 설명 */}
          {product.description ? (
            <p className="text-sm font-medium leading-relaxed whitespace-pre-line"
              style={{ color: '#444' }}>
              {product.description}
            </p>
          ) : (
            <p className="text-sm font-medium italic" style={{ color: '#ccc' }}>
              판매자가 설명을 작성하지 않았어요.
            </p>
          )}
        </div>

        {/* 판매자 정보 */}
        <div className="card-cartoon mb-6" style={{ padding: '16px 20px' }}>
          <div className="flex items-center gap-3">
            <div className="text-3xl w-11 h-11 rounded-full border-2 flex items-center justify-center bg-amber-50"
              style={{ borderColor: 'var(--goguma-dark)' }}>
              🍠
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: '#aaa' }}>판매자</p>
              <p className="font-black text-base" style={{ color: 'var(--goguma-dark)' }}>
                {profile?.nickname ?? '고구마 이웃'}
              </p>
            </div>
            {isMyProduct && (
              <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold"
                style={{ background: '#fff3e0', color: 'var(--goguma-orange)', border: '1.5px solid var(--goguma-orange)' }}>
                내 판매글
              </span>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        {!isMyProduct && (
          <div className="flex flex-col gap-3">
            <button
              disabled={isSoldOut}
              className="btn-cartoon btn-primary w-full"
              style={{ fontSize: '1.1rem', opacity: isSoldOut ? 0.5 : 1, cursor: isSoldOut ? 'not-allowed' : 'pointer' }}>
              {isSoldOut ? '판매 완료된 상품이에요' : '💬 채팅으로 구매하기 (준비중)'}
            </button>
          </div>
        )}

        {isMyProduct && (
          <div className="flex flex-col gap-3">
            <Link href={`/products/${id}/edit`} className="btn-cartoon btn-secondary w-full text-center"
              style={{ fontSize: '1rem' }}>
              ✏️ 판매글 수정
            </Link>
            <DeleteButton id={id} />
          </div>
        )}
      </main>
    </div>
  )
}
