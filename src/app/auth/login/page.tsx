import Link from "next/link";
import { signIn } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--goguma-cream)" }}>

      {/* 상단 로고 */}
      <Link href="/" className="text-center mb-8 block hover:scale-105 transition-transform">
        <div className="text-6xl">🍠</div>
        <h1 className="text-2xl font-black mt-2" style={{ color: "var(--goguma-dark)" }}>
          고구마마켓
        </h1>
      </Link>

      {/* 로그인 카드 */}
      <div className="card-cartoon max-w-sm w-full">
        <h2 className="text-2xl font-black mb-2 text-center" style={{ color: "var(--goguma-dark)" }}>
          로그인 👋
        </h2>
        <p className="text-sm font-medium text-center mb-8" style={{ color: "#888" }}>
          반가워요! 다시 오셨군요
        </p>

        {error && (
          <div className="error-box mb-6">
            ⚠️ {decodeURIComponent(error)}
          </div>
        )}

        <form action={signIn} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-black mb-2" style={{ color: "var(--goguma-dark)" }}>
              이메일
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="hello@goguma.kr"
              className="input-cartoon"
            />
          </div>

          <div>
            <label className="block text-sm font-black mb-2" style={{ color: "var(--goguma-dark)" }}>
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="input-cartoon"
            />
          </div>

          <button type="submit" className="btn-cartoon btn-primary w-full mt-2">
            🔑 로그인
          </button>
        </form>

        <div className="mt-6 pt-6 text-center"
          style={{ borderTop: "2px dashed #e0e0e0" }}>
          <p className="text-sm font-medium" style={{ color: "#888" }}>
            아직 계정이 없으신가요?
          </p>
          <Link href="/auth/signup"
            className="btn-cartoon btn-secondary w-full text-center mt-3 inline-block">
            🍠 회원가입하기
          </Link>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="fixed bottom-8 right-8 text-6xl opacity-10 select-none pointer-events-none">
        🍠
      </div>
      <div className="fixed top-8 left-8 text-4xl opacity-10 select-none pointer-events-none">
        🥕
      </div>
    </main>
  );
}
