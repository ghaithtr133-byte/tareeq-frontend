import Image from "next/image";
import { Suspense } from "react";
import { innerPageHero } from "@/lib/inner-page-hero";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { createPageMetadata } from "@/lib/seo";
import { ArticlesDirectoryLive } from "@/components/public/articles-directory-live";
import { SkeletonResults } from "@/components/public/content-skeletons";

export const metadata = createPageMetadata(
  "المقالات",
  "مقالات ونصائح تعليمية تساعدك في رحلتك الأكاديمية والاستعداد للدراسة في الخارج.",
  { index: true, pathname: "/articles" },
);

export default function ArticlesPage() {
  return (
    <main className="bg-[#F6F8FB] pb-8 text-primary">
      <section
        aria-labelledby="articles-title"
        className="relative isolate overflow-hidden border-b border-[#E3EAF1] bg-[#F7FAFD]"
      >
        <div
          data-articles-hero-art
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/2 opacity-20 md:w-[42%] md:opacity-100"
        >
          <Image
            src="/images/articles/articles-hero.png"
            alt=""
            fill
            loading="eager"
            sizes="(min-width: 768px) 42vw, 50vw"
            className="object-cover object-left"
          />
          <span className="absolute inset-0 bg-gradient-to-l from-[#F7FAFD] via-transparent to-transparent" />
        </div>
        <Container className={innerPageHero.content}>
          <nav aria-label="مسار التنقل" className={innerPageHero.breadcrumb}>
            <ol className="flex gap-2">
              <li>
                <Link href="/" className="rounded-sm hover:underline">
                  الرئيسية
                </Link>
                <span className="ms-2" aria-hidden="true">
                  /
                </span>
              </li>
              <li aria-current="page">المقالات</li>
            </ol>
          </nav>
          <div className="relative z-10 pb-1 md:w-[58%] md:pb-2">
            <p className="mb-1 text-sm font-bold text-[#A27A35]">
              مقالات ونصائح
            </p>
            <h1 id="articles-title" className={innerPageHero.title}>
              أحدث المقالات
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              اكتشف مقالاتنا التعليمية التي تساعدك في رحلتك الأكاديمية، وتقدم لك
              نصائح وخبرات مهمة للدراسة في الخارج.
            </p>
          </div>
        </Container>
      </section>
      <Container className="pt-3 sm:pt-4">
        <Suspense fallback={<SkeletonResults kind="article" label="جارٍ تحميل المقالات…" />}><ArticlesDirectoryLive /></Suspense>
      </Container>
    </main>
  );
}
