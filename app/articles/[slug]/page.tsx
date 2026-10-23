import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getArticle, getArticles, getScholarships } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { ArticleRecommendationList, ScholarshipRecommendationList } from "@/components/public/article-recommendations";
import { ArticleTableOfContents } from "@/components/public/article-toc";
import { Breadcrumbs, ContentSection } from "@/components/public/page-components";
import { ApiUnavailable, ArticleBlocks, DetailImage } from "@/components/public/public-content";
import { buildArticleToc } from "@/lib/article-toc";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function publishedLabel(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("ar", { dateStyle: "long" }).format(new Date(value));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await getArticle(slug);
    return createPageMetadata(article.seoTitleAr ?? article.titleAr, article.seoDescriptionAr ?? article.summaryAr, {
      index: true,
      pathname: `/articles/${article.slug}`,
      imageUrl: article.coverImageUrl,
      publishedAt: article.publishedAt,
      article: true,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return createPageMetadata("المقال", "المقال المنشور لدى طريق الأكاديمية.");
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  let article;

  try {
    article = await getArticle(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <main><ContentSection><Container className="max-w-5xl"><ApiUnavailable /></Container></ContentSection></main>;
  }

  const [latestArticlesResult, scholarshipsResult] = await Promise.allSettled([
    getArticles({ limit: 4, sort: "newest" }),
    getScholarships({ country: article.country?.slug, university: article.university?.slug, limit: 3, sort: "newest" }),
  ]);
  const latestArticles = latestArticlesResult.status === "fulfilled"
    ? latestArticlesResult.value.items.filter((item) => item.id !== article.id).slice(0, 3)
    : [];
  const scholarships = scholarshipsResult.status === "fulfilled" ? scholarshipsResult.value.items.slice(0, 3) : [];
  const tocItems = buildArticleToc(article.bodyAr);
  const published = publishedLabel(article.publishedAt);
  const isFixturePreview = process.env.TAREEQ_PUBLIC_API_FIXTURE_PREVIEW === "true";

  return (
    <main>
      <Breadcrumbs items={[{ href: "/", label: "الرئيسية" }, { href: "/articles", label: "المقالات" }, { label: article.titleAr }]} />
      <ContentSection>
        <Container className="max-w-7xl">
          {isFixturePreview ? <p className="mb-5 w-fit border border-[#8A6428]/35 bg-[#F7F1E5] px-3 py-1 text-xs font-bold tracking-[0.12em] text-[#6D4D1F]" dir="ltr">MOCK PREVIEW</p> : null}
          <div className="grid gap-8 xl:grid-cols-[15rem_minmax(0,1fr)_16rem] xl:items-start xl:gap-8" dir="ltr">
            <aside className="hidden xl:sticky xl:top-28 xl:block xl:self-start" dir="rtl">
              <div className="border border-primary/15 bg-card p-5">
                <ArticleTableOfContents items={tocItems} variant="desktop" />
                <a href="https://wa.me/963992277142" target="_blank" rel="noreferrer" className="mt-5 block border-b-2 border-[#D4B57A] bg-primary px-4 py-4 text-center text-primary-foreground transition-colors hover:bg-[#203A5E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                  <span className="block text-base font-bold">قدّم الآن</span>
                  <span className="mt-1 block text-xs leading-5 text-primary-foreground/75">تواصل معنا لمساعدتك في التقديم</span>
                </a>
              </div>
            </aside>
            <article className="min-w-0" dir="rtl">
              <header className="border-b border-border/80 pb-8 sm:pb-10">
                <p className="text-sm font-semibold text-[#8A6428]">مقال تعليمي</p>
                <h1 id="page-title" className="mt-3 text-3xl font-bold leading-[1.4] tracking-[-0.025em] text-primary sm:text-5xl xl:text-[3.25rem]">{article.titleAr}</h1>
                <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">{article.summaryAr}</p>
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {published ? <time dateTime={article.publishedAt ?? undefined}>{published}</time> : null}
                  {article.country ? <Link href={`/study-abroad/${article.country.slug}`} className="font-semibold text-primary hover:text-accent">الدراسة في {article.country.nameAr}</Link> : null}
                </div>
              </header>
              <DetailImage src={article.coverImageUrl} alt={article.coverImageAltAr} />
              <div className="mt-6 space-y-4 xl:hidden">
                <ArticleTableOfContents items={tocItems} variant="mobile" />
                <a href="https://wa.me/963992277142" target="_blank" rel="noreferrer" className="block border-b-2 border-[#D4B57A] bg-primary px-5 py-4 text-center text-primary-foreground transition-colors hover:bg-[#203A5E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                  <span className="block text-base font-bold">قدّم الآن</span>
                  <span className="mt-1 block text-xs leading-5 text-primary-foreground/75">تواصل معنا لمساعدتك في التقديم</span>
                </a>
                <ArticleRecommendationList articles={latestArticles} compact />
              </div>
              <ArticleBlocks blocks={article.bodyAr} />
              {article.country || article.university || article.scholarship ? (
                <nav aria-label="محتوى مرتبط" className="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-t border-primary/15 pt-6 text-sm font-bold text-primary">
                  {article.country ? <Link href={`/study-abroad/${article.country.slug}`} className="hover:text-accent">وجهة: {article.country.nameAr}</Link> : null}
                  {article.university ? <Link href={`/universities/${article.university.slug}`} className="hover:text-accent">جامعة: {article.university.nameAr}</Link> : null}
                  {article.scholarship ? <Link href={`/scholarships/${article.scholarship.slug}`} className="hover:text-accent">منحة: {article.scholarship.titleAr}</Link> : null}
                </nav>
              ) : null}
              <aside aria-labelledby="article-consultation-title" className="mt-10 border-e-4 border-accent bg-primary px-6 py-7 text-primary-foreground sm:px-8">
                <p className="text-sm font-semibold text-[#D4B57A]">خطوتك التالية</p>
                <h2 id="article-consultation-title" className="mt-3 text-2xl font-bold leading-9">تحتاج مساعدة في اختيار خطوتك الدراسية؟</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-primary-foreground/80">رتّب أسئلتك واطلب إرشادًا تعليميًا يناسب المعلومات المنشورة التي تقرؤها.</p>
                <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center border border-primary-foreground/30 px-5 text-sm font-bold text-primary-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">تواصل مع فريقنا</Link>
              </aside>
              <div className="mt-12"><ScholarshipRecommendationList scholarships={scholarships} /></div>
            </article>
            <aside className="hidden xl:sticky xl:top-28 xl:block xl:self-start" dir="rtl">
              <ArticleRecommendationList articles={latestArticles} compact />
            </aside>
          </div>
        </Container>
      </ContentSection>
    </main>
  );
}
