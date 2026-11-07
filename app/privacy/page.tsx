import type { Metadata } from "next";
import Link from "next/link";
import {
  BUSINESS_ADDRESS_TEXT,
  BUSINESS_NAME,
  BUSINESS_OWNER,
  BUSINESS_REG_NO,
  CONTACT_EMAIL,
  CONTACT_HOURS,
  SITE_NAME,
} from "@/lib/site";
import { pageOpenGraph } from "@/lib/seo";
import HashTabs from "@/components/HashTabs";
import { DocList, DocNote, DocP, DocSection, DocSub, DocTable } from "@/components/PolicyDoc";

// 개인정보처리방침: [앱] [웹사이트] 탭. 앱 스토어에는 /privacy#app 주소를 넣는다.
// ⚠️ 확정 전 초안. 확정되면 아래 robots(noindex)를 지운다.
export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${SITE_NAME} 앱과 웹사이트의 개인정보처리방침`,
  alternates: { canonical: "/privacy" },
  openGraph: pageOpenGraph({
    title: `개인정보처리방침 | ${SITE_NAME}`,
    description: `${SITE_NAME} 앱과 웹사이트의 개인정보처리방침`,
    url: "/privacy",
  }),
  robots: { index: false, follow: true },
};

// 예전 앱 처리방침(v1.0) 원문
const APP_POLICY_V1_URL = "https://aquamarine-armchair-686.notion.site/HolyHabit-3a7d8a6d4321801dbb54d54e902323a3";
const GOOGLE_CONTACT = "googlekrsupport@google.com";

const OWNER_TABLE = (
  <DocTable
    head={["항목", "내용"]}
    rows={[
      ["성명", BUSINESS_OWNER],
      ["직책", "대표"],
      ["이메일", CONTACT_EMAIL],
    ]}
  />
);

const REMEDY_TABLE = (
  <DocTable
    head={["기관명", "연락처", "홈페이지"]}
    rows={[
      ["개인정보보호위원회", "국번없이 182", "www.pipc.go.kr"],
      ["개인정보 침해신고센터", "국번없이 118", "privacy.kisa.or.kr"],
      ["대검찰청 사이버수사과", "국번없이 1301", "www.spo.go.kr"],
      ["경찰청 사이버안전국", "국번없이 182", "ecrm.police.go.kr"],
    ]}
  />
);

// ── 앱 (HolyHabit 애플리케이션)
const APP_POLICY = (
  <div className="flex flex-col gap-10">
    <DocP>
      {BUSINESS_NAME}(이하 &quot;회사&quot;)은 「개인정보 보호법」 제30조에 따라 이용자의 개인정보를 보호하고 관련 고충을
      신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다. 본 개인정보 처리방침은 앱 실행 &gt;
      하단 설정 탭 &gt; 개인정보 처리방침에서 언제든지 확인하실 수 있습니다.
    </DocP>

    <DocSection title="1. 개인정보의 처리 목적">
      <DocP>
        회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지
        않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할
        예정입니다.
      </DocP>
      <DocList
        ordered
        items={[
          "회원 가입 및 관리: 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지, 고충처리",
          "서비스 제공: 운동 루틴 기록, 걸음수 측정 및 보상 지급, RPG 캐릭터 성장, 행성 탐험, 게임 내 재화(골드·신발코인·열매) 관리, 상점 서비스 제공, 광고 시청 보상 지급",
          "유료 결제 처리: 유료 재화(열매)·유료 상품(스킨 등) 구매 확인 및 지급, 청약철회·환불 처리, 결제 관련 문의 대응",
          "마케팅 및 광고 (선택 동의 시): 신기능 출시 안내, 이벤트 및 프로모션 안내, 서비스 관련 정보 발송",
          "서비스 개선 및 통계 분석: 앱 이용 통계 분석, 서비스 개선, 오류 감지 및 수정, 향후 AI 기능 개선을 위한 가명처리 통계",
        ]}
      />
    </DocSection>

    <DocSection title="2. 처리하는 개인정보의 항목">
      <DocSub title="(1) 정보주체의 동의 없이 처리하는 개인정보 (서비스 제공에 필수)">
        <DocTable
          head={["법적 근거", "처리 목적", "처리 항목"]}
          rows={[
            [
              "「개인정보 보호법」 제15조제1항제4호 (계약 체결·이행)",
              "회원 가입 및 관리",
              "이메일, 닉네임, 구글 고유 식별자(Provider ID)",
            ],
            [
              "좌동",
              "서비스 제공",
              "운동 기록(루틴명, 운동 종목, 세트, 횟수, 무게), 걸음수 기록, 캐릭터 정보, 배틀 기록, 게임 내 재화 내역",
            ],
            [
              "좌동",
              "유료 결제 처리",
              "구매 내역(상품명, 결제 금액, 결제 일시), Google Play 주문번호, 구매 토큰, 청약철회·환불 내역",
            ],
            ["좌동", "광고 시청 보상 지급", "광고 식별자(GAID/IDFA), 광고 시청 기록"],
            ["좌동", "서비스 보안 및 오류 감지", "접속 IP, 기기 정보, 앱 이용 이력"],
          ]}
        />
        <DocNote>
          <b>온디바이스 처리 안내</b> 걸음수(만보계) 기능은 이용자의 단말기 내에서 직접 처리됩니다. 해당 정보는 이용자가
          &quot;보상 받기&quot; 버튼을 누르거나 다음 날 앱을 실행할 때에만 서버로 전송됩니다.
        </DocNote>
        <DocNote>
          <b>결제수단 정보 안내</b> 유료 결제는 Google Play 인앱 결제로 이루어집니다. 카드번호 등 결제수단 정보는 Google이
          처리하며, 회사는 이를 수집하지 않습니다.
        </DocNote>
      </DocSub>
      <DocSub title="(2) 정보주체의 동의를 받아 처리하는 개인정보 (선택)">
        <DocTable
          head={["법적 근거", "처리 목적", "처리 항목"]}
          rows={[["「개인정보 보호법」 제15조제1항제1호 (동의)", "마케팅 정보 수신", "이메일, 앱 푸시 알림 토큰"]]}
        />
        <DocP>회사는 야간(오후 9시부터 다음 날 오전 8시까지)에는 광고성 앱 푸시 알림을 보내지 않습니다.</DocP>
      </DocSub>
      <DocSub title="(3) 추후 수집 예정 항목 (별도 동의 획득 후 수집)">
        <DocP>성별, 나이, 체중(kg), 키(cm) — 건강 맞춤 서비스 제공 목적으로 추후 별도 동의 후 수집 예정</DocP>
      </DocSub>
    </DocSection>

    <DocSection title="3. 만 14세 미만 아동의 개인정보 처리">
      <DocList
        items={[
          "본 서비스는 만 14세 미만 아동의 회원가입을 허용하지 않습니다.",
          "회원가입 시 이용자는 본인이 만 14세 이상임에 동의하여야 하며, 만 14세 미만으로 확인되는 경우 회사는 해당 계정을 즉시 탈퇴 처리하고 수집된 개인정보를 파기합니다.",
        ]}
      />
    </DocSection>

    <DocSection title="4. 개인정보의 처리 및 보유 기간">
      <DocP>
        회사는 법령에 따른 개인정보 보유·이용 기간 또는 이용자로부터 동의받은 보유·이용 기간 내에서 개인정보를 처리합니다.
      </DocP>
      <DocTable
        head={["구분", "보유 기간"]}
        rows={[
          ["회원 정보 (이메일, 닉네임, 고유 식별자)", "회원 탈퇴 시까지"],
          ["운동 기록, 걸음수, 캐릭터 정보", "회원 탈퇴 시까지"],
          ["마케팅 수신 동의 정보", "동의 철회 시까지"],
          ["광고 시청 기록", "회원 탈퇴 시까지"],
        ]}
      />
      <DocSub title="관련 법령에 의한 보존 기간">
        <DocTable
          head={["보존 항목", "근거 법령", "보존 기간"]}
          rows={[
            ["계약 또는 청약철회 등에 관한 기록", "전자상거래법 시행령 제6조제1항제2호", "5년"],
            ["대금결제 및 재화 등의 공급에 관한 기록", "전자상거래법 시행령 제6조제1항제3호", "5년"],
            ["소비자 불만·분쟁처리 기록", "전자상거래법 시행령 제6조제1항제4호", "3년"],
            ["표시·광고에 관한 기록", "전자상거래법 시행령 제6조제1항제1호", "6개월"],
            ["접속 로그 기록", "통신비밀보호법 제15조의2", "3개월"],
          ]}
        />
      </DocSub>
    </DocSection>

    <DocSection title="5. 개인정보의 파기 절차 및 방법">
      <DocP>회사는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 해당 개인정보를 지체 없이 파기합니다.</DocP>
      <DocList
        items={[
          "전자적 파일 형태: 복구 및 재생이 불가능한 기술적 방법으로 영구 삭제",
          "출력물 등 비전자적 형태: 분쇄기로 분쇄하거나 소각",
        ]}
      />
    </DocSection>

    <DocSection title="6. 개인정보의 제3자 제공">
      <DocList
        items={[
          "회사는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.",
          "다만, 이용자의 동의가 있거나 법령의 규정에 의한 경우에는 예외적으로 제공할 수 있습니다.",
          "현재 제3자 제공 없음. 향후 제공 발생 시 사전에 별도 동의를 받겠습니다.",
        ]}
      />
    </DocSection>

    <DocSection title="7. 개인정보 처리업무의 위탁">
      <DocP>회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</DocP>
      <DocTable
        head={["수탁업체", "위탁 업무 내용", "보유·이용 기간"]}
        rows={[
          [
            "Amazon Web Services, Inc.",
            "서버 운영 및 데이터베이스 관리 (서울 리전, ap-northeast-2)",
            "회원 탈퇴 시 또는 위탁 계약 종료 시까지",
          ],
          ["Google LLC (Firebase Cloud Messaging)", "앱 푸시 알림 발송", "알림 발송 완료 후 즉시 파기"],
          ["Google LLC (Firebase Analytics)", "앱 이용 통계 분석", "Google LLC의 개인정보처리방침에 따름"],
          ["Google LLC (Google AdMob)", "광고 표시 및 광고 시청 보상 확인", "Google LLC의 개인정보처리방침에 따름"],
          ["Google LLC (Google Play 결제)", "인앱 결제 처리 및 환불", "관련 법령 및 Google LLC의 개인정보처리방침에 따름"],
          [
            "Supabase, Inc.",
            "앱 공지·팝업 내용 관리 (서울 리전, ap-northeast-2)",
            "회원 탈퇴 시 또는 위탁 계약 종료 시까지",
          ],
        ]}
      />
      <DocP>
        회사는 위탁 계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지,
        기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등의 내용을 계약서에 명시하고, 수탁자가
        개인정보를 안전하게 처리하는지를 감독합니다.
      </DocP>
    </DocSection>

    <DocSection title="8. 개인정보의 국외 이전">
      <DocP>
        서비스 제공 과정에서 이용자의 개인정보 일부가 다음과 같이 국외로 이전됩니다. 서버(AWS)와 데이터베이스(Supabase)는
        대한민국(서울 리전)에 있어 국외 이전에 해당하지 않습니다.
      </DocP>
      <DocTable
        head={["이전받는 자 (연락처)", "이전 국가", "이전 일시·방법", "이전 목적", "이전 항목", "보유·이용 기간"]}
        rows={[
          [
            `Google LLC (${GOOGLE_CONTACT})`,
            "미국",
            "알림을 보낼 때마다 네트워크를 통해 전송",
            "푸시 알림 발송",
            "기기 토큰, 알림 내용",
            "알림 발송 후 즉시 파기",
          ],
          [
            `Google LLC (${GOOGLE_CONTACT})`,
            "미국",
            "앱 이용 시 수시로 네트워크를 통해 전송",
            "앱 이용 통계 분석",
            "앱 이용 기록, 기기 정보, 광고 식별자",
            "Google LLC의 개인정보처리방침에 따름",
          ],
          [
            `Google LLC (${GOOGLE_CONTACT})`,
            "미국",
            "광고를 불러오거나 볼 때마다 네트워크를 통해 전송",
            "광고 표시 및 광고 시청 보상 확인",
            "광고 식별자, 기기 정보, 광고 노출·클릭·시청 기록",
            "Google LLC의 개인정보처리방침에 따름",
          ],
          [
            `Google LLC (${GOOGLE_CONTACT})`,
            "미국",
            "결제할 때 네트워크를 통해 전송",
            "인앱 결제 처리 및 환불",
            "구매 상품, 결제 금액, 주문번호, 구매 토큰",
            "관련 법령 및 Google LLC의 개인정보처리방침에 따름",
          ],
        ]}
      />
      <DocP>
        이용자는 개인정보의 국외 이전을 원하지 않는 경우 앱 내 설정 &gt; 회원 탈퇴를 통해 서비스 이용을 중단하고 개인정보
        이전을 거부할 수 있습니다.
      </DocP>
    </DocSection>

    <DocSection title="9. 개인정보의 안전성 확보 조치">
      <DocP>회사는 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적·관리적·물리적 조치를 취하고 있습니다.</DocP>
      <DocList
        items={[
          "기술적 조치: HTTPS 암호화 통신, JWT 기반 인증 및 접근 제어, 데이터베이스 접근 권한 최소화",
          "관리적 조치: 개인정보 처리 직원 최소화, 내부 관리 계획 수립·시행",
          "물리적 조치: AWS 클라우드 보안 인프라 활용 (ISO 27001 인증)",
        ]}
      />
    </DocSection>

    <DocSection title="10. 행태정보 수집·이용 및 맞춤형 광고에 관한 사항">
      <DocP>
        회사는 서비스 분석 및 맞춤형 광고 제공을 위해 제3자(Google LLC)가 이용자의 행태정보를 수집·이용하도록 허용하고
        있습니다.
      </DocP>
      <DocSub title="(1) Firebase Analytics — 서비스 분석">
        <DocTable
          head={["항목", "내용"]}
          rows={[
            ["수집하는 행태정보", "앱 실행 횟수, 화면별 체류 시간, 기능 사용 이력, 오류 발생 정보"],
            ["수집 목적", "서비스 이용 통계 분석 및 개선"],
            ["수집·처리하는 자", "Google LLC"],
            [
              "거부 방법",
              "iOS: 설정 > 개인정보 보호 및 보안 > 추적 > 앱 추적 허용 해제 / Android: 설정 > 보안 및 개인정보 보호 > 광고 > 광고 ID 삭제",
            ],
          ]}
        />
      </DocSub>
      <DocSub title="(2) Google AdMob — 광고 표시 및 맞춤형 광고">
        <DocTable
          head={["항목", "내용"]}
          rows={[
            ["수집하는 행태정보", "광고 식별자(IDFA/GAID), 앱 이용 이력, 광고 노출·클릭 이력"],
            ["수집 목적", "광고 표시, 광고 시청 보상 확인, 이용자 관심사 기반 맞춤형 광고 제공"],
            ["수집·처리하는 자", "Google LLC"],
            ["보유·이용 기간", "Google LLC의 개인정보처리방침에 따름"],
            [
              "거부 방법",
              "iOS: 설정 > 개인정보 보호 및 보안 > 추적 > 앱이 추적을 요청하도록 허용 해제 / Android: 설정 > 보안 및 개인정보 보호 > 기타 개인정보 설정 > 광고 > 광고 ID 재설정 또는 삭제",
            ],
          ]}
        />
      </DocSub>
      <DocP>
        Google LLC의 개인정보 처리 관련 자세한 사항은 Google 개인정보처리방침(https://policies.google.com/privacy)을
        참고하시기 바랍니다.
      </DocP>
    </DocSection>

    <DocSection title="11. 가명정보 처리에 관한 사항">
      <DocList
        items={[
          "회사는 현재 가명정보를 처리하지 않습니다.",
          "향후 통계 분석, AI 학습, 연구 목적으로 가명정보를 처리하게 되는 경우 「개인정보 보호법」 제28조의2에 따라 처리 목적, 처리 항목, 보유 기간 등을 본 처리방침에 별도로 공개하겠습니다.",
        ]}
      />
    </DocSection>

    <DocSection title="12. 정보주체와 법정대리인의 권리·의무 및 행사방법">
      <DocP>이용자는 개인정보주체로서 언제든지 다음의 권리를 행사할 수 있습니다.</DocP>
      <DocList items={["개인정보 열람 요구", "오류 등이 있을 경우 정정 요구", "삭제 요구", "처리 정지 요구"]} />
      <DocP>
        위의 권리 행사는 앱 내 설정 화면 또는 이메일({CONTACT_EMAIL})을 통해 요청하실 수 있으며, 회사는 이에 대해 지체 없이
        조치하겠습니다. 앱을 설치하지 않고도{" "}
        <Link href="/contact#delete" className="underline">
          계정 삭제 요청
        </Link>
        을 하실 수 있습니다.
      </DocP>
    </DocSection>

    <DocSection title="13. 개인정보 보호책임자">{OWNER_TABLE}</DocSection>

    <DocSection title="14. 정보주체의 권익침해에 대한 구제방법">{REMEDY_TABLE}</DocSection>

    <DocSection title="15. 개인정보 처리방침의 변경">
      <DocP>
        이 개인정보 처리방침은 시행일로부터 적용되며, 변경 사항이 있는 경우 변경 사항의 시행 7일 전부터 앱 내 공지사항을
        통해 고지합니다.
      </DocP>
      <DocTable
        head={["버전", "공고일", "시행일", "주요 변경 내용"]}
        rows={[
          [
            "v1.1",
            "2026.11.07",
            "2026.11.14",
            "위탁·국외 이전 정리 (AWS·Supabase 서울 리전 반영, Firebase Analytics·Google AdMob·Google Play 결제 추가, 이전 일시·방법과 연락처 추가), 유료 결제·광고 보상 관련 처리 항목과 보존 기간 추가, 야간 광고성 알림 미발송 명시, 웹사이트 계정 삭제 요청 안내",
          ],
          [
            <a key="v1" href={APP_POLICY_V1_URL} target="_blank" rel="noopener noreferrer" className="underline">
              v1.0
            </a>,
            "2026.07.24",
            "2026.07.24",
            "최초 시행",
          ],
        ]}
      />
    </DocSection>
  </div>
);

// ── 웹사이트 (블로그·문의하기)
const WEB_POLICY = (
  <div className="flex flex-col gap-10">
    <DocP>
      {BUSINESS_NAME}(이하 &quot;회사&quot;)은 {SITE_NAME} 웹사이트(이하 &quot;사이트&quot;)를 운영하며, 이용자의 개인정보를
      중요하게 생각하고 「개인정보 보호법」 등 관련 법령을 준수합니다.
    </DocP>

    <DocSection title="1. 수집하는 개인정보">
      <DocList
        items={[
          "방문 기록: 웹사이트 이용 통계를 위해 Google Analytics가 쿠키를 통해 접속 기기, 브라우저, 방문 페이지, 유입 경로 등의 정보를 수집합니다. 이 정보로 개인을 직접 식별하지 않습니다.",
          "문의 정보: 문의하기 양식 또는 이메일로 문의하시는 경우 이메일 주소, 문의 유형, 문의 내용을 받습니다. 계정 삭제 요청은 앱에서 쓰는 구글 계정 이메일을 받아 본인 확인에 씁니다.",
          "버그 제보 정보: 버그 제보 시 제보 내용(이후 주고받는 대화 포함)과, 적으신 경우 이메일 주소를 받습니다.",
          "문의하기 양식과 버그 제보는 수집·이용에 동의하신 경우에만 접수됩니다.",
          "버그 제보 채팅방 열쇠: 보낸 제보를 같은 브라우저에서 다시 볼 수 있도록, 채팅방을 여는 무작위 값을 이용자의 브라우저에 저장합니다. 브라우저 저장 데이터를 지우면 함께 삭제됩니다.",
        ]}
      />
    </DocSection>

    <DocSection title="2. 이용 목적">
      <DocList
        items={[
          "웹사이트 이용 현황 분석 및 콘텐츠 개선",
          "문의에 대한 답변, 버그 제보 확인 및 답변",
          "앱 계정 삭제 요청 처리",
        ]}
      />
    </DocSection>

    <DocSection title="3. 보유 및 이용 기간">
      <DocList
        items={[
          "방문 기록: Google Analytics 보관 설정 기간 동안 보관 후 삭제됩니다.",
          "문의·버그 제보 정보: 처리 완료 후 지체 없이 파기합니다. 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.",
        ]}
      />
    </DocSection>

    <DocSection title="4. 개인정보 처리 위탁">
      <DocTable
        head={["수탁업체", "위탁 업무 내용"]}
        rows={[
          ["Supabase, Inc.", "데이터 저장: 문의하기·버그 제보로 접수된 내용과 대화 (서울 리전, ap-northeast-2)"],
          ["Vercel Inc.", "웹사이트 호스팅 및 서버 실행"],
          ["Google LLC (Google Analytics)", "웹사이트 이용 통계 분석"],
        ]}
      />
    </DocSection>

    <DocSection title="5. 개인정보의 국외 이전">
      <DocP>데이터베이스(Supabase)는 대한민국(서울 리전)에 있습니다. 다음 정보는 국외에서 처리됩니다.</DocP>
      <DocTable
        head={["이전받는 자 (연락처)", "이전 국가", "이전 일시·방법", "이전 목적", "이전 항목", "보유·이용 기간"]}
        rows={[
          [
            "Vercel Inc. (privacy@vercel.com)",
            "미국",
            "사이트 이용 시 네트워크를 통해 전송",
            "웹사이트 호스팅 및 서버 실행",
            "접속 정보, 문의하기·버그 제보로 보낸 내용 (서버를 거쳐 데이터베이스에 저장)",
            "처리 즉시 (서버에 따로 저장하지 않음)",
          ],
          [
            `Google LLC (${GOOGLE_CONTACT})`,
            "미국",
            "사이트 방문 시 수시로 네트워크를 통해 전송",
            "웹사이트 이용 통계 분석",
            "쿠키 식별자, 접속 기기·브라우저 정보, 방문 페이지, 유입 경로",
            "Google Analytics 보관 설정 기간",
          ],
        ]}
      />
      <DocP>국외 이전을 원하지 않으시면 브라우저에서 쿠키를 거부하시거나 문의하기를 이용하지 않으시면 됩니다.</DocP>
    </DocSection>

    <DocSection title="6. 쿠키 거부 방법">
      <DocP>브라우저 설정에서 쿠키 저장을 거부할 수 있습니다. 쿠키를 거부해도 웹사이트 이용에는 제한이 없습니다.</DocP>
    </DocSection>

    <DocSection title="7. 이용자의 권리">
      <DocP>
        이용자는 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있으며, 아래 문의처로 연락하시면 지체 없이
        조치하겠습니다.
      </DocP>
    </DocSection>

    <DocSection title="8. 개인정보 보호책임자">
      {OWNER_TABLE}
      <DocP>문의 가능 시간: {CONTACT_HOURS}</DocP>
    </DocSection>

    <DocSection title="9. 정보주체의 권익침해에 대한 구제방법">{REMEDY_TABLE}</DocSection>

    <DocSection title="10. 시행일">
      <DocP>이 방침은 2026년 11월 7일부터 시행합니다. (이전 시행일: 2026년 10월 12일)</DocP>
    </DocSection>
  </div>
);

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-[#f5f5f7]">
      <div className="mx-auto max-w-[860px] px-6 py-16 md:py-24">
        <h1 className="text-[32px] font-bold text-[#1d1d1f]">개인정보처리방침</h1>
        <p className="mt-3 mb-8 text-[15px] leading-[1.7] text-[#6e6e73]">
          {SITE_NAME} 앱과 웹사이트에서 받는 개인정보가 달라서 탭으로 나눠 안내합니다.
        </p>

        <HashTabs
          tabs={[
            {
              key: "app",
              label: "앱",
              content: (
                <div className="rounded-[24px] bg-white p-6 md:p-10">
                  <p className="mb-8 text-[14px] text-[#8e8e93]">HolyHabit 앱 · 시행일 2026년 11월 14일 (공고일 2026년 11월 7일)</p>
                  {APP_POLICY}
                </div>
              ),
            },
            {
              key: "web",
              label: "웹사이트",
              content: (
                <div className="rounded-[24px] bg-white p-6 md:p-10">
                  <p className="mb-8 text-[14px] text-[#8e8e93]">{SITE_NAME} 웹사이트 · 시행일 2026년 11월 7일</p>
                  {WEB_POLICY}
                </div>
              ),
            },
          ]}
        />

        <p className="mt-6 text-[13px] leading-[1.7] text-[#8e8e93]">
          운영자: {BUSINESS_NAME} · 대표 {BUSINESS_OWNER} · 사업자등록번호 {BUSINESS_REG_NO} · {BUSINESS_ADDRESS_TEXT}
        </p>
      </div>
    </main>
  );
}
