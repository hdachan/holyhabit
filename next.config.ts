import type { NextConfig } from "next";

// next/image가 변환해 줄 외부 이미지는 우리 Supabase Storage 공개 이미지로만 제한한다.
// "**"(모든 도메인)로 두면 아무 외부 이미지나 우리 서버를 거쳐 변환되어 사용량이 낭비된다.
const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // 회사 소개는 다시 /about에 있다 (예전 "/about → /" 이동은 지웠다).
  async redirects() {
    return [
      // 글 목록을 /news에서 /blog로 옮겼다. 예전 주소·검색 결과·글 본문 속 예전 링크도
      // 새 주소로 영구 이동(301)시켜서 검색엔진이 쌓아둔 평가가 새 주소로 넘어가게 한다.
      { source: "/news", destination: "/blog", permanent: true },
      { source: "/news/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
