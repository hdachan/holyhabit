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
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
