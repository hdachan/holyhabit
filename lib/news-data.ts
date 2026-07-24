export type NewsItem = {
  slug: string;
  eyebrow: string;
  title: string;
  date: string;
  // 사진이 들어갈 자리 — 지금은 색상 블록으로 대체
  imageBg: string;
  // 카드 목록에서 이미지 영역 높이 (리스트 페이지용)
  cardImageHeight: string;
  // 상세 페이지 본문
  body: string[];
};

export const newsItems: NewsItem[] = [
  {
    slug: "mls-apple-tv-return",
    eyebrow: "업데이트",
    title: "메이저 리그 사커, 내일 Apple TV에서 중계 재개",
    date: "3일 전",
    imageBg: "bg-gradient-to-br from-[#ff6a00] to-[#ff9736]",
    cardImageHeight: "h-[450px]",
    body: [
      "메이저 리그 사커(MLS) 중계가 내일부터 다시 시작됩니다. 시즌 후반부를 앞두고 각 팀은 순위표 상단을 두고 치열한 경쟁을 이어갈 예정입니다.",
      "이번 재개를 기념해 주요 경기 하이라이트와 선수 인터뷰, 시즌 전망 등 다양한 콘텐츠가 함께 제공됩니다. 팬들은 익숙한 환경에서 실시간 경기를 시청할 수 있습니다.",
      "holyhabit은 앞으로도 스포츠 팬들을 위한 소식을 꾸준히 전해드릴 예정입니다.",
    ],
  },
  {
    slug: "madden-nfl-27-arcade",
    eyebrow: "업데이트",
    title: "8월 6일, Madden NFL 27 Arcade Edition이 미식축구 액션을 선사한다",
    date: "2026년 7월 14일",
    imageBg: "bg-[#12314f]",
    cardImageHeight: "h-[260px]",
    body: [
      "8월 6일 출시되는 Madden NFL 27 Arcade Edition은 짧고 강렬한 플레이에 최적화된 미식축구 게임으로, 남녀노소 누구나 쉽게 즐길 수 있도록 조작이 단순화되었습니다.",
      "실제 리그 팀과 선수 데이터를 기반으로 하면서도, 아케이드 특유의 과장된 연출과 스피디한 진행이 특징입니다.",
      "출시 이후 시즌 콘텐츠와 신규 팀 업데이트가 순차적으로 추가될 예정입니다.",
    ],
  },
  {
    slug: "apple-creator-studio",
    eyebrow: "업데이트",
    title: "Apple Creator Studio, 더 스마트하고 빠르며, 더 강력한 연동성 제공",
    date: "2026년 6월 30일",
    imageBg: "bg-[#0c0c0e]",
    cardImageHeight: "h-[260px]",
    body: [
      "Apple Creator Studio가 대규모 업데이트를 통해 작업 속도와 지능형 편집 기능을 대폭 강화했습니다. 영상, 오디오, 이미지 편집이 하나의 워크플로에서 매끄럽게 연결됩니다.",
      "새로운 연동 기능을 통해 다른 기기 및 서비스와의 협업이 한층 수월해졌으며, 실시간 동기화로 여러 프로젝트를 동시에 관리할 수 있습니다.",
      "크리에이터들은 이번 업데이트로 더 짧은 시간에 더 완성도 높은 결과물을 만들 수 있을 것으로 기대됩니다.",
    ],
  },
  {
    slug: "apple-services-intelligence",
    eyebrow: "업데이트",
    title: "Apple, 서비스 전반에 걸쳐 여러 혁신적인 기능과 지능 경험 공개",
    date: "2026년 6월 24일",
    imageBg: "bg-[#e7e3f7]",
    cardImageHeight: "h-[180px]",
    body: [
      "Apple이 서비스 전반에 새로운 지능형 기능을 도입한다고 발표했습니다. 사용자의 맥락을 이해하고 더 개인화된 추천을 제공하는 것이 핵심입니다.",
      "이번 업데이트는 여러 앱과 서비스에 걸쳐 순차적으로 적용되며, 개인정보 보호를 최우선으로 설계되었습니다.",
    ],
  },
  {
    slug: "apple-intelligence-framework",
    eyebrow: "보도자료",
    title: "Apple, 새로운 인텔리전스 프레임워크와 첨단 도구로 앱 개발 지원",
    date: "2026년 6월 18일",
    imageBg: "bg-[#1c1c1e]",
    cardImageHeight: "h-[180px]",
    body: [
      "Apple이 개발자를 위한 새로운 인텔리전스 프레임워크를 공개했습니다. 이를 통해 개발자는 더 적은 코드로 더 똑똑한 앱을 만들 수 있게 됩니다.",
      "새로운 도구는 온디바이스 모델과의 통합을 단순화하고, 다양한 플랫폼에서 일관된 개발 경험을 제공합니다.",
    ],
  },
  {
    slug: "wwdc26-highlights",
    eyebrow: "보도자료",
    title: "Apple Intelligence, Siri AI, 새로운 유해 콘텐츠 차단 설정 등 WWDC26 주요 소식",
    date: "2026년 6월 9일",
    imageBg: "bg-[#dfe3ea]",
    cardImageHeight: "h-[180px]",
    body: [
      "WWDC26에서 Apple은 Apple Intelligence의 확장과 새로워진 Siri AI, 그리고 강화된 유해 콘텐츠 차단 설정 등을 대거 공개했습니다.",
      "이번 발표는 사용자 경험과 안전을 동시에 강화하는 데 초점을 맞췄으며, 올가을 정식 업데이트를 통해 순차적으로 제공될 예정입니다.",
    ],
  },
  {
    slug: "sample-post-7",
    eyebrow: "칼럼",
    title: "여기부터는 예시 글이에요 — 실제 글로 교체해서 쓰면 됩니다",
    date: "2026년 6월 2일",
    imageBg: "bg-[#f0e6d8]",
    cardImageHeight: "h-[180px]",
    body: [
      "이 글은 '더보기'로 추가 노출되는 그리드 영역을 확인하기 위한 예시 글입니다.",
      "실제 서비스에서는 이 자리에 새로 작성한 글이 들어가게 됩니다.",
    ],
  },
  {
    slug: "sample-post-8",
    eyebrow: "칼럼",
    title: "예시 글 8번 — 더보기 그리드 확인용",
    date: "2026년 5월 28일",
    imageBg: "bg-[#dce8e0]",
    cardImageHeight: "h-[180px]",
    body: [
      "예시 본문입니다. 실제 콘텐츠로 교체해주세요.",
      "두 번째 문단입니다.",
    ],
  },
  {
    slug: "sample-post-9",
    eyebrow: "칼럼",
    title: "예시 글 9번 — 더보기 그리드 확인용",
    date: "2026년 5월 20일",
    imageBg: "bg-[#e8dce6]",
    cardImageHeight: "h-[180px]",
    body: ["예시 본문입니다. 실제 콘텐츠로 교체해주세요."],
  },
  {
    slug: "sample-post-10",
    eyebrow: "칼럼",
    title: "예시 글 10번 — 더보기 그리드 확인용",
    date: "2026년 5월 12일",
    imageBg: "bg-[#dce4e8]",
    cardImageHeight: "h-[180px]",
    body: ["예시 본문입니다. 실제 콘텐츠로 교체해주세요."],
  },
  {
    slug: "sample-post-11",
    eyebrow: "칼럼",
    title: "예시 글 11번 — 더보기 그리드 확인용",
    date: "2026년 5월 4일",
    imageBg: "bg-[#e8e0dc]",
    cardImageHeight: "h-[180px]",
    body: ["예시 본문입니다. 실제 콘텐츠로 교체해주세요."],
  },
  {
    slug: "sample-post-12",
    eyebrow: "칼럼",
    title: "예시 글 12번 — 두 번째 더보기 클릭 시 노출",
    date: "2026년 4월 28일",
    imageBg: "bg-[#e0e8dc]",
    cardImageHeight: "h-[180px]",
    body: ["예시 본문입니다. 실제 콘텐츠로 교체해주세요."],
  },
];

export function getNewsItem(slug: string) {
  return newsItems.find((item) => item.slug === slug);
}

export function getRelatedItems(slug: string, count = 3) {
  return newsItems.filter((item) => item.slug !== slug).slice(0, count);
}