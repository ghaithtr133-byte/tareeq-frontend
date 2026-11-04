import Image from "next/image";
import Link from "next/link";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCountries } from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { StudyAbroadCountryCards } from "@/components/public/study-abroad-country-cards";
import { StudyAbroadFilters } from "@/components/public/study-abroad-filters";
import { StudyAbroadPagination } from "@/components/public/study-abroad-pagination";
import {
  countriesParams,
  type RouteSearchParams,
} from "@/lib/public-search-params";
import { createPageMetadata } from "@/lib/seo";
import { innerPageHero } from "@/lib/inner-page-hero";

export const dynamic = "force-dynamic";
const pageContainerClass = "2xl:max-w-[112rem]";
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
    search:
      parsed.search && parsed.search.length <= 200 ? parsed.search : undefined,
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
      <section
        aria-labelledby="destinations-title"
        className="relative isolate overflow-hidden border-b border-[#E7ECF2] bg-gradient-to-l from-[#FAFBFC] via-[#F4F8FB] to-[#EDF4F9]"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/2 opacity-25 md:w-[42%] md:opacity-100"
          aria-hidden="true"
        >
          <Image
            src="/images/study-abroad/study-abroad-hero.png"
            alt=""
            fill
            loading="eager"
            sizes="(min-width: 768px) 42vw, 50vw"
            className="object-cover object-left-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#F4F8FB] via-[#F4F8FB]/15 to-transparent" />
        </div>
        <Container className={`${pageContainerClass} ${innerPageHero.content}`}>
          <nav aria-label="مسار التنقل" className={innerPageHero.breadcrumb}>
            <Link href="/" className="hover:text-[#A47B2D]">
              الرئيسية
            </Link>
            <span className="mx-2 text-[#C8A253]" aria-hidden="true">
              /
            </span>
            <span aria-current="page" className="font-bold text-[#082B50]">
              الوجهات الدراسية
            </span>
          </nav>
          <div className="pb-1 md:w-[58%] md:pb-2">
            <p className="mb-1 text-sm font-bold text-[#A47B2D]">اكتشف وجهتك</p>
            <h1 id="destinations-title" className={innerPageHero.title}>
              الوجهات الدراسية
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#52647A] sm:text-base sm:leading-8">
              اكتشف الوجهات الدراسية المتاحة، وتعرّف على مميزات كل دولة لتبدأ
              رحلتك الأكاديمية بثقة.
            </p>
          </div>
        </Container>
      </section>
      <Container className={`${pageContainerClass} py-3 sm:py-4`}>
        <StudyAbroadFilters values={values}>
          <section
            id="destination-results"
            aria-label="نتائج الوجهات الدراسية"
            className="mt-3 scroll-mt-28"
          >
            {countries ? (
             
                 <p className="py-4 text-sm text-muted-foreground">
                تم العثور على{" "}
                <strong className="font-bold text-[#17669C]">
                  {countries.pagination.total}
                </strong>{" "}
               وجهات دراسية
              </p>
            ) : null}
            {!countries ? (
              <div
                role="alert"
                className="mt-3 rounded-xl border border-[#E2E8F0] bg-white p-6 text-[#082B50]"
              >
                <h3 className="text-lg font-bold">
                  يتعذر تحميل الوجهات حاليًا
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#52647A]">
                  تعذر الاتصال بمصدر الوجهات المنشورة. حاول مرة أخرى.
                </p>
                <a
                  href={
                    retryQuery ? `/study-abroad?${retryQuery}` : "/study-abroad"
                  }
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#17669C] hover:text-[#A47B2D]"
                >
                  إعادة المحاولة
                </a>
              </div>
            ) : countries.items.length ? (
              <StudyAbroadCountryCards countries={countries.items} />
            ) : (
              <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-white p-7">
                <h3 className="text-lg font-bold text-[#082B50]">
                  لا توجد وجهات تطابق البحث
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#52647A]">
                  جرّب تغيير كلمات البحث أو إزالة التصفية.
                </p>
                <Link
                  href="/study-abroad"
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#17669C] hover:text-[#A47B2D]"
                >
                  مسح التصفية
                </Link>
              </div>
            )}
            {countries ? (
              <StudyAbroadPagination
                pathname="/study-abroad"
                params={paginationParams}
                pagination={countries.pagination}
              />
            ) : null}
          </section>
        </StudyAbroadFilters>
        <ConsultationCta className="mt-8" titleId="destinations-cta-title" title="طموحك يتجاوز القارات؟" description="دعنا نساعدك في اكتشاف الوجهة الدراسية الأنسب لطموحك وتخصصك، واستكشاف الجامعات والمنح المتاحة فيها." backgroundImage="/images/study-abroad/destinations-cta.png" action={
            <Link
              href="/universities"
              className={consultationActionClass}
            >
              استكشف الجامعات{" "}
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
        } />
      </Container>
    </main>
  );
}
