"use client";

import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Country, PublicList, Scholarship, University } from "@/lib/api-client/public-content";
import type { LiveUniversityParams } from "@/lib/university-directory-data";
import { loadBrowserRelatedUniversityScholarships } from "@/lib/api-client/university-related-scholarships-browser";
import { nextRelatedScholarshipPage, universityScholarshipParams } from "@/lib/university-related-scholarships";
import { DirectoryScholarshipCard } from "@/components/public/university-directory-cards";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { SkeletonResults } from "@/components/public/content-skeletons";

export function LiveUniversityRelatedScholarships({ criteria, initial = null, countries, universities }: { criteria: LiveUniversityParams; initial?: PublicList<Scholarship> | null; countries: Country[]; universities: University[] }) {
  const query = useInfiniteQuery({
    queryKey: ["university-search-scholarships", universityScholarshipParams(criteria, 1)],
    gcTime: 0,
    staleTime: 60_000,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return loadBrowserRelatedUniversityScholarships(criteria, pageParam);
    },
    getNextPageParam: nextRelatedScholarshipPage,
    initialData: initial ? { pages: [initial], pageParams: [1] } : undefined,
  });
  const items = [...new Map((query.data?.pages ?? []).flatMap((page) => page.items).map((item) => [item.id, item])).values()];
  const failed = query.isError || query.isFetchNextPageError;
  return <>
    {query.isFetching && !items.length ? <div className="mt-6"><SkeletonResults kind="scholarship" count={4} label="جارٍ تحميل المنح المرتبطة…" /></div> : null}
    {items.length ? <BalancedCardGrid className="mt-6" columns={{ sm: 2 }} gap={4}>{items.map((item) => {
      // These joins enrich presentation only. They NEVER determine membership:
      // scholarships for universities outside the current page remain visible.
      const university = universities.find((entry) => entry.id === item.universityId);
      const country = countries.find((entry) => entry.id === item.countryId);
      const scholarship = { ...item, university: item.university ?? (university ? { id: university.id, slug: university.slug, nameAr: university.nameAr } : undefined), country: item.country ?? (country ? { id: country.id, slug: country.slug, nameAr: country.nameAr } : undefined) };
      return <DirectoryScholarshipCard key={item.id} scholarship={scholarship} university={university} live />;
    })}</BalancedCardGrid> : null}
    {!failed && !query.isFetching && query.data && !items.length ? <EmptyState className="mt-6" title="لا تتوفر حالياً منح دراسية مرتبطة بالجامعات المطابقة لبحثك." description="يمكنك استكشاف الفرص المنشورة في دليل المنح." action={<Link href="/scholarships">استكشف جميع المنح الدراسية</Link>} /> : null}
    {failed ? <ErrorState className="mt-6" title="تعذر تحميل المنح المرتبطة" description="يرجى المحاولة مجدداً؛ هذا لا يعني عدم توفر منح للجامعات المطابقة." retrying={query.isFetching} onRetry={() => { if (query.isFetchNextPageError) void query.fetchNextPage(); else void query.refetch(); }} /> : null}
    {query.hasNextPage && !query.isFetchNextPageError ? <div className="mt-6 flex justify-center"><button type="button" disabled={query.isFetching} onClick={() => void query.fetchNextPage()} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#C8A253] bg-white px-6 py-3 text-sm font-bold text-[#082B50] transition-colors hover:bg-[#F7F1E5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253] disabled:opacity-60">{query.isFetchingNextPage ? "جارٍ التحميل…" : "عرض المزيد"}</button></div> : null}
  </>;
}
