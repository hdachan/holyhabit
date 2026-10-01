import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 검색엔진 크롤러 규칙. /robots.txt로 제공된다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 관리자 화면은 검색 결과에 나올 이유가 없다.
      disallow: "/admin",
    },
    // 구글·네이버가 sitemap 위치를 자동으로 찾도록 알려준다.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
