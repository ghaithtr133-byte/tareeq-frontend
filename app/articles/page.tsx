import Image from "next/image";
import { innerPageHero } from "@/lib/inner-page-hero";
import Link from "next/link";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { redirect } from "next/navigation";
import { getArticles, getCountries } from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { ArticleDirectoryCard } from "@/components/public/article-directory-card";
import { ArticleDirectoryFilters } from "@/components/public/article-directory-filters";
import { ArticleDirectoryPagination } from "@/components/public/article-directory-pagination";
import {
  articleDirectoryHref,
  articleFilterValues,
  directoryArticleParams,
  editorialArticles,
} from "@/lib/article-directory";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import type { RouteSearchParams } from "@/lib/public-search-params";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata(
  "المقالات",
  "مقالات ونصائح تعليمية تساعدك في رحلتك الأكاديمية والاستعداد للدراسة في الخارج.",
  { index: true, pathname: "/articles" },
);

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  const params = directoryArticleParams(await searchParams);
  const values = articleFilterValues(params);
  const [articles, countries] = await Promise.allSettled([
    getArticles(params),
    getCountries({ limit: 50, sort: "manual" }),
  ]);
  const result = articles.status === "fulfilled" ? articles.value : null;
  if (result && params.page! > Math.max(1, result.pagination.totalPages))
    redirect(
      articleDirectoryHref(values, Math.max(1, result.pagination.totalPages)),
    );
  let items = result?.items ?? [];
  if (isPublicDemoMode()) {
    const { withDemoArticleDirectoryMedia } =
      await import("@/lib/mocks/article-directory-fixtures");
    items = withDemoArticleDirectoryMedia(items);
  }
  const editorial = editorialArticles(items);
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
        <ArticleDirectoryFilters
          values={values}
          countries={
            countries.status === "fulfilled"
              ? countries.value.items.map((country) => ({
                  value: country.slug,
                  label: country.nameAr,
                }))
              : []
          }
          optionError={countries.status === "rejected"}
        >
          <section
            id="article-results"
            aria-label="نتائج المقالات"
            className="scroll-mt-28 pt-2"
          >
            {result ? (
              <p className="mb-2 text-right text-sm leading-6 text-muted-foreground">
                تم العثور على{" "}
                <strong className="font-bold text-[#17669C]">
                  {result.pagination.total}
                </strong>{" "}
                مقال
              </p>
            ) : null}
            {!result ? (
              <div
                role="alert"
                className="rounded-xl border border-[#DFE6ED] bg-white p-6"
              >
                <h2 className="text-lg font-bold">
                  يتعذر تحميل المقالات حالياً
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  تعذر الاتصال بمصدر المقالات المنشورة. يرجى المحاولة مرة أخرى.
                </p>
                <a
                  href={articleDirectoryHref(values, params.page)}
                  className="mt-3 inline-flex min-h-11 items-center rounded-sm text-sm font-bold text-[#17669C]"
                >
                  إعادة المحاولة
                </a>
              </div>
            ) : items.length ? (
              <>
                {editorial.featured.length ? (
                  <BalancedCardGrid
                    data-article-featured
                    columns={{ md: 2 }}
                  >
                    {editorial.featured.map((article) => (
                      <ArticleDirectoryCard
                        key={article.id}
                        article={article}
                        prominent
                      />
                    ))}
                  </BalancedCardGrid>
                ) : null}
                {editorial.regular.length ? (
                  <BalancedCardGrid
                    data-article-grid
                    columns={{ md: 2, xl: 4 }}
                    className={editorial.featured.length ? "mt-5" : ""}
                  >
                    {editorial.regular.map((article) => (
                      <ArticleDirectoryCard
                        key={article.id}
                        article={article}
                      />
                    ))}
                  </BalancedCardGrid>
                ) : null}
              </>
            ) : (
              <div className="rounded-xl border border-[#DFE6ED] bg-white p-6">
                <h2 className="text-lg font-bold">لا توجد مقالات تطابق بحثك</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  جرّب كلمات بحث أخرى أو أزل بعض الفلاتر.
                </p>
                <Link
                  href="/articles"
                  className="mt-3 inline-flex min-h-11 items-center rounded-sm text-sm font-bold text-[#17669C]"
                >
                  مسح الفلاتر
                </Link>
              </div>
            )}
            {result ? (
              <ArticleDirectoryPagination
                pagination={result.pagination}
                values={values}
              />
            ) : null}
          </section>
        </ArticleDirectoryFilters>
      </Container>
    </main>
  );
}
