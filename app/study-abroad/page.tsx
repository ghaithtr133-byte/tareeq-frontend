import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCountries } from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { StudyAbroadCountryCards } from "@/components/public/study-abroad-country-cards";
import { StudyAbroadFilters } from "@/components/public/study-abroad-filters";
import { StudyAbroadPagination } from "@/components/public/study-abroad-pagination";
import { countriesParams, type RouteSearchParams } from "@/lib/public-search-params";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata(
  "الوجهات الدراسية",
  "اكتشف الوجهات الدراسية المتاحة وتعرّف على مميزات كل دولة لبدء رحلتك الأكاديمية بثقة.",
  { index: true, pathname: "/study-abroad" },
);

export default async function StudyAbroadPage({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  const raw = await searchParams;
  const parsed = countriesParams(raw);
  const params = {
    search: parsed.search && parsed.search.length <= 200 ? parsed.search : undefined,
    featured: parsed.featured === "true" ? "true" : undefined,
    sort: parsed.sort ?? "manual",
    page: parsed.page,
    limit: 6,
  } as const;
  const values = {
    search: params.search ?? "",
    featured: params.featured === "true",
    sort: params.sort,
  } as const;
  const countries = await getCountries(params).catch(() => undefined);
  const paginationParams: RouteSearchParams = {
    ...(params.search ? { search: params.search } : {}),
    ...(params.featured ? { featured: params.featured } : {}),
    ...(params.sort !== "manual" ? { sort: params.sort } : {}),
  };
  const retryQuery = new URLSearchParams({
    ...(params.search ? { search: params.search } : {}),
    ...(params.featured ? { featured: params.featured } : {}),
    ...(params.sort !== "manual" ? { sort: params.sort } : {}),
    ...(params.page ? { page: String(params.page) } : {}),
  }).toString();

  if (
    countries &&
    countries.pagination.totalPages > 0 &&
    (params.page ?? 1) > countries.pagination.totalPages
  ) {
    const query = new URLSearchParams({
      ...(params.search ? { search: params.search } : {}),
      ...(params.featured ? { featured: params.featured } : {}),
      ...(params.sort !== "manual" ? { sort: params.sort } : {}),
      page: String(countries.pagination.totalPages),
    }).toString();
    redirect(`/study-abroad?${query}`);
  }

  return (
    <main className="bg-[#F8FAFC]">
      <div className="border-b border-[#E7ECF2] bg-[#FAF9F6]">
        <Container>
          <nav aria-label="مسار التنقل" className="py-3 text-sm text-[#52647A]">
            <Link href="/" className="hover:text-[#A47B2D]">
              الرئيسية
            </Link>
            <span className="mx-2 text-[#C8A253]" aria-hidden="true">/
            </span>
            <span aria-current="page" className="font-bold text-[#082B50]">
              الوجهات الدراسية
            </span>
          </nav>
        </Container>
      </div>
      <section aria-labelledby="destinations-title" className="border-b border-[#E7ECF2] bg-[linear-gradient(112deg,#F8FBFD_0%,#EEF4F8_55%,#FAF8F3_100%)]">
        <Container className="relative overflow-hidden py-8 sm:py-10">
          <div className="absolute bottom-0 left-5 h-16 w-16 rounded-t-full border-x border-t border-[#C8A253]/35 sm:left-8 sm:h-20 sm:w-20" aria-hidden="true" />
          <div className="relative grid items-end gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-bold text-[#A47B2D]"><span className="h-px w-8 bg-current" aria-hidden="true" />اكتشف وجهتك</p>
              <h1 id="destinations-title" className="mt-3 text-3xl font-extrabold leading-[1.3] text-[#082B50] sm:text-4xl">
                الوجهات الدراسية
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#52647A] sm:text-base">
                اكتشف الوجهات الدراسية المتاحة، وتعرّف على مميزات كل دولة لتبدأ رحلتك الأكاديمية بثقة.
              </p>
            </div>
            <p className="border-s-2 border-[#C8A253] ps-4 text-sm font-bold leading-7 text-[#17669C] md:max-w-52">
              بداية واضحة لاكتشاف خياراتك الأكاديمية حول العالم.
            </p>
          </div>
        </Container>
      </section>
      <Container className="py-10 sm:py-12">
        <StudyAbroadFilters values={values} />
        <section id="destination-results" aria-labelledby="destination-results-title" className="mt-8 scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E1E8EF] pb-5">
            <div>
              <h2 id="destination-results-title" className="text-2xl font-bold text-[#082B50] sm:text-3xl">
                الوجهات المتاحة
              </h2>
              {countries ? <p className="mt-2 text-sm text-[#52647A]" aria-live="polite">{countries.pagination.total} دولة في النتائج</p> : null}
            </div>
          </div>
          {!countries ? (
            <div role="alert" className="mt-7 rounded-xl border border-[#E2E8F0] bg-white p-6 text-[#082B50]">
              <h3 className="text-lg font-bold">يتعذر تحميل الوجهات حاليًا</h3>
              <p className="mt-2 text-sm leading-7 text-[#52647A]">تعذر الاتصال بمصدر الوجهات المنشورة. حاول مرة أخرى.</p>
              <a href={retryQuery ? `/study-abroad?${retryQuery}` : "/study-abroad"} className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#17669C] hover:text-[#A47B2D]">
                إعادة المحاولة
              </a>
            </div>
          ) : countries.items.length ? (
            <StudyAbroadCountryCards countries={countries.items} />
          ) : (
            <div className="mt-7 rounded-xl border border-[#E2E8F0] bg-white p-7">
              <h3 className="text-lg font-bold text-[#082B50]">لا توجد وجهات تطابق البحث</h3>
              <p className="mt-2 text-sm leading-7 text-[#52647A]">جرّب تغيير كلمات البحث أو إزالة التصفية.</p>
              <Link href="/study-abroad" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#17669C] hover:text-[#A47B2D]">مسح التصفية</Link>
            </div>
          )}
          {countries ? <StudyAbroadPagination pathname="/study-abroad" params={paginationParams} pagination={countries.pagination} /> : null}
        </section>
        <section className="relative mt-14 overflow-hidden rounded-2xl bg-[#082B50] px-6 py-10 text-white sm:px-10 sm:py-12" aria-labelledby="destinations-cta-title">
          <div className="absolute inset-0 bg-cover bg-left-center" style={{ backgroundImage: "url('/images/study-abroad/destinations-cta.png')" }} aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#082B50]/95 via-[#082B50]/82 to-[#082B50]/20" aria-hidden="true" />
          <div className="relative max-w-xl">
            <h2 id="destinations-cta-title" className="text-2xl font-extrabold leading-[1.4] sm:text-3xl">طموحك يتجاوز القارات؟</h2>
            <p className="mt-3 text-sm leading-7 text-white/90 sm:text-base">
              دعنا نساعدك في اكتشاف الوجهة الدراسية الأنسب لطموحك وتخصصك، واستكشاف الجامعات والمنح المتاحة فيها.
            </p>
            <Link href="/universities" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#C8A253] px-6 text-sm font-bold text-[#082B50] transition-colors hover:bg-[#D8B96E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              ابحث الآن <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
