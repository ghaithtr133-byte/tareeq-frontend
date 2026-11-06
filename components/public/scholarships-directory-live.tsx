"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Country, University } from "@/api/public-content";
import { getBrowserCountries, getBrowserScholarships, getBrowserUniversities } from "@/api/public-content-browser";
import { ScholarshipDirectoryCard } from "@/components/public/scholarship-directory-card";
import { ScholarshipDirectoryFilters } from "@/components/public/scholarship-directory-filters";
import { ScholarshipDirectoryPagination } from "@/components/public/scholarship-directory-pagination";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { directoryScholarshipParams, scholarshipDirectoryHref, scholarshipFilterValues } from "@/lib/scholarship-directory";
import { joinScholarshipDirectory, parseScholarshipDirectory, scholarshipLookup } from "@/lib/scholarship-directory-live";
import { publicDemoContent } from "@/lib/mocks/public-demo-content";
import { demoScholarshipMedia } from "@/lib/mocks/scholarship-directory-fixtures";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import type { RouteSearchParams } from "@/lib/public-search-params";

const rawParams = (params: ReadonlyURLSearchParams): RouteSearchParams => Object.fromEntries(params.entries());
export function ScholarshipsDirectoryLive() {
  const searchParams = useSearchParams(), router = useRouter(), demo = isPublicDemoMode();
  const params = directoryScholarshipParams(rawParams(searchParams)), values = scholarshipFilterValues(params);
  const scholarships = useQuery({ queryKey: ["scholarships-directory", params], retry: 1, queryFn: async () => { const data = await getBrowserScholarships(params); return demo ? data : parseScholarshipDirectory(data, params.page ?? 1); } });
  const countries = useQuery({ queryKey: ["scholarships-countries"], retry: 1, queryFn: async () => { const data = await getBrowserCountries({ limit: 50, sort: "manual" }); return demo ? data : scholarshipLookup<Country>(data); } });
  const universities = useQuery({ queryKey: ["scholarships-universities"], retry: 1, queryFn: async () => { const data = await getBrowserUniversities({ limit: 50, sort: "name" }); return demo ? data : scholarshipLookup<University>(data); } });
  const result = scholarships.data;
  useEffect(() => { if (result && (params.page ?? 1) > Math.max(1, result.pagination.totalPages)) router.replace(scholarshipDirectoryHref(values, Math.max(1, result.pagination.totalPages)), { scroll: false }); }, [params.page, result, router, values]);
  const items = result ? demo ? result.items : joinScholarshipDirectory(result.items, countries.data?.items ?? [], universities.data?.items ?? []) : [];
  const filtered = ["search", "country", "university", "studyLevel", "fundingType", "applicationStatus", "featured"].some((key) => values[key as keyof typeof values]);
  const demoOptions = demo ? { studyLevel: [...new Set(publicDemoContent.scholarships.map((item) => item.studyLevel).filter(Boolean))].map((value) => ({ value, label: value })), fundingType: [...new Set(publicDemoContent.scholarships.map((item) => item.fundingType).filter(Boolean))].map((value) => ({ value, label: value })) } : undefined;
  const lookupNotices = [countries.data && countries.data.pagination.total > countries.data.items.length ? "قائمة الدول محدودة بأول 50 دولة منشورة؛ قد لا تظهر بعض الخيارات." : "", universities.data && universities.data.pagination.total > universities.data.items.length ? "قائمة الجامعات محدودة بأول 50 جامعة منشورة؛ قد لا تظهر بعض الخيارات." : ""].filter(Boolean);
  return <ScholarshipDirectoryFilters values={values} countries={(countries.data?.items ?? []).map((item) => ({ value: item.slug, label: item.nameAr }))} universities={(universities.data?.items ?? []).map((item) => ({ value: item.slug, label: item.nameAr }))} demoOptions={demoOptions} lookupNotices={lookupNotices} optionError={countries.isError || universities.isError}>
    <section id="scholarship-results" aria-label="نتائج المنح الدراسية" className="scroll-mt-28">
      {scholarships.isPending ? <SkeletonResults kind="scholarship" label="جارٍ تحميل المنح الدراسية…" /> : scholarships.isError ? <ErrorState title="تعذّر تحميل المنح الدراسية" description="حدثت مشكلة أثناء جلب المنح المنشورة. يرجى المحاولة مجدداً." retrying={scholarships.isFetching} onRetry={() => { void scholarships.refetch(); }} /> : <>
        <p className="py-4 text-sm text-muted-foreground" role="status">تم العثور على <strong className="font-bold text-[#17669C]">{result?.pagination.total ?? 0}</strong> منحة دراسية</p>
        {items.length ? <BalancedCardGrid columns={{ md: 2, lg: 3 }}>{items.map((item) => <ScholarshipDirectoryCard key={item.id} scholarship={item} media={demo ? demoScholarshipMedia[item.slug] : undefined} variant="directory" live={!demo} />)}</BalancedCardGrid> : <EmptyState title={filtered ? "لا توجد منح دراسية تطابق البحث" : "لا توجد منح دراسية منشورة حالياً"} description={filtered ? "جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر." : "ستظهر المنح الدراسية هنا عند نشرها."} action={filtered ? <Link href="/scholarships">مسح الفلاتر</Link> : undefined} />}
        {result ? <ScholarshipDirectoryPagination pagination={result.pagination} values={values} /> : null}
      </>}
    </section>
  </ScholarshipDirectoryFilters>;
}
