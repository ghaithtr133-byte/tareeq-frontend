import Image from "next/image";
import { innerPageHero } from "@/lib/inner-page-hero";
import Link from "next/link";
import { ChevronLeft, FileText, GraduationCap, Headset, MessageCircle, Plane, Target } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ServiceOverviewCard } from "@/components/public/service-overview-card";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { publicServices, serviceProcess } from "@/lib/public-services";
import { createPageMetadata } from "@/lib/seo";
import { createWhatsappUrl } from "@/lib/whatsapp";
import { getServices } from "@/api/public-content";
import { publishedServiceHref } from "@/lib/service-details";
import { serviceDetailHref } from "@/lib/service-details";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { parseServicesDirectory, serviceOverviewFromLive, servicesDirectoryPage } from "@/lib/services-directory-live";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { EmptyState } from "@/components/ui/content-state";
import { HomeSectionError } from "@/components/home/home-section-error";
import { PaginationLinks } from "@/components/public/public-content";
import { redirect } from "next/navigation";
import type { RouteSearchParams } from "@/lib/public-search-params";

export const metadata = createPageMetadata("خدماتنا", "خدمات متكاملة لدعم رحلتك الدراسية: القبول الجامعي، اختيار التخصص، المنح الدراسية، تجهيز الملف ومتابعة القبول.", { index: true, pathname: "/services" });
const processIcons = [Headset, Target, FileText, Plane];
export const dynamic = "force-dynamic";

export default async function ServicesPage({ searchParams }: { searchParams?: Promise<RouteSearchParams> } = {}) {
  const demo = isPublicDemoMode();
  const page = demo ? 1 : servicesDirectoryPage((await searchParams)?.page);
  const result = await getServices({ limit: 5, sort: "manual", ...(demo ? {} : { page }) }).then((data) => demo ? data : parseServicesDirectory(data, page)).catch(() => null);
  const published = result?.items ?? [];
  if (!demo && result && page > Math.max(1, result.pagination.totalPages)) redirect(result.pagination.totalPages > 1 ? `/services?page=${result.pagination.totalPages}` : "/services");
  return <main className="bg-[#F8FAFD] pb-8 text-primary">
    <section aria-labelledby="services-title" className="relative isolate overflow-hidden border-b border-[#E2E9F0] bg-gradient-to-l from-white to-[#EDF4F9]">
      <div data-services-hero-art className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/2 opacity-35 md:w-[42%] md:opacity-100"><Image src="/images/services/services-hero.png" alt="قبعة تخرج وكتب وكرة أرضية" fill loading="eager" sizes="(min-width: 768px) 42vw, 50vw" className="object-contain object-bottom md:object-cover md:object-center" /><span aria-hidden="true" className="absolute inset-0 bg-gradient-to-l from-[#F8FAFD] via-transparent to-transparent" /></div>
      <Container className={innerPageHero.content}>
        <nav aria-label="مسار التنقل" className={innerPageHero.breadcrumb}><ol className="flex gap-2"><li><Link href="/" className="rounded-sm hover:underline">الرئيسية</Link><span className="ms-2" aria-hidden="true">/</span></li><li aria-current="page">خدماتنا</li></ol></nav>
        <div className="md:w-[58%]"><p className="mb-1 text-sm font-bold text-[#A57B34]">خدماتنا</p><h1 id="services-title" className={innerPageHero.title}>خدمات متكاملة لدعم رحلتك الدراسية</h1><p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">نقدم لك مجموعة من الخدمات المتخصصة التي تساعدك على التخطيط للدراسة في الخارج بثقة وسهولة، من اختيار التخصص والجامعة وحتى الوصول إلى مقعدك الدراسي.</p></div>
      </Container>
    </section>

    <Container>
      <section aria-label="خدماتنا التعليمية" className="py-6 sm:py-8">
        {demo ? <div data-services-grid className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{publicServices.map((service) => <ServiceOverviewCard key={service.slug} service={service} publishedHref={publishedServiceHref(service.title, published)} />)}</div>
          : !result ? <HomeSectionError title="تعذّر تحميل الخدمات" description="حدثت مشكلة أثناء جلب الخدمات المنشورة. يرجى المحاولة مجدداً." />
          : !published.length ? <EmptyState title="لا توجد خدمات منشورة حالياً" description="ستظهر الخدمات هنا عند نشرها. يمكنك التواصل معنا للاستفسار." />
          : <><BalancedCardGrid data-services-grid columns={{ md: 2, lg: 3, xl: 5 }} gap={4}>{published.map((service) => <ServiceOverviewCard key={service.id} service={serviceOverviewFromLive(service)} publishedHref={serviceDetailHref(service)} live />)}</BalancedCardGrid><PaginationLinks pathname="/services" params={{}} pagination={result.pagination} /></>}
      </section>

      <section aria-labelledby="services-process-title" className="pb-7">
        <div className="text-center"><h2 id="services-process-title" className="text-2xl font-bold leading-10 sm:text-3xl">كيف نعمل؟</h2><p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">خطوات بسيطة وواضحة لنكون معك في كل مرحلة من رحلتك الدراسية.</p></div>
        <ol data-services-process className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{serviceProcess.map((step, index) => {
          const Icon = processIcons[index];
          return <li key={step.title} className="relative rounded-2xl border border-[#E2E9F0] bg-[#F1F5FA] px-4 py-5 text-center"><span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-[#CEA556] text-sm font-bold text-[#082B50]" aria-hidden="true">{index + 1}</span><Icon className="mx-auto mb-2 size-7 text-[#B68A3E]" strokeWidth={1.6} aria-hidden="true" /><h3 className="text-base font-bold leading-7">{step.title}</h3><p className="mt-1 text-sm leading-7 text-muted-foreground">{step.description}</p>{index < serviceProcess.length - 1 ? <ChevronLeft className="pointer-events-none absolute -left-5 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-[#B68A3E] lg:block" aria-hidden="true" /> : null}</li>;
        })}</ol>
        <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">تختلف متطلبات وقرارات القبول حسب الجامعة؛ ولا تضمن الخدمة القبول أو الحصول على منحة.</p>
      </section>

      <ConsultationCta titleId="services-contact-title" title="جاهز تبدأ رحلتك الدراسية؟" description="تواصل معنا الآن واحصل على استشارة من فريقنا المتخصص." decoration={<GraduationCap strokeWidth={1} />} action={
        <a data-services-whatsapp href={createWhatsappUrl()} target="_blank" rel="noopener noreferrer" className={consultationActionClass}><MessageCircle className="size-5" aria-hidden="true" />تواصل عبر واتساب<span className="sr-only">(يفتح في نافذة جديدة)</span></a>
      } />
    </Container>
  </main>;
}
