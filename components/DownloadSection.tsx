import { SUB_COLOR } from "@/lib/site";

// 바다 색 = 서브 색(#00B7FE). 푸터 바탕도 같은 색이라 바다가 푸터까지 이어진다.
const SEA = SUB_COLOR;
// 모래사장 색
const SAND = "#FFEFD2";

// 메인 맨 아래 다운로드 칸: 흰 바탕에 제목 + 스토어 버튼 두 개.
// 위에서 내려다본 바닷가: 모래사장 → 흰 거품 → 얕은 물(연한 파랑) → 바다(서브 색). 물결 3겹으로 출렁이며 왼쪽 위에서 오른쪽 아래로 비스듬히 지나가고,
// 같은 색 푸터로 끊김 없이 이어진다.
// 움직임은 app/globals.css의 .sea-wave (움직임 줄이기 설정이면 멈춘다).

// 물결 한 장의 가로 길이. 두 배로 그려서 반만큼 옆으로 밀면 끊김 없이 반복된다 (period는 이 값을 나누어떨어지게).
const WAVE_WIDTH = 1440;
// 물결 전체의 기울기(도). 클수록 가파른 대각선. 0이면 수평.
const SLOPE = 12;
// 기울였을 때 화면 끝이 가운데보다 내려가는 정도 (화면 폭의 %, vw)
const LIFT_VW = Math.round(Math.tan((SLOPE * Math.PI) / 180) * 50 * 100) / 100;
// 뒤 → 앞 순서. 큰 물결(p1·a1)과 잔물결(p2·a2)을 섞어서 고르지 않은 진짜 파도 모양을 만든다.
// height = 물결 칸에서 차지하는 높이(%), p = 물결 하나의 폭(WAVE_WIDTH를 나누어떨어지게), a = 높낮이,
// foam = 물결 머리의 흰 거품 진하기, duration = 옆으로 한 바퀴 시간(초), delay = 밀려왔다 빠지는 박자 차이(초)
const WAVES = [
  { height: 100, p1: 720, a1: 9, p2: 240, a2: 4, phase: 0, color: "#BDEEFF", foam: 1, foamWidth: 7, duration: 34, delay: 0 },
  { height: 74, p1: 480, a1: 8, p2: 180, a2: 4, phase: 1.3, color: "#6FD6FF", foam: 0.85, foamWidth: 4, duration: 26, delay: -1.6 },
  { height: 50, p1: 360, a1: 7, p2: 144, a2: 3, phase: 2.4, color: SEA, foam: 0.7, foamWidth: 3, duration: 19, delay: -3.2 },
];
type Wave = (typeof WAVES)[number];
// 물결 머리 선. closed면 아래까지 채운 면.
function wavePath(w: Wave, closed: boolean) {
  const width = WAVE_WIDTH * 2;
  const base = w.a1 + w.a2 + 2;
  let d = "";
  for (let x = 0; x <= width; x += 12) {
    const y =
      base +
      w.a1 * Math.sin((2 * Math.PI * x) / w.p1) +
      w.a2 * Math.sin((2 * Math.PI * x) / w.p2 + w.phase);
    d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)} `;
  }
  return closed ? `${d}V100 H0 Z` : d;
}

const DOWNLOAD_TITLE = "운동을 즐겁게 하세요";
// 스토어 주소. 비어 있으면 버튼 모양만 보이고 눌리지 않는다. 출시되면 주소를 넣는다.
// 지금은 출시 전이라 베타테스트 신청 폼으로 연결. 스토어에 올라가면 스토어 주소로 바꾸고 IS_BETA를 false로 바꾼다.
// IS_BETA가 true면 버튼 글씨가 "다운로드하기" 대신 "베타테스트 신청하기"로 보인다.
const IS_BETA = true;
const APP_STORE_URL: string = "https://forms.gle/QofLkXzGL13UmBq68";
const PLAY_STORE_URL: string = "https://forms.gle/QofLkXzGL13UmBq68";

export default function DownloadSection() {
  return (
    <section
      // --center: 화면 가운데에서 물결이 시작하는 높이, --waveh: 물결 칸 높이 (휴대폰 / PC)
      className="relative -mb-px overflow-hidden bg-white [--center:300px] [--waveh:110px] md:[--center:400px] md:[--waveh:150px]"
      // 칸 높이: 가장 낮은 오른쪽 끝 물결까지 다 들어가야 아래가 전부 주황이 되어 푸터와 이어진다
      style={{ height: `calc(var(--center) + ${LIFT_VW}vw + var(--waveh) + 24px)` }}
    >
      {/* 바다 물결 3겹 (뒤는 연하게, 맨 앞은 푸터와 같은 색). 옆으로 천천히 흘러간다.
          위에서 내려다본 바닷가처럼 왼쪽 위에서 오른쪽 아래로 비스듬히 내려간다 (SLOPE). */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0"
        style={{ top: "var(--center)", transform: `skewY(${SLOPE}deg)`, transformOrigin: "50% 0" }}
      >
        <div className="relative" style={{ height: "var(--waveh)" }}>
          {/* 물결 바로 위 모래사장 (위로 갈수록 흰 바탕으로 옅어진다) */}
          <div
            className="absolute inset-x-0 bottom-[80%] h-[140px] md:h-[200px]"
            style={{ background: `linear-gradient(to bottom, ${SAND}00, ${SAND})` }}
          />
          {WAVES.map((w, i) => (
            // 바깥: 해변 쪽으로 밀려왔다 빠지는 움직임 / 안쪽: 옆으로 흐르는 움직임
            <div
              key={i}
              className="sea-bob absolute left-0 w-full"
              style={{ bottom: -16, height: `calc(${w.height}% + 16px)`, animationDelay: `${w.delay}s` }}
            >
              <svg
                viewBox={`0 0 ${WAVE_WIDTH * 2} 100`}
                preserveAspectRatio="none"
                className="sea-wave absolute inset-y-0 left-0 h-full w-[200%]"
                style={{ animationDuration: `${w.duration}s` }}
              >
                <path fill={w.color} d={wavePath(w, true)} />
                {/* 물결 머리의 흰 거품 */}
                <path
                  d={wavePath(w, false)}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity={w.foam}
                  strokeWidth={w.foamWidth}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          ))}
        </div>
        {/* 물결 아래 바다 (칸 밖으로 넘치는 부분은 잘린다) */}
        <div className="relative -mt-px h-[100vw]" style={{ background: SEA }} />
      </div>

      <div className="relative mx-auto flex max-w-[1156px] flex-col items-center px-6 pt-20 text-center md:pt-28">
        <h2 className="text-[30px] font-bold leading-[1.35] tracking-tight text-[#191f28] md:text-[44px]">
          {DOWNLOAD_TITLE}
        </h2>
        <div className="mt-8 flex justify-center gap-2 md:gap-3">
          <StoreButton store="apple" href={APP_STORE_URL} />
          <StoreButton store="google" href={PLAY_STORE_URL} />
        </div>
      </div>

    </section>
  );
}

// 스토어 버튼 (흰 바탕 + 테두리 + 로고 + 두 줄 글씨). 주소가 없으면 눌리지 않는 모양으로 보인다.
function StoreButton({ store, href }: { store: "apple" | "google"; href: string }) {
  const label = IS_BETA
    ? store === "apple"
      ? "Apple App Store"
      : "Google Play"
    : store === "apple"
      ? "Apple App Store에서"
      : "Google Play에서";
  const content = (
    <>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 md:h-6 md:w-6">
        {store === "apple" ? (
          <path
            fill="#1d1d1f"
            d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
          />
        ) : (
          <path
            fill="#1d1d1f"
            d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"
          />
        )}
      </svg>
      <span className="flex flex-col items-start leading-tight">
        <span className="whitespace-nowrap text-[11px] font-medium text-[#4e5968]">{label}</span>
        <span className="text-[14px] font-bold text-[#191f28] md:text-[15px]">{IS_BETA ? "베타테스트 신청하기" : "다운로드하기"}</span>
      </span>
    </>
  );
  const className =
    "flex items-center gap-2 rounded-[12px] border-2 border-black/10 bg-white px-3 py-2.5 md:min-w-[180px] md:gap-3 md:px-5 md:py-3 shadow-[0_2px_0_rgba(0,0,0,0.08)]";
  if (!href) {
    return (
      <span aria-disabled="true" title="출시 준비 중" className={`${className} cursor-default`}>
        {content}
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${className} hover:bg-[#f9fafb]`}>
      {content}
    </a>
  );
}
