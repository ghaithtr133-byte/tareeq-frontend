import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, GraduationCap, MessageCircle } from "lucide-react";
import { loadAboutPage } from "@/api/about-page";
import { Container } from "@/components/layout/container";
import { AboutProfile } from "@/components/public/about-profile";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { HomeSectionError } from "@/components/home/home-section-error";
import { EmptyState } from "@/components/ui/content-state";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { aboutTemporaryContent, aboutText } from "@/lib/about-content";
import { cn } from "@/lib/utils";
import { innerPageHero } from "@/lib/inner-page-hero";
import { createPageMetadata } from "@/lib/seo";
import { createWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
// No published About SEO contract exists yet. Same-page neutral metadata, not a fabricated profile.
export const metadata = createPageMetadata("من نحن", "تعرّف على طريق الأكاديمية واستكشف الخدمات المنشورة وطرق التواصل.", { pathname: "/about" });

export default async function AboutPage() {
  const { demo, profile, identity, services } = await loadAboutPage();
  const name = identity.status === "fulfilled" ? identity.value.academyNameAr : undefined;
  return <main dir="rtl" className="bg-[#F7F9FC] pb-8 text-[#082B50]">
    <section aria-labelledby="about-title" className="relative isolate overflow-hidden border-b border-[#284969] bg-[#082B50] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_60%,rgba(200,162,83,0.15),transparent_60%)]" />
      <Container className="grid min-w-0 items-center gap-5 py-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:py-10">
        <div className="min-w-0">
          <nav aria-label="مسار التنقل" className="mb-5 text-xs leading-6 text-white/70 sm:text-sm"><ol className="flex flex-wrap gap-2"><li><Link href="/" className="rounded-sm text-[#E2C483] hover:underline focus-visible:outline-2 focus-visible:outline-accent">الرئيسية</Link><span className="ms-2" aria-hidden="true">/</span></li><li aria-current="page">من نحن</li></ol></nav>
          <p className="mb-1 text-sm leading-7 text-[#E2C483]">تعرّف علينا{name ? <span className="ms-2">— {name}</span> : null}</p>
          <h1 id="about-title" className={cn(innerPageHero.title, "text-white")}>من نحن</h1>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-white/80 sm:text-base">{profile.status === "error" ? "تعذّر تحميل النبذة التعريفية. يرجى المحاولة مجدداً." : aboutText(profile.status === "ready" ? profile.content.introduction : undefined, "introduction")}</p>
          <a href="#about-story-title" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-[#E2C483] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2C483]">اكتشف قصتنا<ArrowLeft className="size-4" aria-hidden="true" /></a>
          {demo ? <p className="mt-2 text-xs leading-6 text-white/60">وضع تجريبي — محتوى التعريف المؤقت موسوم بوضوح.</p> : null}
        </div>
        <div data-about-decoration aria-hidden="true" className="pointer-events-none relative mx-auto hidden aspect-square w-full max-w-[17rem] items-center justify-center md:flex">
          <div className="absolute inset-2 rounded-full border border-[#C8A253]/20" /><div className="absolute inset-8 rounded-full border border-dashed border-[#C8A253]/40" />
          <div className="grid size-32 place-items-center rounded-[2rem] border border-[#C8A253]/40 bg-white/5 text-[#D9B670] shadow-[0_0_70px_-25px_rgba(200,162,83,0.5)]"><GraduationCap className="size-20" strokeWidth={1.15} /></div>
          <span className="absolute left-5 top-7 rounded-2xl border border-white/10 bg-[#133A60] p-3 text-[#E2C483]"><Compass className="size-7" strokeWidth={1.4} /></span><span className="absolute bottom-6 right-5 rounded-2xl border border-white/10 bg-[#133A60] p-3 text-[#E2C483]"><BookOpen className="size-7" strokeWidth={1.4} /></span>
        </div>
      </Container>
    </section>

    <Container className="space-y-8 py-7 sm:space-y-10 sm:py-10">
      {identity.status === "rejected" ? <HomeSectionError title="تعذّر تحميل اسم الأكاديمية" description="يمكنك إعادة المحاولة. بقية محتوى الصفحة وخيارات التواصل متاحة." /> : null}
      <AboutProfile profile={profile} />
      <section aria-labelledby="about-support-title" className="min-w-0 rounded-2xl border border-[#DFE7EF] bg-[#EEF3F8] p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs leading-6 text-[#946D2C]">استكشف خدماتنا</p><h2 id="about-support-title" className="text-2xl font-bold leading-10">كيف نساعد الطلاب؟</h2></div><Link href="/services" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-bold text-[#17669C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A47B2D]">جميع الخدمات<ArrowLeft className="size-4" aria-hidden="true" /></Link></div>
        {services.status === "rejected" ? <HomeSectionError title="تعذّر تحميل الخدمات" description="يرجى إعادة المحاولة للاطلاع على الخدمات المنشورة." /> : !services.value.length ? <EmptyState title="لا توجد خدمات منشورة حالياً" description="يمكنك التواصل مع الفريق لطرح استفسارك." /> : <BalancedCardGrid columns={{ md: 2, lg: 3 }} gap={4}>{services.value.map((service) => <Link key={service.id} href={`/services/${service.slug}`} data-about-service={service.id} className="group flex min-w-0 flex-col rounded-xl border border-[#DFE7EF] bg-white p-5 transition-colors hover:border-[#C8A253] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A47B2D] motion-reduce:transition-none"><h3 className="text-lg font-bold leading-8 [overflow-wrap:anywhere]">{service.titleAr}</h3><p className="mb-4 mt-2 line-clamp-3 text-sm leading-8 text-[#52647A] [overflow-wrap:anywhere]">{service.summaryAr || aboutTemporaryContent.serviceSummary}</p><span className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#17669C] group-hover:underline">اعرف المزيد<ArrowLeft className="size-4" aria-hidden="true" /></span></Link>)}</BalancedCardGrid>}
      </section>
      <ConsultationCta titleId="about-contact-title" title="لنتحدث عن خطوتك الدراسية المقبلة" description="شاركنا أسئلتك عبر صفحة التواصل أو واتساب." decoration={<MessageCircle strokeWidth={1} />} action={<>
        <Link href="/contact" className={consultationActionClass}>تواصل معنا<ArrowLeft className="size-4" aria-hidden="true" /></Link>
        <a href={createWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/35 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white motion-reduce:transition-none"><MessageCircle className="size-5" aria-hidden="true" />واتساب<span className="sr-only">(يفتح في نافذة جديدة)</span></a>
      </>} />
    </Container>
  </main>;
}
