"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { getBrowserCountries, getBrowserUniversities } from "@/api/public-content-browser";
import { getBrowserUniversityFilterOptions } from "@/api/university-directory-browser";
import { UniversityDirectoryFilters, UniversitySort } from "@/components/public/university-directory-filters";
import { DirectoryScholarshipCard, DirectoryUniversityCard } from "@/components/public/university-directory-cards";
import { LiveUniversityRelatedScholarships } from "@/components/public/live-university-related-scholarships";
import { UniversityRelatedScholarships } from "@/components/public/university-related-scholarships";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { PaginationLinks } from "@/components/public/public-content";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { joinDirectoryCountries, liveUniversityFilters, parseDirectoryCountries, parseDirectoryUniversities, type DirectoryFilterGroup } from "@/lib/university-directory-data";
import { universitiesParams, type RouteSearchParams } from "@/lib/public-search-params";
import { demoFilterOptions, getDemoDirectory, type DemoDirectoryFilters } from "@/lib/university-directory-demo";
import { publicDemoContent } from "@/lib/mocks/public-demo-content";

const rawParams = (params: ReadonlyURLSearchParams): RouteSearchParams => Object.fromEntries(params.entries());
const demoLabels: Record<keyof DemoDirectoryFilters, string> = { major: "التخصص", level: "المستوى الدراسي", language: "لغة الدراسة", city: "المدينة", type: "نوع الجامعة" };
export function UniversitiesDirectoryLive() {
  const searchParams = useSearchParams(), router = useRouter(), raw = rawParams(searchParams), parsed = universitiesParams(raw), demo = isPublicDemoMode();
  const liveFilters = liveUniversityFilters(raw);
  const params = { search: parsed.search, country: parsed.country, featured: parsed.featured, sort: parsed.sort ?? "newest", page: parsed.page, limit: 6, ...(!demo ? liveFilters : {}) } as const;
  const demoFilters: DemoDirectoryFilters = {};
  if (demo) for (const key of Object.keys(demoLabels) as (keyof DemoDirectoryFilters)[]) { const value = typeof raw[key] === "string" ? raw[key] : ""; if (demoFilterOptions[key].some(([option]) => option === value)) demoFilters[key] = value; }
  const hasMeaningfulCriteria = Boolean(params.search || params.country || params.featured || (!demo && Object.values(liveFilters).some(Boolean)) || Object.values(demoFilters).some(Boolean));
  const demoResult = demo ? getDemoDirectory(params, demoFilters, hasMeaningfulCriteria) : null;
  const universityQuery = useQuery({ queryKey: ["universities-directory", params], enabled: !demo, retry: 1, queryFn: async () => parseDirectoryUniversities(await getBrowserUniversities(params)) });
  const countryQuery = useQuery({ queryKey: ["universities-countries"], enabled: !demo, retry: 1, queryFn: async () => parseDirectoryCountries(await getBrowserCountries({ limit: 50, sort: "manual" })) });
  const facetQuery = useQuery({ queryKey: ["universities-facets", params], enabled: !demo, retry: 1, queryFn: () => getBrowserUniversityFilterOptions(params) });
  const countries = demo ? [...publicDemoContent.countries] : countryQuery.data?.items ?? [];
  const universities = demo ? demoResult?.universities ?? null : universityQuery.data ? joinDirectoryCountries(universityQuery.data, countries) : null;
  useEffect(() => { if (universities && universities.pagination.totalPages > 0 && (params.page ?? 1) > universities.pagination.totalPages) { const next = new URLSearchParams(searchParams); next.set("page", String(universities.pagination.totalPages)); router.replace(`/universities?${next}`, { scroll: false }); } }, [params.page, router, searchParams, universities]);
  const fallbackGroups: DirectoryFilterGroup[] = Object.entries(demoLabels).map(([key, label]) => ({ key: key === "level" ? "studyLevel" : key === "type" ? "universityType" : key, label, options: [], unavailable: facetQuery.isError ? "تعذر تحميل خيارات التصفية حالياً" : "جارٍ تحميل خيارات التصفية…" }));
  const groups: DirectoryFilterGroup[] = [
    { key: "country", label: "الدولة", options: countries.map((country) => [country.slug, country.nameAr] as const), unavailable: !countries.length && countryQuery.isError ? "تعذر تحميل الدول حالياً" : !countries.length ? "لا توجد دول منشورة حالياً" : undefined },
    ...(demo ? (Object.keys(demoLabels) as (keyof DemoDirectoryFilters)[]).map((key) => ({ key, label: demoLabels[key], options: demoFilterOptions[key] })) : facetQuery.data ?? fallbackGroups),
  ];
  const values: Record<string, string> = { search: params.search ?? "", country: params.country ?? "", featured: params.featured ?? "", sort: params.sort, ...demoFilters, ...(!demo ? Object.fromEntries(Object.entries(liveFilters).map(([key, value]) => [key, value ?? ""])) : {}) };
  const loading = !demo && universityQuery.isPending;
  return <><div className="grid gap-7 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]"><UniversityDirectoryFilters values={values} groups={groups} filterError={!demo && (countryQuery.isError || facetQuery.isError)} /><section aria-labelledby="university-results-title" className="min-w-0"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E1E8EF] pb-5"><div className="min-w-0"><h2 id="university-results-title" className="text-2xl font-bold text-[#082B50] sm:text-3xl">الجامعات</h2>{universities ? <p className="py-4 text-sm text-muted-foreground">تم العثور على <strong className="font-bold text-[#17669C]">{universities.pagination.total}</strong> جامعات</p> : null}</div><UniversitySort value={values.sort} values={values} /></div>{loading ? <div className="mt-7"><SkeletonResults kind="university" count={6} label="جارٍ تحميل الجامعات…" /></div> : !universities ? <ErrorState className="mt-8" variant="section" title="يتعذر تحميل الجامعات حاليًا" description="تعذر الاتصال بمصدر المحتوى. حاول مرة أخرى." retrying={universityQuery.isFetching} onRetry={() => { void universityQuery.refetch(); }} /> : universities.items.length ? <BalancedCardGrid className="mt-7" columns={{ sm: 2, xl: 3 }}>{universities.items.map((item) => <DirectoryUniversityCard key={item.id} university={item} demo={demo} />)}</BalancedCardGrid> : <EmptyState className="mt-7" variant="section" title={hasMeaningfulCriteria ? "لا توجد جامعات تطابق البحث" : "لا توجد جامعات منشورة حالياً"} description={hasMeaningfulCriteria ? "جرّب تغيير معايير البحث أو مسح الفلاتر." : "ستظهر الجامعات هنا عند نشرها."} action={hasMeaningfulCriteria ? <Link href="/universities">مسح الفلاتر</Link> : undefined} />}{universities ? <PaginationLinks pathname="/universities" params={values} pagination={universities.pagination} /> : null}</section></div>{hasMeaningfulCriteria && universities?.pagination.total ? <section aria-labelledby="related-scholarships-title" className="mt-14 border-t border-[#DFE6ED] pt-10"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 id="related-scholarships-title" className="text-2xl font-bold text-[#082B50]">المنح المرتبطة بالجامعات</h2><p className="mt-2 text-sm leading-7 text-[#52647A]">{demo ? "أمثلة تجريبية مرتبطة بالجامعات المطابقة للبحث." : "المنح المرتبطة بالجامعات المطابقة للبحث."}</p></div><Link href="/scholarships" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#17669C]">عرض جميع المنح <ArrowLeft className="size-4" aria-hidden="true" /></Link></div>{demo && demoResult ? <UniversityRelatedScholarships cards={demoResult.scholarships.map((item) => <DirectoryScholarshipCard key={item.id} scholarship={item} university={demoResult.matchingUniversities.find((university) => university.id === item.universityId)} />)} /> : <LiveUniversityRelatedScholarships criteria={params} countries={countries} universities={universities.items} />}</section> : null}</>;
}
