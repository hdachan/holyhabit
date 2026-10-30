"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isAdminEmail, isSuperAdminEmail } from "@/lib/auth";

export type LoginState = { error: string } | null;

// 로그인 후 이동할 주소. 외부 사이트로 튕겨 나가지 않도록 /admin, /super 하위만 허용한다.
// 따로 가려던 곳이 없으면 슈퍼 관리자는 지출 화면, 일반 관리자는 글 관리로 간다.
function safeNext(next: FormDataEntryValue | null, fallback: string) {
  return typeof next === "string" && /^\/(admin|super)(\/|$)/.test(next) && next !== "/admin"
    ? next
    : fallback;
}

export async function signIn(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // 이메일이 없는지 비밀번호가 틀렸는지 구분해서 알려주지 않는다 (계정 존재 여부 노출 방지)
    return { error: "이메일 또는 비밀번호가 올바르지 않아요." };
  }

  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return { error: "관리자 권한이 없는 계정이에요." };
  }

  redirect(safeNext(formData.get("next"), isSuperAdminEmail(data.user.email) ? "/super/expenses" : "/admin"));
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
