import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/posts";

type PageProps = {
  // Next.js 15부터 params가 Promise로 전달됩니다. 14 이하에서도
  // await은 일반 값에 대해 즉시 통과되므로 아래 방식이 두 버전 모두에서 동작합니다.
  params: Promise<{ slug: string }> | { slug: string };
};

// 정적 경로 생성 (빌드 시 현재 Supabase에 있는 글 기준으로 미리 만들어둡니다)
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPost(slug);

  if (!item) {
    notFound();
  }

  const related = await getRelatedPosts(item.slug, 3);

  return (
    <div className="min-h-screen bg-white">
      <main className="bg-[#f5f5f7]">
        {/* 대표 사진 자리 — 화면 맨 위, 전체 폭 */}
        {item.imageUrl ? (
          <div className="relative h-[360px] w-full md:h-[480px]">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="flex h-[360px] w-full items-center justify-center bg-[#e5e5e7] text-[14px] text-[#8e8e93] md:h-[480px]">
            사진 준비중
          </div>
        )}

        <div className="mx-auto max-w-[760px] px-[18px] py-12">
          {/* 콘텐츠 홈으로 돌아가기 */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1 text-[15px] text-[#6e6e73] hover:text-[#1d1d1f]"
          >
            ← 콘텐츠 홈으로 돌아가기
          </Link>

          {/* 글 (제목/메타) */}
          <p className="mb-3 text-[15px] font-medium text-[#6e6e73]">
            {item.eyebrow}
          </p>
          <h1 className="mb-4 text-[36px] font-bold leading-[1.2] text-[#1d1d1f] md:text-[44px]">
            {item.title}
          </h1>
          <p className="mb-10 text-[15px] text-[#6e6e73]">{item.date}</p>

          {/* 본문 — Tiptap 에디터에서 저장된 HTML */}
          <div
            className="post-body text-[18px] leading-[1.7] text-[#1d1d1f]/90"
            dangerouslySetInnerHTML={{ __html: item.body }}
          />
        </div>

        {/* 연관 콘텐츠 */}
        {related.length > 0 && (
          <div className="border-t border-black/5 bg-white">
            <div className="mx-auto max-w-[1200px] px-[18px] py-12">
              <h2 className="mb-6 text-[24px] font-bold tracking-tight text-[#1d1d1f]">
                연관 콘텐츠
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/news/${r.slug}`}
                    className="block overflow-hidden rounded-[20px] bg-[#f5f5f7] shadow-sm transition hover:shadow-md"
                  >
                    {r.imageUrl ? (
                      <div className="relative h-[160px] w-full">
                        <Image
                          src={r.imageUrl}
                          alt={r.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-[160px] w-full items-center justify-center bg-[#e5e5e7] text-[13px] text-[#8e8e93]">
                        사진 준비중
                      </div>
                    )}
                    <div className="p-5">
                      <p className="mb-2 text-[13px] font-medium text-[#6e6e73]">
                        {r.eyebrow}
                      </p>
                      <h3 className="text-[16px] font-bold leading-snug text-[#1d1d1f]">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}