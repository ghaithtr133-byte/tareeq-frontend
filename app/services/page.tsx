import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, FileText, GraduationCap, Headset, MessageCircle, Plane, Target } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ServiceOverviewCard } from "@/components/public/service-overview-card";
import { publicServices, serviceProcess } from "@/lib/public-services";
import { createPageMetadata } from "@/lib/seo";
import { createWhatsappUrl } from "@/lib/whatsapp";
import { getServices } from "@/api/public-content";
import { publishedServiceHref } from "@/lib/service-details";

export const metadata = createPageMetadata("خدماتنا", "خدمات متكاملة لدعم رحلتك الدراسية: القبول الجامعي، اختيار التخصص، المنح الدراسية، تجهيز الملف ومتابعة القبول.", { index: true, pathname: "/services" });
const processIcons = [Headset, Target, FileText, Plane];
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  // Navigation only: preserve the approved static directory design and copy.
  const published = await getServices({ limit: 5, sort: "manual" }).then((data) => data.items).catch(() => []);
  return <main className="bg-[#F8FAFD] pb-8 text-primary">
    <section aria-labelledby="services-title" className="relative isolate overflow-hidden border-b border-[#E2E9F0] bg-gradient-to-l from-white to-[#EDF4F9]">
      <div data-services-hero-art className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/2 opacity-35 md:w-[42%] md:opacity-100"><Image src="/images/services/services-hero.png" alt="قبعة تخرج وكتب وكرة أرضية" fill loading="eager" sizes="(min-width: 768px) 42vw, 50vw" className="object-contain object-bottom md:object-cover md:object-center" /><span aria-hidden="true" className="absolute inset-0 bg-gradient-to-l from-[#F8FAFD] via-transparent to-transparent" /></div>
      <Container className="py-4 sm:py-5">
        <nav aria-label="مسار التنقل" className="mb-4 text-xs leading-6 text-muted-foreground"><ol className="flex gap-2"><li><Link href="/" className="rounded-sm hover:underline">الرئيسية</Link><span className="ms-2" aria-hidden="true">/</span></li><li aria-current="page">خدماتنا</li></ol></nav>
        <div className="pb-2 md:w-[58%] md:pb-4"><p className="mb-1 text-sm font-bold text-[#A57B34]">خدماتنا</p><h1 id="services-title" className="text-2xl font-bold leading-[1.6] text-[#082B50] sm:text-3xl lg:text-[2rem]">خدمات متكاملة لدعم رحلتك الدراسية</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">نقدم لك مجموعة من الخدمات المتخصصة التي تساعدك على التخطيط للدراسة في الخارج بثقة وسهولة، من اختيار التخصص والجامعة وحتى الوصول إلى مقعدك الدراسي.</p></div>
      </Container>
    </section>

    <Container>
      <section aria-label="خدماتنا التعليمية" className="py-6 sm:py-8">
        <div data-services-grid className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{publicServices.map((service) => <ServiceOverviewCard key={service.slug} service={service} publishedHref={publishedServiceHref(service.title, published)} />)}</div>
      </section>

      <section aria-labelledby="services-process-title" className="pb-7">
        <div className="text-center"><h2 id="services-process-title" className="text-2xl font-bold leading-10 sm:text-3xl">كيف نعمل؟</h2><p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">خطوات بسيطة وواضحة لنكون معك في كل مرحلة من رحلتك الدراسية.</p></div>
        <ol data-services-process className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{serviceProcess.map((step, index) => {
          const Icon = processIcons[index];
          return <li key={step.title} className="relative rounded-2xl border border-[#E2E9F0] bg-[#F1F5FA] px-4 py-5 text-center"><span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-[#CEA556] text-sm font-bold text-[#082B50]" aria-hidden="true">{index + 1}</span><Icon className="mx-auto mb-2 size-7 text-[#B68A3E]" strokeWidth={1.6} aria-hidden="true" /><h3 className="text-base font-bold leading-7">{step.title}</h3><p className="mt-1 text-sm leading-7 text-muted-foreground">{step.description}</p>{index < serviceProcess.length - 1 ? <ChevronLeft className="pointer-events-none absolute -left-5 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-[#B68A3E] lg:block" aria-hidden="true" /> : null}</li>;
        })}</ol>
        <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">تختلف متطلبات وقرارات القبول حسب الجامعة؛ ولا تضمن الخدمة القبول أو الحصول على منحة.</p>
      </section>

      <section aria-labelledby="services-contact-title" className="relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-[#23496E] bg-gradient-to-l from-[#082B50] via-[#103655] to-[#082B50] p-5 text-white sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div className="min-w-0 flex-1 sm:order-2"><h2 id="services-contact-title" className="text-xl font-bold leading-9 sm:text-2xl">جاهز تبدأ رحلتك الدراسية؟</h2><p className="mt-1 text-sm leading-7 text-white/85">تواصل معنا الآن واحصل على استشارة من فريقنا المتخصص.</p></div>
        <a data-services-whatsapp href={createWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D5AD60] px-5 py-2.5 text-sm font-bold text-[#082B50] transition-colors hover:bg-[#E1C282] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:order-1"><MessageCircle className="size-5" aria-hidden="true" />تواصل عبر واتساب<span className="sr-only">(يفتح في نافذة جديدة)</span></a>
        <GraduationCap className="hidden size-20 shrink-0 text-[#D2AD64] lg:order-3 lg:block" strokeWidth={1} aria-hidden="true" />
      </section>
    </Container>
  </main>;
}
