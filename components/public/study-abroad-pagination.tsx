"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "@/api/public-content";
import { queryString, type RouteSearchParams } from "@/lib/public-search-params";

type PageItem = number | "ellipsis-start" | "ellipsis-end";

export function paginationItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  if (page >= totalPages - 3) return [1, "ellipsis-start", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis-start", page - 1, page, page + 1, "ellipsis-end", totalPages];
}

function scrollToResults() {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  window.requestAnimationFrame(() => document.getElementById("destination-results")?.scrollIntoView({ behavior, block: "start" }));
}

export function StudyAbroadPagination({
  pathname,
  params,
  pagination,
}: {
  pathname: string;
  params: RouteSearchParams;
  pagination: Pagination;
}) {
  if (pagination.totalPages <= 1) return null;
  const href = (page: number) => {
    const query = queryString(params, { page: String(page) });
    return `${pathname}?${query}`;
  };
  const linkClass = "grid min-h-11 min-w-11 place-items-center rounded-lg border px-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253]";

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-[#E1E8EF] pt-6" aria-label="ترقيم صفحات الوجهات">
      {pagination.page > 1 ? <Link href={href(pagination.page - 1)} scroll={false} onClick={scrollToResults} className={`${linkClass} border-[#DCE4EC] bg-white text-[#082B50] hover:border-[#C8A253]`} aria-label="الصفحة السابقة"><ChevronRight className="size-4" aria-hidden="true" /><span className="sr-only">السابقة</span></Link> : <span className={`${linkClass} cursor-not-allowed border-[#E7ECF2] bg-[#F7F9FB] text-[#A0AEBC]`} aria-disabled="true"><ChevronRight className="size-4" aria-hidden="true" /><span className="sr-only">السابقة</span></span>}
      {paginationItems(pagination.page, pagination.totalPages).map((item) => typeof item === "number" ? <Link key={item} href={href(item)} scroll={false} onClick={scrollToResults} aria-current={item === pagination.page ? "page" : undefined} aria-label={`الصفحة ${item}`} className={`${linkClass} ${item === pagination.page ? "border-[#082B50] bg-[#082B50] text-white" : "border-[#DCE4EC] bg-white text-[#082B50] hover:border-[#C8A253] hover:text-[#A47B2D]"}`}>{item}</Link> : <span key={item} className="grid min-h-11 min-w-6 place-items-center text-[#607185]" aria-hidden="true">…</span>)}
      {pagination.page < pagination.totalPages ? <Link href={href(pagination.page + 1)} scroll={false} onClick={scrollToResults} className={`${linkClass} border-[#DCE4EC] bg-white text-[#082B50] hover:border-[#C8A253]`} aria-label="الصفحة التالية"><ChevronLeft className="size-4" aria-hidden="true" /><span className="sr-only">التالية</span></Link> : <span className={`${linkClass} cursor-not-allowed border-[#E7ECF2] bg-[#F7F9FB] text-[#A0AEBC]`} aria-disabled="true"><ChevronLeft className="size-4" aria-hidden="true" /><span className="sr-only">التالية</span></span>}
    </nav>
  );
}
