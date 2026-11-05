import Link from "next/link";
import { ArrowLeft, BadgeCheck, ChevronDown, ChevronLeft, CircleHelp, ClipboardCheck, Headset, Info, Layers, LayoutGrid, MessageCircle, Send, ShieldCheck, Sparkles, Star, Target, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Service } from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { ServiceAboutLink } from "@/components/public/service-about-link";
import { ServiceDetailIcon, ServiceDetailMedia } from "@/components/public/service-detail-media";
import { serviceDetailHref, serviceDetailMedia, serviceKind, type ServiceDetailExtras } from "@/lib/service-details";
import { createWhatsappUrl } from "@/lib/whatsapp";
import { innerPageHero } from "@/lib/inner-page-hero";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { cn } from "@/lib/utils";
import { realServiceMedia, type ServiceFaqResult } from "@/lib/service-detail-live";
import { serviceOverviewFromLive } from "@/lib/services-directory-live";
import { ServiceLiveFaq } from "@/components/public/service-live-faq";
import { EmptyState } from "@/components/ui/content-state";
import { HomeSectionError } from "@/components/home/home-section-error";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";

const panel = "min-w-0 rounded-2xl border bg-white p-4 shadow-[0_3px_16px_-12px_rgba(8,43,80,0.22)] sm:p-5";
const whatsappClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#D3AD60] px-5 py-2.5 text-sm font-bold text-[#082B50] transition-colors hover:bg-[#E1C282] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";
const processIcons = [Headset, Target, ClipboardCheck, Send, BadgeCheck];
const benefitIcons = [Users, Target, ShieldCheck, Sparkles];

function SectionHeading({ id, title, icon: Icon }: { id: string; title: string; icon: LucideIcon }) {
  return <h2 id={id} className="flex items-start gap-2 text-xl font-bold leading-8 text-[#082B50]"><Icon className="mt-1 size-6 shrink-0 text-[#B48B42]" strokeWidth={1.6} aria-hidden="true" /><span>{title}</span></h2>;
}

function WhatsappLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={cn(whatsappClass, className)}><MessageCircle className="size-5 shrink-0" aria-hidden="true" />{children}<span className="sr-only">(يفتح في نافذة جديدة)</span></a>;
}

export function ServiceDetails({ service, extras, related, relatedFailed, demo, liveFaq }: {
  service: Service; extras: ServiceDetailExtras; related: Service[]; relatedFailed: boolean; demo: boolean; liveFaq?: ServiceFaqResult;
}) {
  const kind = demo ? serviceKind(service) : serviceOverviewFromLive(service).icon;
  const whatsapp = createWhatsappUrl(`مرحبًا، أود الاستفسار عن خدمة ${service.titleAr}.`);
  return <main className="bg-[#F5F8FC] pb-8 text-primary sm:pb-10">
    <Container>
      <nav aria-label="مسار التنقل" className={`${innerPageHero.breadcrumb} py-3`}><ol className="flex flex-wrap items-center gap-x-2 gap-y-1"><li><Link href="/" className="rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-accent">الرئيسية</Link></li><li aria-hidden="true">/</li><li><Link href="/services" className="rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-accent">خدماتنا</Link></li><li aria-hidden="true">/</li><li aria-current="page">{service.titleAr}</li></ol></nav>
      <section data-service-detail-hero aria-labelledby="service-title" className={`${innerPageHero.minimum} grid overflow-hidden rounded-2xl border bg-[#FAFCFE] shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]`}>
        <div className={innerPageHero.panel}>
          <div className="flex items-start gap-3"><span className="grid size-14 shrink-0 place-items-center rounded-2xl border bg-white text-[#082B50] shadow-sm sm:size-16"><ServiceDetailIcon kind={kind} className="size-8 sm:size-10" /></span><div className="min-w-0"><p className="mb-1 inline-block rounded-full bg-[#F9E9C8] px-3 py-1 text-xs font-bold text-[#75541F]">خدماتنا</p><h1 id="service-title" className={innerPageHero.title}>{service.titleAr}</h1></div></div>
          {service.summaryAr ? <p className="mt-3 max-w-xl text-sm leading-7 text-[#455C75] sm:text-base sm:leading-8">{service.summaryAr}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-3"><WhatsappLink href={whatsapp}>استشر فريق طريق</WhatsappLink><ServiceAboutLink /></div>
        </div>
        <div className="relative h-32 min-w-0 sm:h-40 md:h-auto"><ServiceDetailMedia key={service.slug} media={demo ? serviceDetailMedia(service) : realServiceMedia(service)} unavailableLabel={demo ? undefined : "صورة الخدمة (غير متوفر حالياً)"} kind={kind} title={service.titleAr} hero />{kind !== "admissions" ? <span className="pointer-events-none absolute -right-8 -top-24 h-96 w-16 -rotate-12 rounded-full border-s-4 border-[#D6B46E]/50" aria-hidden="true" /> : null}</div>
      </section>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-4">
          <section id="about-service" tabIndex={-1} aria-labelledby="service-about-title" className={`${panel} scroll-mt-24 focus-visible:outline-2 focus-visible:outline-accent`}><SectionHeading id="service-about-title" title={`عن خدمة ${service.titleAr}`} icon={Info} /><div className="mt-3 max-w-prose space-y-3 text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9">{service.descriptionAr?.trim() ? service.descriptionAr.split(/\n\s*\n|\n/).filter(Boolean).map((text, index) => <p key={index}>{text}</p>) : <p>لا يتوفر وصف مفصل منشور لهذه الخدمة حاليًا. يمكنك التواصل مع الفريق للاستفسار.</p>}</div></section>
          {extras.steps.length ? <section data-service-steps aria-labelledby="service-steps-title" className={panel}><SectionHeading id="service-steps-title" title={`كيف نساعدك في ${service.titleAr}؟`} icon={Layers} />{demo ? <p className="mt-2 text-xs leading-6 text-muted-foreground">مراحل توضيحية للعرض التجريبي، وليست ضمانًا لأي قرار أو نتيجة.</p> : null}<ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]">{extras.steps.map((step, index) => { const Icon = processIcons[index % processIcons.length]; return <li key={step.title} className="relative min-w-0 rounded-xl border bg-[#FBFCFE] p-3 text-center"><span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-[#F9E6BE] text-xs font-bold text-[#865F20]"><span className="sr-only">الخطوة </span>{index + 1}</span><Icon className="mx-auto mb-2 mt-1 size-6 text-[#173654]" strokeWidth={1.6} aria-hidden="true" /><h3 className="font-bold leading-7 text-[#082B50]">{step.title}</h3><p className="mt-1 text-xs leading-6 text-muted-foreground">{step.description}</p>{index < extras.steps.length - 1 ? <><ChevronLeft className="pointer-events-none absolute -left-3.5 top-1/2 z-10 hidden size-4 text-[#BC934B] xl:block" aria-hidden="true" /><ChevronDown className="absolute -bottom-3.5 left-1/2 z-10 size-4 -translate-x-1/2 text-[#BC934B] sm:hidden" aria-hidden="true" /></> : null}</li>; })}</ol></section> : null}
          {extras.benefits.length ? <section data-service-benefits aria-labelledby="service-benefits-title" className={panel}><SectionHeading id="service-benefits-title" title={`مميزات خدمة ${service.titleAr}`} icon={Star} /><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">{extras.benefits.map((benefit, index) => { const Icon = benefitIcons[index % benefitIcons.length]; return <article key={benefit.title} className="flex min-w-0 items-start gap-2 rounded-xl border bg-white p-3 shadow-sm"><Icon className="mt-1 size-7 shrink-0 text-[#B48B42]" strokeWidth={1.5} aria-hidden="true" /><div className="min-w-0"><h3 className="text-sm font-bold leading-7">{benefit.title}</h3><p className="mt-1 text-xs leading-6 text-muted-foreground">{benefit.description}</p></div></article>; })}</div></section> : null}
          {extras.faqs.length || !demo ? <section data-service-faq aria-labelledby="service-faq-title" className={`${panel} bg-[#FFFDF9]`}><SectionHeading id="service-faq-title" title={`الأسئلة الشائعة عن ${service.titleAr}`} icon={CircleHelp} /><div className="mt-4">{demo ? <FaqAccordion items={extras.faqs} name={`service-faq-${service.id}`} /> : <ServiceLiveFaq slug={service.slug} initial={liveFaq ?? { ok: false }} />}</div></section> : null}
        </div>
        <ConsultationCta as="aside" variant="contextual" titleId="service-consultation-title" className="xl:sticky xl:top-24" title={<>لديك استفسار عن {service.titleAr}؟</>} description="تواصل مع فريق طريق للحصول على إرشاد مناسب وإجابات عن استفساراتك." backgroundImage="/images/footer/footer-skyline.png" action={
          <WhatsappLink href={whatsapp} className={consultationActionClass}>استفسر عبر واتساب</WhatsappLink>
        } />
      </div>

      <section aria-labelledby="service-related-title" className="mt-7"><SectionHeading id="service-related-title" title="خدمات أخرى قد تهمك" icon={LayoutGrid} />{related.length ? <BalancedCardGrid data-other-services columns={{ md: 2, lg: 3 }} gap={4} className="mt-4">{related.map((item) => <Link key={item.id} href={serviceDetailHref(item)} className="group flex min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm transition-[translate,box-shadow] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"><div className="w-24 shrink-0"><ServiceDetailMedia media={demo ? serviceDetailMedia(item) : realServiceMedia(item)} kind={demo ? serviceKind(item) : serviceOverviewFromLive(item).icon} unavailableLabel={demo ? undefined : "صورة الخدمة (غير متوفر حالياً)"} title={item.titleAr} /></div><div className="flex min-w-0 flex-1 items-center gap-2 p-3"><div className="min-w-0 flex-1"><h3 className="text-sm font-bold leading-7 text-[#082B50]">{item.titleAr}</h3>{item.summaryAr ? <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">{item.summaryAr}</p> : null}</div><ArrowLeft className="size-5 shrink-0 text-[#B48B42] transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" /></div></Link>)}</BalancedCardGrid> : relatedFailed ? <div className="mt-3"><HomeSectionError title="يتعذر تحميل الخدمات الأخرى حاليًا." description="يرجى المحاولة مجدداً لتحميل الخدمات المنشورة الأخرى." /></div> : <EmptyState className="mt-3" title="لا توجد خدمات أخرى منشورة حاليًا." description="ستظهر الخدمات الأخرى عند نشرها." action={<Link href="/services">عرض خدماتنا</Link>} />}</section>

    </Container>
  </main>;
}
