import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "./site";

/**
 * 페이지별 공유 미리보기(openGraph) 정보.
 * 하위 페이지에서 openGraph를 지정하면 layout 값과 병합되지 않고 통째로 교체되므로,
 * 공통 값(siteName, locale, 기본 이미지)을 매번 빠뜨리지 않도록 여기서 함께 채운다.
 * 트위터(X) 카드는 지정하지 않으면 이 값을 그대로 따라간다.
 */
export function pageOpenGraph({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title,
    description,
    url,
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  };
}
