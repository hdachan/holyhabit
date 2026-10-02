import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 로그인 세션(쿠키)을 읽고 쓰는 Supabase 클라이언트.
// 서버 컴포넌트·Server Action에서 "지금 로그인한 사람이 누구인지" 확인할 때 쓴다.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없어서 에러가 난다.
          // 세션 갱신은 proxy.ts가 맡으므로 여기서는 무시해도 된다.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
