import Link from "next/link";
import { ArrowLeft, CalendarDays, Star } from "lucide-react";
import type { Article } from "@/lib/api-client/public-content";
import { ArticleDirectoryImage } from "@/components/public/article-directory-image";
import { articlePublicationDate } from "@/lib/article-directory";

export function ArticleDirectoryCard({ article, prominent = false, live = false }: { article: Article; prominent?: boolean; live?: boolean }) {
  const date = articlePublicationDate(article.publishedAt);
  return <article data-article-card={article.id} data-prominent={prominent || undefined} className="min-w-0">
    <Link href={`/articles/${article.slug}`} draggable={false} aria-labelledby={`article-title-${article.id}`} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#E0E7EF] bg-white shadow-[0_3px_12px_-8px_rgba(8,43,80,0.18)] transition-[transform,box-shadow,border-color] duration-200 motion-safe:hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none">
      <div className={`relative overflow-hidden bg-secondary ${prominent ? "aspect-[2/1] md:aspect-[16/5]" : "aspect-[2/1]"}`}>
        <ArticleDirectoryImage src={article.coverImageUrl} alt={article.coverImageAltAr ?? article.titleAr} prominent={prominent} unavailableLabel={live ? "صورة المقال (غير متوفر حالياً)" : undefined} />
        {article.featured ? <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-[#DFBB76] bg-[#E9C37B] px-3 py-1.5 text-xs font-bold text-primary shadow-sm"><Star className="size-3" aria-hidden="true" />مقال مميز</span> : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {date || live ? <p className="mb-1 flex items-center gap-1.5 text-xs leading-5 text-[#5A708C]"><CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />{date ? <time dateTime={article.publishedAt!}>{date}</time> : "تاريخ النشر (غير متوفر حالياً)"}</p> : null}
        <h2 id={`article-title-${article.id}`} className={`line-clamp-2 font-bold leading-7 text-primary [overflow-wrap:anywhere] group-hover:text-[#255783] group-focus-visible:text-[#255783] ${prominent ? "text-lg sm:text-xl" : "text-base"}`}>{article.titleAr}</h2>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">{article.summaryAr}</p>
        <span className="mt-auto flex min-h-11 items-center gap-2 pt-2 text-sm font-bold text-[#17669C] underline-offset-4 transition-colors duration-200 group-hover:text-[#A47B2D] group-hover:underline group-focus-visible:text-[#A47B2D] group-focus-visible:underline motion-reduce:transition-none">اقرأ المزيد<ArrowLeft className="size-4 transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" /></span>
      </div>
    </Link>
  </article>;
}
