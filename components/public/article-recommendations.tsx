import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import type { Article } from "@/api/public-content";
import type { ArticleScholarship } from "@/lib/article-detail-live";
import { ArticleDetailMedia } from "@/components/public/article-detail-media";
import { ScholarshipCountryFlag } from "@/components/public/scholarship-country-flag";
import { articlePublicationDate } from "@/lib/article-directory";
import { EmptyState } from "@/components/ui/content-state";
import { HomeSectionError } from "@/components/home/home-section-error";

const panel = "min-w-0 rounded-2xl border border-[#E1E7EE] bg-white p-4 shadow-[0_4px_18px_-12px_rgba(8,43,80,0.2)]";
const scholarshipStatus = (item: ArticleScholarship) => item.effectiveApplicationStatus ?? item.applicationStatus;
const directoryApplicationStatus = (item: ArticleScholarship) => ["OPEN", "CLOSED"].includes(scholarshipStatus(item) ?? "") ? scholarshipStatus(item) : null;
export function ArticleRecommendationList({ articles, live = false, failed = false }: { articles: Article[]; live?: boolean; failed?: boolean }) {
  if (!articles.length && !live) return null;
  return <section aria-labelledby="latest-articles-title" className={panel}>
    <h2 id="latest-articles-title" className="mb-3 flex items-center gap-2 text-lg font-bold leading-8 text-primary"><BookOpen className="size-5 shrink-0 text-[#B68B3D]" aria-hidden="true" />أحدث المقالات</h2>
    {failed ? <HomeSectionError title="تعذّر تحميل أحدث المقالات" description="يرجى المحاولة مجدداً." /> : !articles.length ? <EmptyState title="لا توجد مقالات أخرى حالياً" description="ستظهر المقالات المنشورة هنا عند توفرها." /> : null}
    <div className="divide-y divide-[#E8EDF3]">{articles.map((article) => <Link key={article.id} href={`/articles/${article.slug}`} data-latest-article={article.id} className="group grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-3 rounded-sm py-3 first:pt-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary"><ArticleDetailMedia src={article.coverImageUrl} alt={article.coverImageAltAr} compact live={live} /></div>
      <div className="min-w-0"><h3 className="line-clamp-3 text-sm font-bold leading-6 text-primary group-hover:text-[#17669C]">{article.titleAr}</h3>{articlePublicationDate(article.publishedAt) ? <time dateTime={article.publishedAt!} className="mt-1 block text-xs leading-6 text-muted-foreground">{articlePublicationDate(article.publishedAt)}</time> : null}</div>
    </Link>)}</div>
    <Link href="/articles" className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-bold text-[#17669C]">عرض جميع المقالات<ArrowLeft className="size-4" aria-hidden="true" /></Link>
  </section>;
}

export function ScholarshipRecommendationList({ scholarships, media = {}, live = false, failed = false }: { scholarships: ArticleScholarship[]; media?: Record<string, { src: string; alt: string }>; live?: boolean; failed?: boolean }) {
  const published = scholarships.filter((item) => item.status === "PUBLISHED").slice(0, 3);
  if (!published.length && !live) return null;
  return <section aria-labelledby="related-scholarships-title" className={panel}>
    <h2 id="related-scholarships-title" className="mb-3 flex items-start gap-2 text-base font-bold leading-8 text-primary xl:text-lg"><GraduationCap className="mt-1 size-5 shrink-0 text-[#B68B3D]" aria-hidden="true" />المنح المرتبطة بهذا الموضوع</h2>
    {failed ? <HomeSectionError title="تعذّر تحميل المنح المرتبطة" description="يرجى المحاولة مجدداً." /> : !published.length ? <EmptyState title="لا توجد منح مرتبطة حالياً" description="لا تتوفر منح منشورة مرتبطة بهذا المقال." /> : null}
    <div className="divide-y divide-[#E8EDF3]">{published.map((scholarship) => <Link key={scholarship.id} href={`/scholarships/${scholarship.slug}`} data-related-scholarship={scholarship.id} className="group grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-3 rounded-sm py-3 first:pt-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary"><ArticleDetailMedia src={live ? scholarship.imageUrl ?? null : media[scholarship.slug]?.src ?? null} alt={live ? null : media[scholarship.slug]?.alt ?? null} compact live={live} /></div>
      <div className="min-w-0"><h3 className="line-clamp-3 text-sm font-bold leading-6 text-primary group-hover:text-[#17669C]">{scholarship.titleAr}</h3>{scholarship.country ? <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs leading-6 text-muted-foreground"><span className="scale-75 origin-right"><ScholarshipCountryFlag slug={scholarship.country.slug} name={scholarship.country.nameAr} /></span>{scholarship.country.nameAr}</div> : null}<span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[0.6875rem] leading-5 ${(live ? directoryApplicationStatus(scholarship) : scholarshipStatus(scholarship)) === "OPEN" ? "bg-[#E5F3EC] text-[#17633C]" : "bg-[#ECEFF3] text-[#4C596B]"}`}>{(live ? directoryApplicationStatus(scholarship) : scholarshipStatus(scholarship)) === "OPEN" ? "التقديم مفتوح" : live && !directoryApplicationStatus(scholarship) ? "حالة التقديم (غير متوفر حالياً)" : "التقديم مغلق"}</span></div>
    </Link>)}</div>
  </section>;
}
