import Link from "next/link";
import { signUp } from "../actions";

export default async function SignupPage({
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

      {/* 회원가입 카드 */}
      <div className="card-cartoon max-w-sm w-full">
        <h2 className="text-2xl font-black mb-2 text-center" style={{ color: "var(--goguma-dark)" }}>
          회원가입 🎉
        </h2>
        <p className="text-sm font-medium text-center mb-8" style={{ color: "#888" }}>
          고구마마켓 가족이 되어보세요!
        </p>

        {error && (
          <div className="error-box mb-6">
            ⚠️ {decodeURIComponent(error)}
          </div>
        )}

        <form action={signUp} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-black mb-2" style={{ color: "var(--goguma-dark)" }}>
              닉네임 <span style={{ color: "var(--goguma-orange)" }}>*</span>
            </label>
            <input
              type="text"
              name="nickname"
              required
              minLength={2}
              maxLength={20}
              placeholder="동네친구"
              className="input-cartoon"
            />
            <p className="text-xs font-medium mt-1" style={{ color: "#aaa" }}>
              2~20자, 이웃에게 보여지는 이름이에요
            </p>
          </div>

          <div>
            <label className="block text-sm font-black mb-2" style={{ color: "var(--goguma-dark)" }}>
              이메일 <span style={{ color: "var(--goguma-orange)" }}>*</span>
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
              비밀번호 <span style={{ color: "var(--goguma-orange)" }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="input-cartoon"
            />
            <p className="text-xs font-medium mt-1" style={{ color: "#aaa" }}>
              최소 6자 이상
            </p>
          </div>

          <button type="submit" className="btn-cartoon btn-primary w-full mt-2">
            🍠 가입하기
          </button>
        </form>

        <div className="mt-6 pt-6 text-center"
          style={{ borderTop: "2px dashed #e0e0e0" }}>
          <p className="text-sm font-medium" style={{ color: "#888" }}>
            이미 계정이 있으신가요?
          </p>
          <Link href="/auth/login"
            className="btn-cartoon btn-ghost w-full text-center mt-3 inline-block">
            로그인하기
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
