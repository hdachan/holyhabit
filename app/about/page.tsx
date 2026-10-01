import type { Metadata } from "next";

// 소개 페이지 메타.
// layout의 title.template이 적용되어 "브랜드 소개 | holyhabit"으로 출력된다.
export const metadata: Metadata = {
  title: "브랜드 소개",
  // 소개글의 핵심 질문으로 시작해 검색 결과에서 클릭할 이유를 만든다.
  description:
    "왜 시작하는 마음은 쉽게 생기는데, 계속하는 마음은 쉽게 사라질까? holyhabit은 즐거움에 함께라는 가치를 더해 다시 하고 싶어지는 습관을 만듭니다. 미어캣 레오와 함께하는 holyhabit의 이야기.",
  // 이 페이지의 정본 주소
  alternates: { canonical: "/about" },
};

// 본문 블록: 일반 문단(string) 또는 강조 인용문({ quote })
type Block = string | { quote: string };

type Section = {
  label: string; // 섹션 라벨 (INTRODUCTION 등)
  heading: string; // 섹션 제목 → <h2>
  blocks: Block[];
  // EXPERIENCE 섹션의 세 가지 가치 카드
  items?: { number: string; title: string; text: string }[];
  closing?: string; // 카드 아래 마무리 문단
};

// 콘텐츠를 데이터로 분리해 두면 문구 수정 시 JSX를 건드리지 않아도 된다.
// "\n"은 화면에서 줄바꿈으로 표시된다(whitespace-pre-line).
const SECTIONS: Section[] = [
  {
    label: "INTRODUCTION",
    heading: "목표를 세우는 순간은 언제나 설렙니다.",
    blocks: [
      "하지만 일상 속 작은 핑계가 쌓이면\n처음의 마음은 흐려지고 목표는 멀어집니다.",
      "holyhabit은 여기서 질문을 던졌습니다.",
      { quote: "왜 시작하는 마음은 쉽게 생기는데,\n계속하는 마음은 쉽게 사라질까?" },
      "holyhabit은 목표의 성취에만 의미를 두는 것이 아닌\n‘즐거움’에 ‘함께’라는 가치를 더합니다.",
      "재미있게 시작하고, 함께 이어가며,\n어느새 달라진 나를 만나는 것.\n그것이 holyhabit이 만들어가고 싶은 새로운 습관입니다.",
    ],
  },
  {
    label: "EXPERIENCE",
    heading: "하고 싶은 마음이, 계속하는 힘이 되도록",
    blocks: [],
    items: [
      {
        number: "하나",
        title: "Your Journey",
        text: "목표를 이루는 것뿐만 아니라,\n목표를 향해 나아가는 순간까지 성취로.",
      },
      {
        number: "둘",
        title: "HolyHabit",
        text: "해야 해서 하는 것이 아니라,\n재미있어서 한 번 더 움직일 수 있도록.",
      },
      {
        number: "셋",
        title: "Never Alone",
        text: "혼자라면 지나쳤을 작은 순간도\n함께라면 새로운 동기가 되도록.",
      },
    ],
    closing:
      "holyhabit은 목표를 이루는 과정 자체를\n즐겁고 의미 있는 경험으로 만듭니다.",
  },
  {
    label: "TOGETHER",
    heading: "혼자라면 포기할 이유가 많지만,\n함께라면 계속할 이유가 생깁니다.",
    blocks: [
      "holyhabit은 목표를 혼자만의 의지에 맡기지 않습니다.",
      "함께 시작하고, 작은 성취를 발견하며,\n멈추고 싶을 때 다시 움직일 수 있도록.",
      "함께한다는 것은 계속할 이유를\n서로에게 만들어주는 일이라고 믿습니다.",
    ],
  },
  {
    label: "CHARACTER",
    heading: "미어캣 레오가 함께합니다.",
    blocks: [
      "미어캣은 함께 서로를 지키고\n주변을 탐험하며 살아갑니다.",
      "때로는 넘어지고 엉뚱한 길로 가더라도\n다시 일어나 앞으로 나아갑니다.",
      "함께 서로를 지키며 각자의 목표를 향해 나아가는 것.\n그 모습이 holyhabit과 닮아 있습니다.",
      "미어캣 레오가 여러분과 함께합니다.",
    ],
  },
  {
    label: "IDENTITY",
    heading: "holyhabit이라는 이름에는\n하나의 바람이 담겨 있습니다.",
    blocks: [
      "습관은 때때로 ‘해야만 하는 것’이 되어\n스스로를 밀어붙이게 합니다.",
      "하지만 holyhabit이 만들고 싶은 습관은 다릅니다.",
      { quote: "억지로 지켜내는 습관이 아니라, 다시 하고 싶어지는 습관.\n혼자 버티는 습관이 아니라, 함께 이어가는 습관." },
      "그 과정이 즐거워 자연스럽게 이어지는 것.\n그것이 holyhabit이 만들고 싶은 습관입니다.",
    ],
  },
  {
    label: "VISION",
    heading: "더 나은 나를 향한 길에, 더 많은 이유를.",
    blocks: [
      "우리는 목표를 이루는 방식이\n달라질 수 있다고 믿습니다.",
      "더 강한 의지로 버티는 것이 아니라,\n더 즐거운 경험으로 계속할 수 있도록.",
      "더 치열하게 경쟁하는 것이 아니라,\n서로의 한 걸음을 응원하며 나아갈 수 있도록.",
      "holyhabit은 목표를 오래 이어갈 수 있는\n이유를 함께 만들어가고자 합니다.\n그것이 holyhabit이 그리고 있는 미래입니다.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24">
          {/* 히어로: 페이지 주제를 나타내는 유일한 h1 */}
          <header className="mb-16 md:mb-24">
            <p className="text-[16px] font-bold uppercase tracking-[0.12em] text-[#8e8e93]">
              About holyhabit
            </p>
            <h1 className="mt-5 whitespace-pre-line text-[44px] font-extrabold leading-[1.03] tracking-tight text-[#1d1d1f] md:text-[76px]">
              {"Your Journey.\nNever Alone."}
            </h1>
            <p className="mt-6 text-[18px] text-[#6e6e73] md:text-[20px]">
              여러분의 목표에 holyhabit이 함께합니다.
            </p>
          </header>

          <div className="flex flex-col gap-6">
            {SECTIONS.map((section) => (
              // 각 섹션을 <section>으로 구분해 검색엔진이 문서 구조를 파악하기 쉽게 한다.
              <section
                key={section.label}
                className="grid gap-6 rounded-[32px] bg-white p-8 md:grid-cols-[200px_1fr] md:gap-12 md:p-12"
              >
                <p className="text-[14px] font-bold uppercase tracking-[0.12em] text-[#8e8e93]">
                  {section.label}
                </p>

                <div>
                  <h2 className="whitespace-pre-line text-[28px] font-bold leading-[1.25] tracking-tight text-[#1d1d1f] md:text-[36px]">
                    {section.heading}
                  </h2>

                  {section.blocks.length > 0 && (
                    <div className="mt-8 flex flex-col gap-5">
                      {section.blocks.map((block, i) =>
                        typeof block === "string" ? (
                          <p
                            key={i}
                            className="whitespace-pre-line text-[17px] leading-[1.75] text-[#1d1d1f]/80 md:text-[18px]"
                          >
                            {block}
                          </p>
                        ) : (
                          // 강조 문장은 <blockquote>로 표시
                          <blockquote
                            key={i}
                            className="whitespace-pre-line border-l-4 border-[#1d1d1f] pl-5 text-[20px] font-bold leading-[1.5] text-[#1d1d1f] md:text-[22px]"
                          >
                            {block.quote}
                          </blockquote>
                        )
                      )}
                    </div>
                  )}

                  {section.items && (
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                      {section.items.map((item) => (
                        <div
                          key={item.title}
                          className="rounded-[20px] bg-[#f5f5f7] p-6"
                        >
                          <p className="text-[13px] font-bold text-[#8e8e93]">
                            {item.number}
                          </p>
                          <h3 className="mt-2 text-[20px] font-bold text-[#1d1d1f]">
                            {item.title}
                          </h3>
                          <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.7] text-[#1d1d1f]/80">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.closing && (
                    <p className="mt-8 whitespace-pre-line text-[17px] leading-[1.75] text-[#1d1d1f]/80 md:text-[18px]">
                      {section.closing}
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* 마무리 슬로건 */}
          <p className="mt-16 text-center text-[24px] font-extrabold tracking-tight text-[#1d1d1f] md:mt-24 md:text-[32px]">
            Your Journey. Never Alone.
          </p>
        </div>
      </main>
    </div>
  );
}