import Image from "next/image";
import { innerPageHero } from "@/lib/inner-page-hero";
import Link from "next/link";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getCountries,
  getScholarships,
  getUniversities,
} from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { ScholarshipDirectoryCard } from "@/components/public/scholarship-directory-card";
import { ScholarshipDirectoryFilters } from "@/components/public/scholarship-directory-filters";
import { ScholarshipDirectoryPagination } from "@/components/public/scholarship-directory-pagination";
import {
  directoryScholarshipParams,
  scholarshipDirectoryHref,
  scholarshipFilterValues,
} from "@/lib/scholarship-directory";
import type { RouteSearchParams } from "@/lib/public-search-params";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata(
  "المنح الدراسية",
  "تصفح أحدث المنح الدراسية المتوفرة من جامعات وحكومات حول العالم وابدأ رحلتك الأكاديمية الآن.",
  { index: true, pathname: "/scholarships" },
);

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  const params = directoryScholarshipParams(await searchParams);
  const values = scholarshipFilterValues(params);
  const demo = isPublicDemoMode();
  const [scholarships, countries, universities] = await Promise.allSettled([
    getScholarships(params),
    getCountries({ limit: 50, sort: "manual" }),
    getUniversities({ limit: 50, sort: "name" }),
  ]);
  const result =
    scholarships.status === "fulfilled" ? scholarships.value : null;
  if (
    result &&
    (params.page ?? 1) > Math.max(1, result.pagination.totalPages)
  ) {
    redirect(
      scholarshipDirectoryHref(
        values,
        Math.max(1, result.pagination.totalPages),
      ),
    );
  }
  // Demo display choices and media stay server-side, outside the Live API contract.
  const demoContent = demo
    ? (await import("@/lib/mocks/public-demo-content")).publicDemoContent
    : null;
  const media = demo
    ? (await import("@/lib/mocks/scholarship-directory-fixtures"))
        .demoScholarshipMedia
    : {};
  const demoOptions = demoContent
    ? {
        studyLevel: [
          ...new Set(
            demoContent.scholarships
              .map((item) => item.studyLevel)
              .filter(Boolean),
          ),
        ].map((value) => ({ value, label: value })),
        fundingType: [
          ...new Set(
            demoContent.scholarships
              .map((item) => item.fundingType)
              .filter(Boolean),
          ),
        ].map((value) => ({ value, label: value })),
      }
    : undefined;

  return (
    <main className="bg-[#F8FAFC]">
      <section
        aria-labelledby="scholarships-title"
        className="relative isolate overflow-hidden border-b border-[#E7ECF2] bg-gradient-to-l from-[#F8FAFC] to-[#EEF4F8]"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/2 opacity-25 md:w-[42%] md:opacity-100">
          <Image
            src="/images/scholarships/scholarships-hero.png"
            alt="قبعة تخرج وكتب وكرة أرضية ترمز إلى فرص المنح الدراسية"
            fill
            loading="eager"
            sizes="(min-width: 768px) 42vw, 50vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#F8FAFC] via-[#F8FAFC]/15 to-transparent" />
        </div>
        <Container className={innerPageHero.content}>
          <nav
            aria-label="مسار التنقل"
            className={`${innerPageHero.breadcrumb} flex flex-wrap items-center gap-2`}
          >
            <Link href="/" className="hover:text-accent">
              الرئيسية
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">المنح الدراسية</span>
          </nav>
          <div className="max-w-3xl md:w-[58%]">
            <p className="text-xs font-bold text-[#8A6428]">اكتشف فرصتك</p>
            <h1
              id="scholarships-title"
              className={`mt-1 ${innerPageHero.title}`}
            >
              المنح الدراسية
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              تصفح أحدث المنح الدراسية المتوفرة من جامعات وحكومات حول العالم
              وابدأ رحلتك الأكاديمية الآن.
            </p>
          </div>
        </Container>
      </section>
      <Container className="py-4 sm:py-5">
        <ScholarshipDirectoryFilters
          values={values}
          countries={
            countries.status === "fulfilled"
              ? countries.value.items.map((item) => ({
                  value: item.slug,
                  label: item.nameAr,
                }))
              : []
          }
          universities={
            universities.status === "fulfilled"
              ? universities.value.items.map((item) => ({
                  value: item.slug,
                  label: item.nameAr,
                }))
              : []
          }
          demoOptions={demoOptions}
          optionError={
            countries.status === "rejected" ||
            universities.status === "rejected"
          }
        >
          <section
            id="scholarship-results"
            aria-label="نتائج المنح الدراسية"
            className="scroll-mt-28"
          >
            {result ? (
              <p className="py-4 text-sm text-muted-foreground">
                تم العثور على{" "}
                <strong className="font-bold text-[#17669C]">
                  {result.pagination.total}
                </strong>{" "}
                منحة دراسية
              </p>
            ) : null}
            {!result ? (
              <div
                role="alert"
                className="my-5 rounded-xl border border-[#DFE6ED] bg-white p-6"
              >
                <h2 className="text-lg font-bold text-primary">
                  يتعذر تحميل المنح الدراسية حاليًا
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  تعذر الاتصال بمصدر المنح المنشورة. يرجى المحاولة مرة أخرى.
                </p>
                <a
                  href={scholarshipDirectoryHref(values, params.page)}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#17669C]"
                >
                  إعادة المحاولة
                </a>
              </div>
            ) : result.items.length ? (
              <BalancedCardGrid columns={{ md: 2, lg: 3 }}>
                {result.items.map((item) => (
                  <ScholarshipDirectoryCard
                    key={item.id}
                    scholarship={item}
                    media={demo ? media[item.slug] : undefined}
                    variant="directory"
                  />
                ))}
              </BalancedCardGrid>
            ) : (
              <div className="rounded-xl border border-[#DFE6ED] bg-white p-6">
                <h2 className="text-lg font-bold text-primary">
                  لا توجد منح دراسية تطابق البحث
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر.
                </p>
                <Link
                  href="/scholarships"
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#17669C]"
                >
                  مسح الفلاتر
                </Link>
              </div>
            )}
            {result ? (
              <ScholarshipDirectoryPagination
                pagination={result.pagination}
                values={values}
              />
            ) : null}
          </section>
        </ScholarshipDirectoryFilters>
        <ConsultationCta className="mb-4 mt-8" titleId="scholarships-contact-title" title="تحتاج مساعدة في التقديم على المنح الدراسية؟" description="فريقنا جاهز لمساعدتك في اختيار الفرص المناسبة وتجهيز طلبك باحترافية." backgroundImage="/images/footer/footer-skyline.png" action={
            <Link
              href="/contact"
              className={consultationActionClass}
            >
              تواصل معنا <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
        } />
      </Container>
    </main>
  );
}
