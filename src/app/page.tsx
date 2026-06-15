import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--goguma-cream)" }}>

      {/* 로고 & 히어로 */}
      <div className="text-center mb-12">
        <div className="text-8xl mb-4" style={{ animation: "bounce 1s infinite" }}>🍠</div>
        <h1 className="text-5xl font-black mb-3 tracking-tight"
          style={{ color: "var(--goguma-dark)", textShadow: "3px 3px 0px var(--goguma-orange)" }}>
          고구마마켓
        </h1>
        <p className="text-xl font-bold" style={{ color: "var(--goguma-purple)" }}>
          우리 동네 따끈따끈 중고거래! 🔥
        </p>
      </div>

      {/* 메인 카드 */}
      <div className="card-cartoon max-w-md w-full text-center mb-8">
        <div className="text-4xl mb-4">🏘️</div>
        <h2 className="text-2xl font-black mb-3" style={{ color: "var(--goguma-dark)" }}>
          당근보다 고구마!
        </h2>
        <p className="text-base font-medium mb-6" style={{ color: "#666" }}>
          우리 동네 이웃과 함께하는<br />
          <span className="font-black" style={{ color: "var(--goguma-orange)" }}>안전하고 재미있는</span> 중고거래
        </p>

        {user ? (
          <div className="flex flex-col gap-3">
            <p className="font-bold text-sm" style={{ color: "var(--goguma-purple)" }}>
              어서와요! 반가워요 👋
            </p>
            <Link href="/dashboard" className="btn-cartoon btn-primary w-full text-center">
              내 마켓 보기 →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Link href="/auth/signup" className="btn-cartoon btn-primary w-full text-center">
              🍠 지금 시작하기
            </Link>
            <Link href="/auth/login" className="btn-cartoon btn-ghost w-full text-center">
              로그인
            </Link>
          </div>
        )}
      </div>

      {/* 특징 3가지 */}
      <div className="grid grid-cols-3 gap-4 max-w-md w-full">
        {[
          { icon: "🔒", title: "안전거래", desc: "믿을 수 있어요" },
          { icon: "⚡", title: "빠른거래", desc: "동네라 가까워요" },
          { icon: "💰", title: "저렴하게", desc: "착한 가격!" },
        ].map((item) => (
          <div key={item.title}
            className="card-cartoon text-center hover:scale-105 transition-transform"
            style={{ padding: "16px" }}>
            <div className="text-3xl mb-1">{item.icon}</div>
            <div className="font-black text-sm">{item.title}</div>
            <div className="text-xs font-medium" style={{ color: "#888" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm font-medium" style={{ color: "#aaa" }}>
        © 2026 고구마마켓 🍠
      </p>
    </main>
  );
}
