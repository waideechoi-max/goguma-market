import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "../auth/actions";
import ProfileEditForm from "./ProfileEditForm";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; sold?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const params = await searchParams;
  const isWelcome = params.welcome === "1";
  const isSold = params.sold === "1";

  return (
    <div className="min-h-screen" style={{ background: "var(--goguma-cream)" }}>
      {/* 상단 네비게이션 */}
      <nav className="bg-white border-b-4 px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "var(--goguma-dark)" }}>
        <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="text-3xl">🍠</span>
          <span className="text-xl font-black" style={{ color: "var(--goguma-dark)" }}>
            고구마마켓
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: "var(--goguma-purple)" }}>
            {profile?.nickname || user.email} 님
          </span>
          <form action={signOut}>
            <button type="submit" className="btn-cartoon btn-ghost"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              로그아웃
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* 환영 메시지 */}
        {isWelcome && (
          <div className="success-box mb-8 text-center text-lg">
            🎉 고구마마켓에 오신 걸 환영해요!
          </div>
        )}
        {isSold && (
          <div className="success-box mb-8 text-center text-lg">
            📦 판매글이 등록됐어요!
          </div>
        )}

        {/* 유저 프로필 카드 */}
        <div className="card-cartoon mb-8">
          <div className="flex items-start gap-5">
            {/* 아바타 */}
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="프로필 사진"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-4 flex-shrink-0"
                style={{ borderColor: "var(--goguma-dark)" }}
              />
            ) : (
              <div className="text-6xl w-20 h-20 rounded-full border-4 flex items-center justify-center bg-amber-50 flex-shrink-0"
                style={{ borderColor: "var(--goguma-dark)" }}>
                🍠
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black" style={{ color: "var(--goguma-dark)" }}>
                {profile?.nickname || "닉네임 없음"}
              </h2>
              <p className="text-sm font-medium mt-1" style={{ color: "#888" }}>
                {user.email}
              </p>
              <p className="text-xs font-medium mt-1" style={{ color: "#aaa" }}>
                가입일: {new Date(user.created_at).toLocaleDateString("ko-KR")}
              </p>
              {profile?.bio && (
                <p className="text-sm font-medium mt-3 whitespace-pre-line"
                  style={{ color: "#555" }}>
                  {profile.bio}
                </p>
              )}
              <div className="mt-3">
                <ProfileEditForm
                  userId={user.id}
                  initialAvatarUrl={profile?.avatar_url ?? null}
                  initialBio={profile?.bio ?? null}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 메뉴 카드들 */}
        <h3 className="text-lg font-black mb-4" style={{ color: "var(--goguma-dark)" }}>
          무엇을 해볼까요?
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: "📦", title: "판매하기", desc: "내 물건 팔기", color: "var(--goguma-orange)", href: "/sell", soon: false },
            { icon: "🛍️", title: "구매하기", desc: "물건 둘러보기", color: "var(--goguma-purple)", href: "/products", soon: false },
            { icon: "❤️", title: "찜 목록", desc: "관심 상품", color: "#E91E63", href: null, soon: true },
            { icon: "💬", title: "채팅", desc: "이웃과 대화", color: "var(--goguma-green)", href: null, soon: true },
          ].map((item) => {
            const inner = (
              <>
                <div className="text-4xl mb-2">{item.icon}</div>
                <div className="font-black text-base" style={{ color: item.color }}>
                  {item.title}
                </div>
                <div className="text-xs font-medium mt-1" style={{ color: "#888" }}>
                  {item.desc}
                </div>
                {item.soon && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100"
                    style={{ color: "var(--goguma-orange)", border: "1.5px solid var(--goguma-orange)" }}>
                    준비중
                  </span>
                )}
              </>
            );
            return item.href ? (
              <Link key={item.title} href={item.href}
                className="card-cartoon text-center hover:scale-105 transition-transform"
                style={{ padding: "20px" }}>
                {inner}
              </Link>
            ) : (
              <div key={item.title}
                className="card-cartoon text-center"
                style={{ padding: "20px", opacity: 0.7 }}>
                {inner}
              </div>
            );
          })}
        </div>

        {/* 안내 문구 */}
        <div className="mt-8 text-center p-6 rounded-2xl border-2 border-dashed"
          style={{ borderColor: "var(--goguma-orange)", background: "rgba(255,107,53,0.05)" }}>
          <div className="text-3xl mb-2">🚀</div>
          <p className="font-bold" style={{ color: "var(--goguma-orange)" }}>
            개발 중이에요!
          </p>
          <p className="text-sm font-medium mt-1" style={{ color: "#888" }}>
            더 많은 기능들이 곧 추가될 예정이에요.
          </p>
        </div>
      </main>
    </div>
  );
}
