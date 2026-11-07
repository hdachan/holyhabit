// 메인 맨 아래 다운로드 칸: 노을 진 바다 그림 위에 제목 + 스토어 버튼 두 개.
// 뒷배경 그림 (public/download-bg.webp, 2048×768). 위쪽이 흰색이라 바로 위 칸과 자연스럽게 이어진다.
const BACKGROUND = "/download-bg.webp";
const DOWNLOAD_TITLE = "운동을 즐겁게 하세요";
// 스토어 주소. 비어 있으면 버튼 모양만 보이고 눌리지 않는다. 출시되면 주소를 넣는다.
const APP_STORE_URL: string = "";
const PLAY_STORE_URL: string = "";

export default function DownloadSection() {
  return (
    <section
      className="relative min-h-[560px] overflow-hidden bg-white bg-cover bg-center md:min-h-[640px]"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      <div className="relative mx-auto flex max-w-[1156px] flex-col items-center px-6 pt-20 text-center md:pt-24">
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
  const label = store === "apple" ? "Apple App Store에서" : "Google Play에서";
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
        <span className="text-[14px] font-bold text-[#191f28] md:text-[15px]">다운로드하기</span>
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
