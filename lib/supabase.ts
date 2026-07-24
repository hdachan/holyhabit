import { createClient } from "@supabase/supabase-js";

// 목록/상세 조회용 — 읽기 전용, RLS 정책으로 보호됩니다.
export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 글쓰기(admin)용 — service role key는 RLS를 우회하므로
// 반드시 서버 코드(Server Action, Route Handler)에서만 사용하세요.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}