import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ContactInquiryForm } from "@/components/public/contact-inquiry-form";
import { ContactWhatsappCard } from "@/components/public/contact-cards";
import { ContactInformationLive } from "@/components/public/contact-information-live";
import { innerPageHero } from "@/lib/inner-page-hero";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = createPageMetadata("تواصل معنا", "تواصل مع فريق طريق الأكاديمية عبر واتساب أو أرسل استفسارك حول الجامعات والوجهات الدراسية والمنح والخدمات.", { index: true, pathname: "/contact" });

export default function ContactPage() {
  const demo = isPublicDemoMode();
  return <main className="bg-[#F5F8FC] pb-8 pt-4 text-[#082B50] sm:pb-10">
    <Container className="max-w-7xl">
      <section aria-labelledby="contact-title" className="relative isolate overflow-hidden rounded-2xl bg-[#082B50] px-4 text-white sm:px-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-full overflow-hidden opacity-15 sm:w-[44%] sm:rounded-r-[45%] sm:border-r-[3px] sm:border-[#C8A253] sm:opacity-100"><Image src="/images/services/university-admission-hero.png" alt="" fill priority sizes="(min-width: 1280px) 540px, (min-width: 640px) 44vw, 100vw" className="object-cover object-left" /></div>
        <div className={`${innerPageHero.content} sm:w-[58%]`}>
          <nav aria-label="مسار التنقل" className={cn(innerPageHero.breadcrumb, "text-white/80")}><ol className="flex flex-wrap items-center gap-2"><li><Link href="/" className="rounded-sm text-[#E2C483] hover:underline focus-visible:outline-2 focus-visible:outline-accent">الرئيسية</Link></li><li aria-hidden="true">/</li><li aria-current="page">تواصل معنا</li></ol></nav>
          <h1 id="contact-title" className={cn(innerPageHero.title, "text-white")}>تواصل معنا</h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/90">عندك استفسار عن الدراسة أو الجامعات أو المنح؟ اختر التواصل المباشر عبر واتساب، أو أرسل استفسارك عبر النموذج وفريق طريق جاهز لمساعدتك.</p>
        </div>
      </section>
      <div data-contact-layout className="mt-5 grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <div className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          <div className="order-1 min-w-0"><ContactWhatsappCard /></div>
          <div className="order-3 min-w-0 lg:order-2"><ContactInformationLive demo={demo} /></div>
        </div>
        <div className="order-2 min-w-0 lg:col-start-1 lg:row-start-1"><ContactInquiryForm demo={demo} /></div>
      </div>
    </Container>
  </main>;
}
