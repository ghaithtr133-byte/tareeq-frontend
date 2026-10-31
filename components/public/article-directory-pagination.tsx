import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "@/api/public-content";
import { articleDirectoryHref, articlePageNumbers, type ArticleFilterValues } from "@/lib/article-directory";

export function ArticleDirectoryPagination({ pagination, values }: { pagination: Pagination; values: ArticleFilterValues }) {
  if (pagination.totalPages <= 1) return null;
  const classes = "grid min-h-11 min-w-11 place-items-center rounded-lg border border-[#DCE4EC] bg-white px-3 text-sm font-bold text-primary hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const href = (page: number) => `${articleDirectoryHref(values, page)}#article-results`;
  return <nav aria-label="ترقيم صفحات المقالات" className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
    {pagination.page > 1 ? <Link href={href(pagination.page - 1)} className={classes} aria-label="الصفحة السابقة"><ChevronRight className="size-4" aria-hidden="true" /></Link> : <span aria-disabled="true" aria-label="الصفحة السابقة" className={`${classes} opacity-40`}><ChevronRight className="size-4" aria-hidden="true" /></span>}
    {articlePageNumbers(pagination.page, pagination.totalPages).map((item) => typeof item === "number" ? item === pagination.page ? <span key={item} aria-current="page" aria-label={`الصفحة ${item}`} className="grid min-h-11 min-w-11 place-items-center rounded-lg bg-primary px-3 text-sm font-bold text-white">{item}</span> : <Link key={item} href={href(item)} aria-label={`الصفحة ${item}`} className={classes}>{item}</Link> : <span key={item} aria-hidden="true" className="px-1 text-muted-foreground">…</span>)}
    {pagination.page < pagination.totalPages ? <Link href={href(pagination.page + 1)} className={classes} aria-label="الصفحة التالية"><ChevronLeft className="size-4" aria-hidden="true" /></Link> : <span aria-disabled="true" aria-label="الصفحة التالية" className={`${classes} opacity-40`}><ChevronLeft className="size-4" aria-hidden="true" /></span>}
  </nav>;
}
