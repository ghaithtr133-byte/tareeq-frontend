import Image from "next/image";
import { Suspense } from "react";
import { innerPageHero } from "@/lib/inner-page-hero";
import Link from "next/link";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { createPageMetadata } from "@/lib/seo";
import { ScholarshipsDirectoryLive } from "@/components/public/scholarships-directory-live";
import { SkeletonResults } from "@/components/public/content-skeletons";

export const metadata = createPageMetadata(
  "المنح الدراسية",
  "تصفح أحدث المنح الدراسية المتوفرة من جامعات وحكومات حول العالم وابدأ رحلتك الأكاديمية الآن.",
  { index: true, pathname: "/scholarships" },
);

export default function ScholarshipsPage() {
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
        <Suspense fallback={<SkeletonResults kind="scholarship" label="جارٍ تحميل المنح الدراسية…" />}><ScholarshipsDirectoryLive /></Suspense>
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
