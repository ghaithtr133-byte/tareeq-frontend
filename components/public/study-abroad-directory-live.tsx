"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBrowserCountries } from "@/api/public-content-browser";
import { StudyAbroadCountryCards } from "@/components/public/study-abroad-country-cards";
import { StudyAbroadFilters } from "@/components/public/study-abroad-filters";
import { StudyAbroadPagination } from "@/components/public/study-abroad-pagination";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { countriesParams, type RouteSearchParams } from "@/lib/public-search-params";
import { parseDestinationDirectory } from "@/lib/study-abroad-directory-data";

const rawParams = (params: ReadonlyURLSearchParams): RouteSearchParams => Object.fromEntries(params.entries());
export function StudyAbroadDirectoryLive() {
  const searchParams = useSearchParams(), router = useRouter();
  const parsed = countriesParams(rawParams(searchParams));
  const params = { search: parsed.search && parsed.search.length <= 200 ? parsed.search : undefined, featured: parsed.featured === "true" ? "true" as const : undefined, sort: parsed.sort ?? "manual", page: parsed.page, limit: 6 };
  const values = { search: params.search ?? "", featured: params.featured === "true", sort: params.sort } as const;
  const query = useQuery({ queryKey: ["destinations-directory", params], retry: 1, queryFn: async () => parseDestinationDirectory(await getBrowserCountries(params)) });
  const countries = query.data;
  useEffect(() => { if (countries && countries.pagination.totalPages > 0 && (params.page ?? 1) > countries.pagination.totalPages) { const next = new URLSearchParams(searchParams); next.set("page", String(countries.pagination.totalPages)); router.replace(`/study-abroad?${next}`, { scroll: false }); } }, [countries, params.page, router, searchParams]);
  const paginationParams: RouteSearchParams = { ...(params.search ? { search: params.search } : {}), ...(params.featured ? { featured: params.featured } : {}), ...(params.sort !== "manual" ? { sort: params.sort } : {}) };
  const filtered = Boolean(params.search || params.featured);
  return <StudyAbroadFilters values={values}><section id="destination-results" aria-label="نتائج الوجهات الدراسية" className="mt-3 scroll-mt-28">
    {query.isPending ? <SkeletonResults kind="country" label="جارٍ تحميل الوجهات الدراسية…" /> : query.isError ? <ErrorState className="mt-3" variant="section" title="يتعذر تحميل الوجهات حاليًا" description="تعذر تحميل الوجهات المنشورة. يرجى المحاولة مجدداً." onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : <>
      <p className="py-4 text-sm text-muted-foreground" role="status">تم العثور على <strong className="font-bold text-[#17669C]">{countries?.pagination.total ?? 0}</strong> وجهات دراسية</p>
      {countries?.items.length ? <StudyAbroadCountryCards countries={countries.items} /> : <EmptyState className="mt-3" variant="section" title={filtered ? "لا توجد وجهات تطابق البحث" : "لا توجد وجهات منشورة حالياً"} description={filtered ? "جرّب تغيير كلمات البحث أو إزالة التصفية." : "يمكنك العودة لاحقاً للاطلاع على الوجهات المنشورة الجديدة."} action={filtered ? <Link href="/study-abroad">مسح التصفية</Link> : undefined} />}
      {countries ? <StudyAbroadPagination pathname="/study-abroad" params={paginationParams} pagination={countries.pagination} /> : null}
    </>}
  </section></StudyAbroadFilters>;
}
