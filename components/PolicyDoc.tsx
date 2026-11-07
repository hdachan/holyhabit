// 개인정보처리방침·이용약관 같은 긴 문서의 공통 모양 (제목, 문단, 목록, 표).

export function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[18px] font-bold text-[#1d1d1f]">{title}</h2>
      {children}
    </section>
  );
}

export function DocSub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[15px] font-bold text-[#1d1d1f]">{title}</h3>
      {children}
    </div>
  );
}

export function DocP({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-[1.75] text-[#1d1d1f]/80">{children}</p>;
}

export function DocList({ items, ordered = false }: { items: React.ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`flex flex-col gap-1.5 pl-5 text-[15px] leading-[1.75] text-[#1d1d1f]/80 ${
        ordered ? "list-decimal" : "list-disc"
      }`}
    >
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

// 표. 휴대폰에서 칸이 많으면 표만 옆으로 밀어서 본다.
export function DocTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-black/10">
      <table className="w-full min-w-[520px] border-collapse text-left text-[14px] leading-[1.6]">
        <thead className="bg-[#f5f5f7] text-[#1d1d1f]">
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-black/10 px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[#1d1d1f]/80">
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-black/5 last:border-0 align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 눈에 띄게 알려줄 안내 상자
export function DocNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] bg-[#fff4ea] px-4 py-3 text-[14px] leading-[1.7] text-[#1d1d1f]/85">{children}</div>
  );
}
