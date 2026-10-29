import Link from "next/link";

// 개인정보 수집·이용 동의 (개인정보 보호법: 수집 항목·목적·보유 기간을 알리고 동의를 받는다)
// 문의하기·버그 제보 양식이 같이 쓴다.
export default function ConsentBox({
  items,
  agreed,
  onChange,
}: {
  // 수집 항목 (예: "이메일 주소, 문의 유형, 문의 내용")
  items: string;
  agreed: boolean;
  onChange: (agreed: boolean) => void;
}) {
  return (
    <div className="rounded-[12px] bg-[#f2f3f6] p-5 text-[14px] leading-[1.7] text-[#4d5159]">
      <p className="font-semibold text-[#212124]">개인정보 수집·이용 안내</p>
      <ul className="mt-2 list-disc pl-5">
        <li>수집 항목: {items}</li>
        <li>이용 목적: 문의 확인 및 답변</li>
        <li>보유 기간: 문의 처리 완료 후 지체 없이 파기 (관련 법령에 따라 보관이 필요한 경우 해당 기간)</li>
      </ul>
      <p className="mt-2">
        동의하지 않을 수 있으며, 이 경우 접수가 어려워요. 자세한 내용은{" "}
        <Link href="/privacy" className="underline">
          개인정보처리방침
        </Link>
        을 확인해주세요.
      </p>
      <label className="mt-4 flex cursor-pointer items-center gap-2 font-semibold text-[#212124]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 accent-[#212124]"
        />
        개인정보 수집·이용에 동의합니다 (필수)
      </label>
    </div>
  );
}

// 스팸 방지: 사람에게는 보이지 않는 칸 (자동 프로그램만 채운다)
export function HoneypotField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label>
        웹사이트
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

export const inputClass =
  "w-full rounded-[10px] border border-[#dcdee3] bg-white px-4 py-3 text-[15px] text-[#212124] placeholder:text-[#adb1ba] focus:border-[#212124] focus:outline-none";
