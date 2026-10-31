import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { getCountries, getScholarships, getUniversities } from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { ScholarshipDirectoryCard } from "@/components/public/scholarship-directory-card";
import { ScholarshipDirectoryFilters } from "@/components/public/scholarship-directory-filters";
import { ScholarshipDirectoryPagination } from "@/components/public/scholarship-directory-pagination";
import { directoryScholarshipParams, scholarshipDirectoryHref, scholarshipFilterValues } from "@/lib/scholarship-directory";
import type { RouteSearchParams } from "@/lib/public-search-params";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("المنح الدراسية", "تصفح أحدث المنح الدراسية المتوفرة من جامعات وحكومات حول العالم وابدأ رحلتك الأكاديمية الآن.", { index: true, pathname: "/scholarships" });

export default async function ScholarshipsPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = directoryScholarshipParams(await searchParams);
  const values = scholarshipFilterValues(params);
  const demo = isPublicDemoMode();
  const [scholarships, countries, universities] = await Promise.allSettled([
    getScholarships(params), getCountries({ limit: 50, sort: "manual" }), getUniversities({ limit: 50, sort: "name" }),
  ]);
  const result = scholarships.status === "fulfilled" ? scholarships.value : null;
  if (result && (params.page ?? 1) > Math.max(1, result.pagination.totalPages)) {
    redirect(scholarshipDirectoryHref(values, Math.max(1, result.pagination.totalPages)));
  }
  // Demo display choices and media stay server-side, outside the Live API contract.
  const demoContent = demo ? (await import("@/lib/mocks/public-demo-content")).publicDemoContent : null;
  const media = demo ? (await import("@/lib/mocks/scholarship-directory-fixtures")).demoScholarshipMedia : {};
  const demoOptions = demoContent ? {
    studyLevel: [...new Set(demoContent.scholarships.map((item) => item.studyLevel).filter(Boolean))].map((value) => ({ value, label: value })),
    fundingType: [...new Set(demoContent.scholarships.map((item) => item.fundingType).filter(Boolean))].map((value) => ({ value, label: value })),
  } : undefined;

  return (
    <main className="bg-[#F8FAFC]">
      <section aria-labelledby="scholarships-title" className="relative overflow-hidden border-b border-[#E7ECF2] bg-gradient-to-l from-[#F8FAFC] to-[#EEF4F8]">
        <Container className="relative py-3 sm:py-4">
          <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs leading-6 text-muted-foreground"><Link href="/" className="hover:text-accent">الرئيسية</Link><span aria-hidden="true">/</span><span aria-current="page">المنح الدراسية</span></nav>
          <div className="max-w-3xl pb-2 pt-3 sm:pb-3">
            <p className="text-xs font-bold text-[#8A6428]">اكتشف فرصتك</p>
            <h1 id="scholarships-title" className="mt-1 text-3xl font-bold leading-[1.4] text-[#082B50] sm:text-4xl">المنح الدراسية</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">تصفح أحدث المنح الدراسية المتوفرة من جامعات وحكومات حول العالم وابدأ رحلتك الأكاديمية الآن.</p>
          </div>
          <GraduationCap className="pointer-events-none absolute bottom-3 left-12 hidden size-32 -rotate-12 text-[#A6B9CF]/60 lg:block" strokeWidth={1.1} aria-hidden="true" />
        </Container>
      </section>
      <Container className="py-4 sm:py-5">
        <ScholarshipDirectoryFilters values={values}
          countries={countries.status === "fulfilled" ? countries.value.items.map((item) => ({ value: item.slug, label: item.nameAr })) : []}
          universities={universities.status === "fulfilled" ? universities.value.items.map((item) => ({ value: item.slug, label: item.nameAr })) : []}
          demoOptions={demoOptions} optionError={countries.status === "rejected" || universities.status === "rejected"}>
          <section id="scholarship-results" aria-label="نتائج المنح الدراسية" className="scroll-mt-28">
            {result ? <p className="py-4 text-sm text-muted-foreground">تم العثور على <strong className="font-bold text-[#17669C]">{result.pagination.total}</strong> منحة دراسية</p> : null}
            {!result ? <div role="alert" className="my-5 rounded-xl border border-[#DFE6ED] bg-white p-6">
              <h2 className="text-lg font-bold text-primary">يتعذر تحميل المنح الدراسية حاليًا</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">تعذر الاتصال بمصدر المنح المنشورة. يرجى المحاولة مرة أخرى.</p>
              <a href={scholarshipDirectoryHref(values, params.page)} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#17669C]">إعادة المحاولة</a>
            </div> : result.items.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{result.items.map((item) => <ScholarshipDirectoryCard key={item.id} scholarship={item} media={demo ? media[item.slug] : undefined} />)}</div> : <div className="rounded-xl border border-[#DFE6ED] bg-white p-6">
              <h2 className="text-lg font-bold text-primary">لا توجد منح دراسية تطابق البحث</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر.</p><Link href="/scholarships" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#17669C]">مسح الفلاتر</Link>
            </div>}
            {result ? <ScholarshipDirectoryPagination pagination={result.pagination} values={values} /> : null}
          </section>
        </ScholarshipDirectoryFilters>
        <section aria-labelledby="scholarships-contact-title" className="relative mb-4 mt-8 overflow-hidden rounded-xl bg-[#082B50] p-5 text-white sm:p-7">
          <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/images/footer/footer-skyline.png')" }} />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-3xl"><h2 id="scholarships-contact-title" className="text-xl font-bold leading-8">تحتاج مساعدة في التقديم على المنح الدراسية؟</h2><p className="mt-2 text-sm leading-7 text-white/85">فريقنا جاهز لمساعدتك في اختيار الفرص المناسبة وتجهيز طلبك باحترافية.</p></div>
            <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-primary hover:bg-[#D8B96E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">تواصل معنا <ArrowLeft className="size-4" aria-hidden="true" /></Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
