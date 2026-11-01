"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { PublicList, Scholarship } from "@/api/public-content";
import { loadUniversityScholarships } from "@/api/university-detail-actions";
import { ScholarshipDirectoryCard } from "@/components/public/scholarship-directory-card";
import { nextScholarshipPage, uniqueUniversityScholarships } from "@/lib/university-details";

export function UniversityDetailScholarships({ id, slug, demo, initial }: {
  id: string; slug: string; demo: boolean; initial: PublicList<Scholarship> | null;
}) {
  const query = useInfiniteQuery({
    queryKey: ["university-detail-scholarships", demo ? "demo" : "live", id, slug],
    // Returning to a university starts at its initial batch, never a previous expanded list.
    gcTime: 0,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await loadUniversityScholarships(slug, pageParam);
      if (!result.ok) throw new Error("تعذر تحميل المنح المرتبطة");
      return result.data;
    },
    getNextPageParam: nextScholarshipPage,
    initialData: initial ? { pages: [initial], pageParams: [1] } : undefined,
  });
  const items = uniqueUniversityScholarships(query.data?.pages ?? [], id, slug);
  if (!query.isPending && !query.isError && !items.length && !query.hasNextPage) return null;
  return <section data-university-scholarships aria-labelledby="university-scholarships-title" className="mt-6 rounded-2xl border bg-white p-4 sm:p-5">
    <h2 id="university-scholarships-title" className="text-xl font-bold leading-8 text-primary sm:text-2xl">المنح المرتبطة بهذه الجامعة</h2>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">تختلف شروط الأهلية حسب المنحة؛ ارتباطها بالجامعة لا يعني شمول جميع تخصصاتها.</p>
    {query.isPending ? <p role="status" className="mt-4 animate-pulse rounded-xl bg-muted p-5 motion-reduce:animate-none">جارٍ تحميل المنح المرتبطة…</p> : null}
    {items.length ? <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((scholarship) => <ScholarshipDirectoryCard key={scholarship.id} scholarship={scholarship} />)}</div> : null}
    {query.isError || query.isFetchNextPageError ? <div role="alert" className="mt-4 text-sm leading-7 text-primary"><p>يتعذر تحميل المنح المرتبطة حاليًا. هذا لا يعني عدم توفر منح.</p><button type="button" onClick={() => query.isFetchNextPageError ? query.fetchNextPage() : query.refetch()} className="mt-2 min-h-11 rounded-lg border px-4 font-bold focus-visible:outline-2 focus-visible:outline-accent">إعادة المحاولة</button></div> : null}
    {query.hasNextPage && !query.isFetchNextPageError ? <div className="mt-5 text-center"><button type="button" disabled={query.isFetching} onClick={() => query.fetchNextPage()} className="min-h-11 rounded-lg border border-accent px-5 text-sm font-bold text-primary hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60">{query.isFetchingNextPage ? "جارٍ التحميل…" : "عرض المزيد من المنح"}</button></div> : null}
    <span className="sr-only" role="status">{items.length ? `تم عرض ${items.length} منحة مرتبطة` : ""}</span>
  </section>;
}
