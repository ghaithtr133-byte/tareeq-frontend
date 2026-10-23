/* eslint-disable @next/next/no-img-element -- Public API media URLs are optional external content. */
import Link from "next/link";

import type { Article, Scholarship } from "@/api/public-content";

function publishedLabel(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(new Date(value));
}

export function ArticleRecommendationList({ articles, compact = false }: { articles: Article[]; compact?: boolean }) {
  if (!articles.length) return null;

  return (
    <section aria-labelledby="latest-articles-title" className={compact ? "border border-primary/15 bg-card p-4" : "border-t border-primary/15 pt-10"}>
      <p className="text-xs font-bold tracking-[0.12em] text-[#8A6428]">اكتشف المزيد</p>
      <h2 id="latest-articles-title" className={compact ? "mt-2 text-lg font-bold text-primary" : "mt-3 text-2xl font-bold text-primary"}>أحدث المقالات</h2>
      <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        {articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.slug}`} className="group grid min-h-24 grid-cols-[4.75rem_minmax(0,1fr)] gap-3 border-b border-primary/10 pb-3 last:border-b-0 last:pb-0 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            <div className="overflow-hidden bg-secondary">
              {article.coverImageUrl ? <img src={article.coverImageUrl} alt={article.coverImageAltAr ?? ""} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100" loading="lazy" /> : <span className="grid h-full place-items-center text-xs font-bold text-primary/60">مقال</span>}
            </div>
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold text-[#8A6428]">{publishedLabel(article.publishedAt) ?? "مقال تعليمي"}</p>
              <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-6 text-primary group-hover:text-accent">{article.titleAr}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ScholarshipRecommendationList({ scholarships }: { scholarships: Scholarship[] }) {
  if (!scholarships.length) return null;

  return (
    <section aria-labelledby="related-scholarships-title" className="border-t border-primary/15 pt-10">
      <p className="text-sm font-semibold text-[#8A6428]">فرص مرتبطة</p>
      <h2 id="related-scholarships-title" className="mt-3 text-2xl font-bold text-primary">منح قد تهمك</h2>
      <div className="mt-5 grid gap-3">
        {scholarships.map((scholarship) => (
          <Link key={scholarship.id} href={`/scholarships/${scholarship.slug}`} className="group border-e-2 border-accent bg-card p-4 transition-colors hover:bg-secondary/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            <p className="text-xs font-semibold text-[#51667D]">{scholarship.country?.nameAr ?? "منحة دراسية"}</p>
            <h3 className="mt-2 text-sm font-bold leading-6 text-primary group-hover:text-accent">{scholarship.titleAr}</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{scholarship.studyLevel} · {scholarship.fundingType}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
