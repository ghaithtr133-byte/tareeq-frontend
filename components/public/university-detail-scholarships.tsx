"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { PublicList, Scholarship, CountryReference } from "@/lib/api-client/public-content";
import { loadUniversityScholarships } from "@/lib/api-client/university-detail-actions";
import { ScholarshipDirectoryCard } from "@/components/public/scholarship-directory-card";
import { nextScholarshipPage, uniqueUniversityScholarships } from "@/lib/university-details";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { detailUnavailable } from "@/lib/university-detail-live";
import { homeMetadataLabel } from "@/lib/homepage-data";

export function UniversityDetailScholarships({ id, slug, name, country, demo, initial }: {
  id: string; slug: string; name?: string; country?: CountryReference; demo: boolean; initial: PublicList<Scholarship> | null;
}) {
  const query = useInfiniteQuery({
    queryKey: ["university-detail-scholarships", demo ? "demo" : "live", id, slug],
    // Returning to a university starts at its initial batch, never a previous expanded list.
    gcTime: 0,
    staleTime: 60_000,
    enabled: !!initial,
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
  const invalidRelation = query.data?.pages.some((page) => page.items.some((item) => item.universityId !== id || (item.university && item.university.slug !== slug) || (item.status !== undefined && item.status !== "PUBLISHED")));
  const failed = invalidRelation || query.isError || query.isFetchNextPageError || (!initial && !query.data && !query.isFetching);
  return <section data-university-scholarships aria-labelledby="university-scholarships-title" className="mt-6 rounded-2xl border bg-white p-4 sm:p-5">
    <h2 id="university-scholarships-title" className="text-xl font-bold leading-8 text-primary sm:text-2xl">المنح المرتبطة بهذه الجامعة</h2>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">تختلف شروط الأهلية حسب المنحة؛ ارتباطها بالجامعة لا يعني شمول جميع تخصصاتها.</p>
    {query.isFetching && !items.length ? <SkeletonResults kind="scholarship" count={3} label="جارٍ تحميل المنح المرتبطة…" /> : null}
    {items.length ? <BalancedCardGrid columns={{ md: 2, xl: 3 }} gap={4} className="mt-4">{items.map((scholarship) => <ScholarshipDirectoryCard key={scholarship.id} scholarship={demo ? scholarship : { ...scholarship,
      university: scholarship.university ?? (name ? { id, slug, nameAr: name } : null),
      country: scholarship.country ?? (country && country.id === scholarship.countryId ? country : null),
      studyLevel: homeMetadataLabel(scholarship.studyLevel) || detailUnavailable("المستوى الدراسي"), fundingType: homeMetadataLabel(scholarship.fundingType) || detailUnavailable("نوع التمويل"),
    }} />)}</BalancedCardGrid> : null}
    {!failed && query.data && !items.length && !query.hasNextPage ? <EmptyState className="mt-4" title="لا توجد منح مرتبطة منشورة حالياً" description="لم تُنشر منح مرتبطة بهذه الجامعة في الوقت الحالي." /> : null}
    {failed ? <ErrorState className="mt-4" title="تعذّر تحميل المنح المرتبطة" description="يرجى المحاولة مجدداً؛ هذا لا يعني عدم توفر منح." onRetry={() => { void (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch()); }} retrying={query.isFetching} /> : null}
    {query.hasNextPage && !query.isFetchNextPageError ? <div className="mt-5 text-center"><button type="button" disabled={query.isFetching} onClick={() => query.fetchNextPage()} className="min-h-11 rounded-lg border border-accent px-5 text-sm font-bold text-primary hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60">{query.isFetchingNextPage ? "جارٍ التحميل…" : "عرض المزيد من المنح"}</button></div> : null}
    <span className="sr-only" role="status">{items.length ? `تم عرض ${items.length} منحة مرتبطة` : ""}</span>
  </section>;
}
