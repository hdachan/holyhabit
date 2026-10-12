import type { Metadata } from "next";
import AboutSectionNav from "@/components/AboutSectionNav";

// 메인(홈) = 브랜드 소개. 글 목록은 /news로 옮겼다.
// 제목·설명은 layout 기본값을 쓰고 정본 주소만 지정한다.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// 이미지 배치: full = 텍스트 아래 전체 폭, right/left = 텍스트 옆
type Layout = "full" | "right" | "left";

type Section = {
  id: string; // 섹션 메뉴의 이동 위치(#id)
  label: string;
  heading: string;
  layout: Layout;
  paragraphs: string[];
  quote?: string; // 굵게 강조하는 문장
  items?: { title: string; text: string }[]; // EXPERIENCE의 세 가지 가치
  closing?: string; // 이미지 아래 마무리 문장
};

// 문구는 데이터로 분리해서 JSX를 건드리지 않고 수정할 수 있게 한다.
// "\n"은 화면에서 줄바꿈으로 표시된다(whitespace-pre-line).
const SECTIONS: Section[] = [
  {
    id: "introduction",
    label: "INTRODUCTION",
    heading: "혼자라면 멈추기 쉽지만, 함께라면 한 걸음 더 나아갈 수 있습니다.",
    layout: "full",
    paragraphs: [
      "holyhabit은 목표의 성취에만 의미를 두는 것이 아닌\n‘즐거움’에 ‘함께’라는 가치를 더합니다.",
      "재미있게 시작하고, 함께 이어가며, 어느새 달라진 나를 만나는 것.\n그것이 holyhabit이 만들어가고 싶은 새로운 습관입니다.",
    ],
  },
  {
    id: "why",
    label: "WHY",
    heading: "반복되는 실패, 계속되는 질문",
    layout: "right",
    paragraphs: [
      "새로운 목표를 세우는 순간에는 누구나 설렙니다.\n하지만 시간이 지나면 처음의 마음은 조금씩 흐려집니다.\n바쁜 하루에 한 번 미루고, 힘든 날에 쉬다 보면 어느새 목표는 뒤로 밀려나곤 합니다.",
      "holyhabit은 여기서 질문을 던졌습니다.",
    ],
    quote: "“왜 시작하는 마음은 쉽게 생기는데, 계속하는 마음은 쉽게 사라질까?”",
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    heading: "하고 싶은 마음이, 계속하는 힘이 되도록",
    layout: "left",
    paragraphs: [],
    items: [
      {
        title: "GOAL — 성취",
        text: "목표를 이루는 것만이 아니라,\n목표를 향해 나아가는 순간까지 성취로 느끼는 경험.",
      },
      {
        title: "PLAY — 즐거움",
        text: "해야 해서 하는 것이 아니라,\n재미있어서 한 번 더 움직이는 경험.",
      },
      {
        title: "TOGETHER — 함께",
        text: "혼자라면 지나쳤을 작은 순간도\n함께라면 새로운 동기가 되는 경험.",
      },
    ],
    closing:
      "holyhabit은 목표를 이루는 과정 자체가\n즐겁고 의미 있는 경험이 될 수 있도록 만듭니다.",
  },
  {
    id: "together",
    label: "TOGETHER",
    heading: "혼자서는 포기할 이유가 많지만, 함께라면 계속할 이유가 생깁니다.",
    layout: "full",
    paragraphs: [
      "holyhabit은 목표를 혼자만의 의지에 맡기지 않습니다.\n함께 시작하고, 서로의 작은 성취를 발견하며, 멈추고 싶을 때 다시 움직일 수 있도록.",
    ],
    quote: "함께한다는 것은 계속할 이유를 서로에게 만들어주는 일이라고 믿습니다.",
  },
  {
    id: "character",
    label: "CHARACTER",
    heading: "미어캣 레오가 함께합니다.",
    layout: "right",
    paragraphs: [
      "미어캣은 함께 서로를 지키고\n주변을 탐험하며 살아갑니다.",
      "때로는 넘어지고 엉뚱한 길로 가더라도\n다시 일어나 앞으로 나아갑니다.",
      "함께 서로를 지키며 각자의 목표를 향해 나아가는 것.\n그 모습이 holyhabit과 닮아 있습니다.",
    ],
    quote: "미어캣 레오가 여러분과 함께합니다.",
  },
  {
    id: "identity",
    label: "IDENTITY",
    heading: "holyhabit이라는 이름",
    layout: "full",
    paragraphs: [
      "holyhabit이라는 이름에는 하나의 바람이 담겨 있습니다.\n습관은 때때로 ‘해야만 하는 것’이 되어 스스로를 밀어붙이게 합니다.",
      "억지로 지켜내는 습관이 아니라, 다시 하고 싶어지는 습관.\n혼자 버티는 습관이 아니라, 함께 이어가는 습관.",
      "그 과정이 즐거워 자연스럽게 이어지는 것.\n그것이 holyhabit이 만들고 싶은 습관입니다.",
    ],
  },
  {
    id: "vision",
    label: "VISION",
    heading: "더 나은 나를 향한 길에, 더 많은 이유를.",
    layout: "full",
    paragraphs: [
      "우리는 목표를 이루는 방식이 달라질 수 있다고 믿습니다.\n더 강한 의지로 버티는 것이 아니라, 더 즐거운 경험으로 계속할 수 있도록.\n더 치열하게 경쟁하는 것이 아니라, 서로의 한 걸음을 응원하며 나아갈 수 있도록.",
      "holyhabit은 목표를 오래 이어갈 수 있는 이유를 함께 만들어가고자 합니다.",
    ],
    quote: "그것이 holyhabit이 그리고 있는 미래입니다.\nYour Journey. Never Alone.",
  },
];

// 사진이 들어갈 자리. 테스트용 검은 블록이며, 나중에 next/image로 교체한다.
function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`w-full rounded-[12px] bg-black ${className}`}
    />
  );
}

function SectionText({ section }: { section: Section }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-[#1d1d1f]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1d1d1f]" />
        {section.label}
      </p>
      <h2 className="mt-3 text-[26px] font-bold leading-[1.3] tracking-tight text-[#1d1d1f] md:text-[32px]">
        {section.heading}
      </h2>

      <div className="mt-6 flex flex-col gap-5">
        {section.paragraphs.map((text, i) => (
          <p
            key={i}
            className="whitespace-pre-line text-[15px] leading-[1.75] text-[#1d1d1f]/75"
          >
            {text}
          </p>
        ))}
        {section.items?.map((item) => (
          <div key={item.title}>
            <h3 className="text-[15px] font-bold text-[#1d1d1f]">
              {item.title}
            </h3>
            <p className="mt-1 whitespace-pre-line text-[15px] leading-[1.7] text-[#1d1d1f]/75">
              {item.text}
            </p>
          </div>
        ))}
        {section.quote && (
          <p className="whitespace-pre-line text-[15px] font-bold leading-[1.75] text-[#1d1d1f]">
            {section.quote}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* 히어로: 페이지의 유일한 h1 */}
      <header className="bg-black px-6 pb-28 pt-40 md:px-10 md:pb-40 md:pt-56">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="text-[36px] font-bold tracking-tight text-white md:text-[56px]">
            Your Journey. Never Alone.
          </h1>
          <p className="mt-3 text-[15px] text-white/80 md:text-[18px]">
            즐거움이 발걸음이 되고, 함께가 길이 되는 여정
          </p>
        </div>
      </header>

      <AboutSectionNav
        sections={SECTIONS.map(({ id, label }) => ({ id, label }))}
      />

      <main className="mx-auto max-w-[1200px] px-6 pb-24 md:px-10">
        {SECTIONS.map((section, i) => (
          // scroll-mt: 메뉴를 눌러 이동했을 때 상단 고정 메뉴에 제목이 가려지지 않게 한다.
          <section
            key={section.id}
            id={section.id}
            className={`scroll-mt-24 py-14 md:py-20 ${
              i > 0 ? "border-t border-black/15" : ""
            }`}
          >
            {section.layout === "full" && (
              <>
                <SectionText section={section} />
                <ImagePlaceholder className="mt-10 aspect-[16/9]" />
              </>
            )}

            {section.layout === "right" && (
              <div className="grid items-center gap-10 md:grid-cols-2">
                <SectionText section={section} />
                <ImagePlaceholder className="aspect-[4/3]" />
              </div>
            )}

            {section.layout === "left" && (
              <>
                <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
                  {/* 모바일에서는 텍스트가 먼저, 넓은 화면에서는 이미지가 왼쪽 */}
                  <ImagePlaceholder className="order-2 aspect-[16/10] md:order-1" />
                  <div className="order-1 md:order-2">
                    <SectionText section={{ ...section, closing: undefined }} />
                  </div>
                </div>
                {section.closing && (
                  <p className="mt-8 whitespace-pre-line text-[18px] font-bold leading-[1.6] text-[#1d1d1f] md:text-[20px]">
                    {section.closing}
                  </p>
                )}
              </>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
