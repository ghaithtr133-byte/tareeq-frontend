import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { getArticle, getArticles, getScholarship } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { ArticleRecommendationList, ScholarshipRecommendationList } from "@/components/public/article-recommendations";
import { ArticleTableOfContents } from "@/components/public/article-toc";
import { ArticleReadingLayout } from "@/components/public/article-reading-layout";
import { ArticleConsultation } from "@/components/public/article-consultation";
import { ArticleDetailMedia } from "@/components/public/article-detail-media";
import { ContentSection } from "@/components/public/page-components";
import { ApiUnavailable, ArticleBlocks } from "@/components/public/public-content";
import { buildArticleToc } from "@/lib/article-toc";
import { articleRelatedScholarships, latestOtherArticles } from "@/lib/article-details";
import { articlePublicationDate } from "@/lib/article-directory";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { createPageMetadata } from "@/lib/seo";
import { innerPageHero } from "@/lib/inner-page-hero";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
const loadArticle = cache(getArticle);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await loadArticle(slug);
    return createPageMetadata(article.seoTitleAr ?? article.titleAr, article.seoDescriptionAr ?? article.summaryAr, { index: true, pathname: `/articles/${article.slug}`, imageUrl: article.coverImageUrl, publishedAt: article.publishedAt, article: true });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return createPageMetadata("المقال", "المقال المنشور لدى طريق الأكاديمية.");
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  let source;
  try { source = await loadArticle(slug); }
  catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <main><ContentSection><Container className="max-w-5xl"><ApiUnavailable /></Container></ContentSection></main>;
  }
  const demo = isPublicDemoMode();
  const [latestResult, detailResult] = await Promise.allSettled([
    getArticles({ limit: 4, sort: "newest" }),
    demo ? import("@/lib/mocks/article-detail-fixtures").then(({ demoArticleDetails }) => demoArticleDetails(source))
      : articleRelatedScholarships(source, getScholarship).then((scholarships) => ({ article: source, scholarships })),
  ]);
  const { article, scholarships } = detailResult.status === "fulfilled" ? detailResult.value : { article: source, scholarships: [] };
  const latest = latestResult.status === "fulfilled" ? latestOtherArticles(latestResult.value.items, article.id) : [];
  const media = demo ? (await import("@/lib/mocks/scholarship-directory-fixtures")).demoScholarshipMedia : undefined;
  const toc = buildArticleToc(article.bodyAr);
  const published = articlePublicationDate(article.publishedAt);
  return <main className="bg-[#F7F9FC] pb-8 text-primary">
    <Container className="max-w-[96rem] pt-4 2xl:max-w-[96rem]">
      <nav aria-label="مسار التنقل" className={innerPageHero.breadcrumb}><ol className="flex flex-wrap gap-x-2 gap-y-1"><li><Link href="/" className="rounded-sm hover:underline">الرئيسية</Link><span className="ms-2" aria-hidden="true">/</span></li><li><Link href="/articles" className="rounded-sm hover:underline">المقالات</Link><span className="ms-2" aria-hidden="true">/</span></li><li aria-current="page">{article.titleAr}</li></ol></nav>
      <ArticleReadingLayout key={article.id} items={toc}>
        <div data-article-columns className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)_minmax(0,1fr)]" dir="ltr">
          <aside data-article-left className="hidden min-w-0 self-stretch xl:col-start-1 xl:row-start-1 xl:block" dir="rtl"><div className="sticky top-[var(--article-header-offset,6rem)] space-y-5"><ArticleTableOfContents items={toc} variant="desktop" /><ArticleConsultation titleId="article-desktop-consultation-title" /></div></aside>
          <article data-main-article className="min-w-0 lg:col-start-1 lg:row-start-1 xl:col-start-2" dir="rtl">
            <header className={innerPageHero.reading}><h1 id="page-title" className={innerPageHero.title}>{article.titleAr}</h1><p className="mt-3 text-base leading-8 text-muted-foreground">{article.summaryAr}</p><div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[#E1E7EE] bg-white px-3 py-3 text-xs leading-6 text-muted-foreground">{published ? <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden="true" /><time dateTime={article.publishedAt!}>{published}</time></span> : null}{article.country ? <Link href={`/study-abroad/${article.country.slug}`} className="inline-flex items-center gap-1.5 rounded-sm font-bold text-primary hover:underline"><MapPin className="size-4" aria-hidden="true" />{article.country.nameAr}</Link> : null}{!published && !article.country ? <span>مقال تعليمي</span> : null}</div></header>
            <div data-article-cover className="relative mt-5 aspect-[2/1] overflow-hidden rounded-xl border border-[#E1E7EE] bg-secondary xl:aspect-[16/5]"><ArticleDetailMedia src={article.coverImageUrl} alt={article.coverImageAltAr} /></div>
            <div className="mt-4 xl:hidden"><ArticleTableOfContents items={toc} variant="mobile" /></div>
            {demo ? <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-900">محتوى تجريبي توضيحي. العلاقات والمعلومات المعروضة ليست إعلاناً رسمياً أو ضماناً للقبول أو التمويل.</p> : null}
            <ArticleBlocks blocks={article.bodyAr} />
            {article.country || article.university ? <nav aria-label="محتوى مرتبط" className="mt-7 flex flex-wrap gap-4 border-t border-[#E1E7EE] pt-4 text-sm font-bold"><span className="sr-only">استكشف المحتوى المرتبط</span>{article.country ? <Link href={`/study-abroad/${article.country.slug}`} className="inline-flex min-h-11 items-center rounded-sm hover:underline">وجهة: {article.country.nameAr}</Link> : null}{article.university ? <Link href={`/universities/${article.university.slug}`} className="inline-flex min-h-11 items-center rounded-sm hover:underline">جامعة: {article.university.nameAr}</Link> : null}</nav> : null}
<div className="mt-6 xl:hidden"><ArticleConsultation titleId="article-mobile-consultation-title" /></div>
          </article>
          <aside data-article-right className="grid min-w-0 gap-5 md:grid-cols-2 lg:col-start-2 lg:row-start-1 lg:grid-cols-1 xl:col-start-3" dir="rtl"><div className="order-2 min-w-0 lg:order-1"><ArticleRecommendationList articles={latest} /></div>{scholarships.length ? <div className="order-1 min-w-0 lg:order-2"><ScholarshipRecommendationList scholarships={scholarships} media={media} /></div> : null}</aside>
        </div>
      </ArticleReadingLayout>
    </Container>
  </main>;
}
