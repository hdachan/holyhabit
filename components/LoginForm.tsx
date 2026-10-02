"use client";

import { useActionState } from "react";
import { signIn } from "@/app/auth-actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <input
        name="email"
        type="email"
        autoComplete="email"
        placeholder="이메일"
        required
        className="rounded-xl border border-black/10 px-4 py-3 text-[15px] outline-none focus:border-black/40"
      />
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="비밀번호"
        required
        className="rounded-xl border border-black/10 px-4 py-3 text-[15px] outline-none focus:border-black/40"
      />
      {state?.error && (
        <p className="text-[14px] text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-[#1d1d1f] py-3 text-[15px] font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
