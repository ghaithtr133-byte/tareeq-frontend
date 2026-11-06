import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { StudyAbroadDirectoryLive } from "@/components/public/study-abroad-directory-live";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { createPageMetadata } from "@/lib/seo";
import { innerPageHero } from "@/lib/inner-page-hero";

const pageContainerClass = "2xl:max-w-[112rem]";
export const metadata = createPageMetadata(
  "الوجهات الدراسية",
  "اكتشف الوجهات الدراسية المتاحة وتعرّف على مميزات كل دولة لبدء رحلتك الأكاديمية بثقة.",
  { index: true, pathname: "/study-abroad" },
);

export default function StudyAbroadPage() {
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
        <Suspense fallback={<SkeletonResults kind="country" label="جارٍ تحميل الوجهات الدراسية…" />}><StudyAbroadDirectoryLive /></Suspense>
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
