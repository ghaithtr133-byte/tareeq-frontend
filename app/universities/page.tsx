import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCountries, getUniversities } from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { PaginationLinks } from "@/components/public/public-content";
import {
  UniversityDirectoryFilters,
  UniversitySort,
} from "@/components/public/university-directory-filters";
import {
  DirectoryScholarshipCard,
  DirectoryUniversityCard,
} from "@/components/public/university-directory-cards";
import { UniversityRelatedScholarships } from "@/components/public/university-related-scholarships";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import {
  type RouteSearchParams,
  universitiesParams,
} from "@/lib/public-search-params";
import { createPageMetadata } from "@/lib/seo";
import {
  demoFilterOptions,
  getDemoDirectory,
  type DemoDirectoryFilters,
} from "@/lib/university-directory-demo";
import { createWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata(
  "الجامعات",
  "استكشف الجامعات المنشورة لدى طريق الأكاديمية.",
  { index: true, pathname: "/universities" },
);

const demoLabels: Record<keyof DemoDirectoryFilters, string> = {
  major: "التخصص",
  level: "المستوى الدراسي",
  language: "لغة الدراسة",
  city: "المدينة",
  type: "نوع الجامعة",
};

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  const raw = await searchParams;
  const parsed = universitiesParams(raw);
  const params = {
    search: parsed.search,
    country: parsed.country,
    featured: parsed.featured,
    sort: parsed.sort ?? "newest",
    page: parsed.page,
    limit: 6,
  } as const;
  const demo = isPublicDemoMode();
  const demoFilters: DemoDirectoryFilters = {};
  if (demo)
    for (const key of Object.keys(
      demoLabels,
    ) as (keyof DemoDirectoryFilters)[]) {
      const value = typeof raw[key] === "string" ? raw[key] : "";
      if (demoFilterOptions[key].some(([option]) => option === value))
        demoFilters[key] = value;
    }
  const hasMeaningfulCriteria = Boolean(
    params.search ||
      params.country ||
      params.featured ||
      Object.values(demoFilters).some(Boolean),
  );
  const demoResult = demo
    ? getDemoDirectory(params, demoFilters, hasMeaningfulCriteria)
    : null;
  const [universityResponse, countryResponse] = await Promise.allSettled([
    demoResult
      ? Promise.resolve(demoResult.universities)
      : getUniversities(params),
    getCountries({ limit: 50, sort: "manual" }),
  ]);
  const countries =
    countryResponse.status === "fulfilled" ? countryResponse.value.items : [];
  const groups = [
    {
      key: "country",
      label: "الدولة",
      options: countries.map(
        (country) => [country.slug, country.nameAr] as const,
      ),
    },
    ...(demo
      ? (Object.keys(demoLabels) as (keyof DemoDirectoryFilters)[]).map(
          (key) => ({
            key,
            label: demoLabels[key],
            options: demoFilterOptions[key],
          }),
        )
      : []),
  ];
  const values: Record<string, string> = {
    search: params.search ?? "",
    country: params.country ?? "",
    featured: params.featured ?? "",
    sort: params.sort,
    ...demoFilters,
  };
  const paginationParams: RouteSearchParams = { ...values };
  const universities =
    universityResponse.status === "fulfilled" ? universityResponse.value : null;
  const relatedDirectory =
    demo &&
      hasMeaningfulCriteria &&
      universities?.pagination.total &&
      demoResult
      ? demoResult
      : null;
  const retryQuery = new URLSearchParams(
    Object.entries(values).filter(([, value]) => value),
  ).toString();

  return (
    <main className="bg-[#F8FAFC]">
      <div className="border-b border-[#E7ECF2] bg-[#FAF9F6]">
        <Container>
          <nav aria-label="مسار التنقل" className="py-3 text-sm text-[#52647A]">
            <Link href="/" className="hover:text-[#A47B2D]">
              الرئيسية
            </Link>
            <span className="mx-2 text-[#C8A253]" aria-hidden="true">
              /
            </span>
            <span aria-current="page" className="font-bold text-[#082B50]">
              الجامعات
            </span>
          </nav>
        </Container>
      </div>
      {/* <section
        aria-labelledby="directory-title"
        className="overflow-hidden bg-[#F3F7FA]"
      >
        <Container className="grid items-center gap-2 py-7 sm:py-8 md:grid-cols-2 md:gap-5 md:py-5">
          <div className="relative z-10 py-2 md:py-5">
            <p className="text-sm font-bold text-[#A47B2D]">الجامعات</p>
            <h1
              id="directory-title"
              className="mt-2 text-3xl font-bold leading-[1.4] text-[#082B50] sm:text-4xl lg:text-[2.75rem]"
            >
              الدليل الجامعي الشامل
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#52647A] sm:text-base">
              استكشف الجامعات المنشورة وقارن الخيارات المتاحة لتختار ما يناسب
              رحلتك الدراسية.
            </p>
          </div>
          <div className="relative h-36 w-full sm:h-44 md:h-52 lg:h-60">
            <Image
              src="/images/universities/university-guide-illustration.png"
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain object-bottom md:object-left-bottom"
              priority
            />
          </div>
        </Container>
      </section> */}
      <Container className="py-10 sm:py-14">
        <div className="grid gap-7 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]">
          <UniversityDirectoryFilters values={values} groups={groups} />
          <section
            aria-labelledby="university-results-title"
            className="min-w-0"
          >
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E1E8EF] pb-5">
              <div className="min-w-0">
                <h2
                  id="university-results-title"
                  className="text-2xl font-bold text-[#082B50] sm:text-3xl"
                >
                  الجامعات
                </h2>
                {universities ? (
                  <p className="mt-2 text-sm text-[#52647A]" aria-live="polite">
                    {universities.pagination.total} جامعة في النتائج
                  </p>
                ) : null}
              </div>
              <UniversitySort value={values.sort} values={values} />
            </div>
            {!universities ? (
              <div
                role="alert"
                className="mt-8 rounded-xl border border-[#E2E8F0] bg-white p-6 text-[#082B50]"
              >
                <h3 className="text-lg font-bold">
                  يتعذر تحميل الجامعات حاليًا
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#52647A]">
                  تعذر الاتصال بمصدر المحتوى. حاول مرة أخرى.
                </p>
                <a
                  href={
                    retryQuery ? `/universities?${retryQuery}` : "/universities"
                  }
                  className="mt-4 inline-flex min-h-11 items-center font-bold text-[#17669C]"
                >
                  إعادة المحاولة
                </a>
              </div>
            ) : universities.items.length ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {universities.items.map((item) => (
                  <DirectoryUniversityCard
                    key={item.id}
                    university={item}
                    demo={demo}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-xl border border-[#E2E8F0] bg-white p-7">
                <h3 className="text-lg font-bold text-[#082B50]">
                  لا توجد جامعات تطابق البحث
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#52647A]">
                  جرّب تغيير معايير البحث أو مسح الفلاتر.
                </p>
                <Link
                  href="/universities"
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#17669C]"
                >
                  مسح الفلاتر
                </Link>
              </div>
            )}
            {demo &&
            universities?.items.some(
              (item) => item.id === "demo-university-bucharest",
            ) ? (
              <p className="mt-5 text-xs leading-6 text-[#607185]">
                شعار جامعة بوخارست:{" "}
                <a
                  href="https://commons.wikimedia.org/wiki/File:Logo_Universitatea_din_Bucure%C8%99ti.svg"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  جامعة بوخارست
                </a>
                ، بدون تعديل،{" "}
                <a
                  href="https://creativecommons.org/licenses/by/3.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  CC BY 3.0
                </a>
                .
              </p>
            ) : null}
            {universities ? (
              <PaginationLinks
                pathname="/universities"
                params={paginationParams}
                pagination={universities.pagination}
              />
            ) : null}
          </section>
        </div>
        {relatedDirectory ? (
          <section
            aria-labelledby="related-scholarships-title"
            className="mt-14 border-t border-[#DFE6ED] pt-10"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2
                  id="related-scholarships-title"
                  className="text-2xl font-bold text-[#082B50]"
                >
                  المنح المرتبطة بالجامعات
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#52647A]">
                  أمثلة تجريبية مرتبطة بالجامعات المطابقة للبحث.
                </p>
              </div>
              <Link
                href="/scholarships"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#17669C]"
              >
                عرض جميع المنح <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {relatedDirectory.scholarships.length ? (
              <UniversityRelatedScholarships
                key={JSON.stringify({ search: params.search, country: params.country, featured: params.featured, ...demoFilters })}
                cards={relatedDirectory.scholarships.map((item) => (
                  <DirectoryScholarshipCard
                    key={item.id}
                    scholarship={item}
                    university={relatedDirectory.matchingUniversities.find(
                      (university) => university.id === item.universityId,
                    )}
                  />
                ))}
              />
            ) : (
              <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white px-5 py-5 text-sm leading-7 text-[#52647A]">
                <p>
                  لا تتوفر حالياً منح دراسية مرتبطة بالجامعات المطابقة لبحثك.
                </p>
                <Link
                  href="/scholarships"
                  className="mt-3 inline-flex min-h-11 items-center font-bold text-[#17669C] hover:text-[#A47B2D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253]"
                >
                  استكشف جميع المنح الدراسية
                </Link>
              </div>
            )}
          </section>
        ) : null}
        <section
          className="relative mt-12 overflow-hidden rounded-2xl bg-[#082B50] px-6 py-9 text-white sm:px-10"
          aria-labelledby="directory-contact-title"
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage: "url('/images/footer/footer-skyline.png')",
            }}
            aria-hidden="true"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-[#F5D98E]">خطوتك التالية</p>
              <h2
                id="directory-contact-title"
                className="mt-2 text-2xl font-bold"
              >
                هل تحتاج مساعدة في اختيار الجامعة؟
              </h2>
              <p className="mt-2 text-sm leading-7 text-white/85">
                تواصل معنا لترتيب خياراتك الأكاديمية.
              </p>
            </div>
            <a
              href={createWhatsappUrl(
                "مرحبًا، أود المساعدة في اختيار الجامعة المناسبة.",
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#C8A253] px-6 text-sm font-bold text-[#082B50] hover:bg-[#D8B96E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              تواصل معنا <ArrowLeft className="size-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </Container>
    </main>
  );
}
