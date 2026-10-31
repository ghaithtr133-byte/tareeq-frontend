import Link from "next/link";
import { ArrowLeft, CalendarDays, Star } from "lucide-react";
import type { Article } from "@/api/public-content";
import { ArticleDirectoryImage } from "@/components/public/article-directory-image";
import { articlePublicationDate } from "@/lib/article-directory";

export function ArticleDirectoryCard({ article, prominent = false }: { article: Article; prominent?: boolean }) {
  const date = articlePublicationDate(article.publishedAt);
  return <article data-article-card={article.id} data-prominent={prominent || undefined} className="min-w-0">
    <Link href={`/articles/${article.slug}`} aria-labelledby={`article-title-${article.id}`} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#E0E7EF] bg-white shadow-[0_3px_12px_-8px_rgba(8,43,80,0.18)] transition-[transform,box-shadow,border-color] duration-200 motion-safe:hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none">
      <div className={`relative overflow-hidden bg-secondary ${prominent ? "aspect-[2/1] md:aspect-[16/5]" : "aspect-[2/1]"}`}>
        <ArticleDirectoryImage src={article.coverImageUrl} alt={article.coverImageAltAr ?? article.titleAr} prominent={prominent} />
        {article.featured ? <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-[#DFBB76] bg-[#E9C37B] px-3 py-1.5 text-xs font-bold text-primary shadow-sm"><Star className="size-3" aria-hidden="true" />مقال مميز</span> : null}
      </div>
      <div className={`flex flex-1 flex-col ${prominent ? "p-4 sm:p-5" : "p-4"}`}>
        {date ? <p className="mb-2 flex items-center gap-1.5 text-xs leading-5 text-[#5A708C]"><CalendarDays className="size-3.5 shrink-0" aria-hidden="true" /><time dateTime={article.publishedAt!}>{date}</time></p> : null}
        <h2 id={`article-title-${article.id}`} className={`font-bold text-primary [overflow-wrap:anywhere] group-hover:text-[#255783] ${prominent ? "line-clamp-2 text-lg leading-8 sm:text-xl" : "line-clamp-3 text-base leading-7"}`}>{article.titleAr}</h2>
        <p className={`mt-2 text-sm leading-7 text-muted-foreground [overflow-wrap:anywhere] ${prominent ? "line-clamp-2" : "line-clamp-3"}`}>{article.summaryAr}</p>
        <span className="mt-auto flex min-h-11 items-center gap-2 pt-3 text-sm font-bold text-[#17669C]">اقرأ المزيد<ArrowLeft className="size-4 transition-transform motion-safe:group-hover:-translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" /></span>
      </div>
    </Link>
  </article>;
}
