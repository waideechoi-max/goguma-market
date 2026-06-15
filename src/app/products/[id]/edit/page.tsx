import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditForm from './EditForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()
  if (product.user_id !== user.id) redirect(`/products/${id}`)

  return (
    <div className="min-h-screen" style={{ background: 'var(--goguma-cream)' }}>
      <nav className="bg-white border-b-4 px-6 py-4 flex items-center gap-4"
        style={{ borderColor: 'var(--goguma-dark)' }}>
        <Link href={`/products/${id}`}
          className="btn-cartoon btn-ghost"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          ← 뒤로
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍠</span>
          <span className="text-lg font-black" style={{ color: 'var(--goguma-dark)' }}>
            판매글 수정
          </span>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="card-cartoon">
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">✏️</div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--goguma-dark)' }}>
              판매글 수정하기
            </h1>
            <p className="text-sm font-medium mt-1" style={{ color: '#888' }}>
              내용을 변경하고 저장해 주세요!
            </p>
          </div>
          <EditForm product={product} />
        </div>
      </main>
    </div>
  )
}
