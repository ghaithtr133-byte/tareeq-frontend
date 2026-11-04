"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { BookOpen, ClipboardList, GraduationCap, Images, Info, MessageCircle, MessageCircleQuestion } from "lucide-react";
import type { PublicList, Scholarship, University } from "@/api/public-content";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { UniversityDirectoryImage } from "@/components/public/university-directory-image";
import { UniversityDetailScholarships } from "@/components/public/university-detail-scholarships";
import { UniversityPrograms } from "@/components/public/university-programs";
import { universityTab, universityTabs, type UniversityDetailContent, type UniversityTab } from "@/lib/university-details";
import { createWhatsappUrl } from "@/lib/whatsapp";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";

const icons = { overview: Info, programs: BookOpen, admissions: ClipboardList, gallery: Images };

export function UniversityDetails({ university, content, demo, initialScholarships }: {
  university: University; content: UniversityDetailContent; demo: boolean; initialScholarships: PublicList<Scholarship> | null;
}) {
  const search = useSearchParams();
  const active = universityTab(search.get("tab"));
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const offset = useRef(88);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.sticky");
    const ticker = document.querySelector<HTMLElement>('[aria-label="أحدث المقالات المنشورة"]');
    function measure() {
      const pinnedTicker = ticker && ["fixed", "sticky"].includes(getComputedStyle(ticker).position);
      offset.current = (header?.getBoundingClientRect().height ?? 72) + (pinnedTicker ? ticker!.getBoundingClientRect().height : 0) + 16;
      root.current?.style.setProperty("--university-header-offset", `${offset.current}px`);
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (header) observer.observe(header);
    if (ticker) observer.observe(ticker);
    return () => observer.disconnect();
  }, []);
  function choose(id: UniversityTab) {
    const params = new URLSearchParams(search.toString());
    params.set("tab", id);
    window.history.pushState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
    const rect = tabs.current?.getBoundingClientRect();
    if (rect && rect.top < offset.current) window.scrollTo({ top: window.scrollY + rect.top - offset.current, behavior: "instant" });
  }
  const whatsapp = createWhatsappUrl(`مرحبًا، أود الاستفسار عن الدراسة في ${university.nameAr}.`);
  return <div ref={root} className="[--university-header-offset:6rem]">
    <div ref={tabs} role="tablist" aria-label="معلومات الجامعة" aria-orientation="horizontal" className="flex overflow-x-auto rounded-xl border bg-white p-1 shadow-sm">
      {universityTabs.map((tab, index) => { const Icon = icons[tab.id]; return <button key={tab.id} ref={(element) => { tabButtons.current[index] = element; }} id={`university-tab-${tab.id}`} role="tab" type="button" aria-selected={active === tab.id} aria-controls={`university-panel-${tab.id}`} tabIndex={active === tab.id ? 0 : -1} onClick={() => choose(tab.id)} onKeyDown={(event) => {
        let next: number | undefined;
        if (event.key === "ArrowLeft") next = (index + 1) % universityTabs.length;
        if (event.key === "ArrowRight") next = (index - 1 + universityTabs.length) % universityTabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = universityTabs.length - 1;
        if (next !== undefined) { event.preventDefault(); tabButtons.current[next]?.focus(); }
      }} className={`flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-b-[3px] px-4 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-accent sm:px-6 md:flex-1 ${active === tab.id ? "bg-primary text-white" : "text-primary hover:bg-muted"}`} style={{ borderBottomColor: active === tab.id ? "var(--accent)" : "transparent" }}><Icon className="size-5 shrink-0" aria-hidden="true" />{tab.label}</button>; })}
    </div>
    <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_15rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="min-w-0">
        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5" data-university-panels>
          {universityTabs.map((tab) => <div key={tab.id} id={`university-panel-${tab.id}`} role="tabpanel" aria-labelledby={`university-tab-${tab.id}`} tabIndex={0} hidden={active !== tab.id} className="rounded-lg focus-visible:outline-2 focus-visible:outline-accent">
            {tab.id === "overview" ? <><h2 className="text-xl font-bold leading-8 text-primary sm:text-2xl">نظرة عامة عن الجامعة</h2><div className="mt-4 max-w-prose space-y-4 text-base leading-9 text-muted-foreground">{university.overviewAr.trim() ? university.overviewAr.split(/\n\s*\n|\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>لا تتوفر نبذة منشورة حاليًا.</p>}</div>{university.officialWebsite ? <a href={university.officialWebsite} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center font-bold text-primary underline focus-visible:outline-2 focus-visible:outline-accent">زيارة الموقع الرسمي للجامعة <span className="sr-only">(يفتح في نافذة جديدة)</span></a> : null}</> : null}
            {tab.id === "programs" ? <UniversityPrograms programs={content.programs} university={university.nameAr} demo={demo} /> : null}
            {tab.id === "admissions" ? <><h2 className="text-xl font-bold leading-8 text-primary sm:text-2xl">شروط القبول</h2>{content.admissions.length ? <ul className="mt-4 space-y-3">{content.admissions.map((item) => <li key={item} className="rounded-xl border bg-muted/30 p-4 text-sm leading-8 text-muted-foreground">{item}</li>)}</ul> : <p className="mt-4 rounded-xl bg-muted/60 p-5 text-sm leading-8 text-muted-foreground">لم تُنشر شروط قبول مفصلة لهذه الجامعة في مصدر المحتوى الحالي. تواصل معنا للاستفسار، وراجع متطلبات الجامعة الرسمية قبل التقديم.</p>}</> : null}
            {tab.id === "gallery" ? <><h2 className="text-xl font-bold leading-8 text-primary sm:text-2xl">صور الجامعة</h2>{content.gallery.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2">{content.gallery.map((item) => <figure key={item.src}><UniversityDirectoryImage src={item.src} alt={item.alt} className="aspect-video rounded-xl" />{item.caption ? <figcaption className="mt-2 text-sm leading-7 text-muted-foreground">{item.caption}</figcaption> : null}</figure>)}</div> : !demo && university.imageUrl ? <figure className="mt-4"><UniversityDirectoryImage src={university.imageUrl} alt={university.imageAltAr || `صورة ${university.nameAr}`} className="aspect-video max-w-3xl rounded-xl" /><figcaption className="mt-3 text-sm leading-7 text-muted-foreground">الصورة المنشورة للجامعة. لا تتوفر صور إضافية حاليًا.</figcaption></figure> : <p className="mt-4 rounded-xl bg-muted/60 p-5 text-sm leading-8 text-muted-foreground">لا تتوفر صور موثقة للحرم الجامعي حاليًا. الرسم التوضيحي في المقدمة ليس صورة فعلية للجامعة.</p>}</> : null}
          </div>)}
        </div>
        <UniversityDetailScholarships key={`${demo}-${university.id}`} id={university.id} slug={university.slug} demo={demo} initial={initialScholarships} />
        {content.faqs.length ? <section data-university-faq className="relative mt-6 overflow-hidden rounded-2xl bg-[#FFFDF9] p-4 sm:p-6" aria-labelledby="university-faq-title"><p className="inline-flex items-center gap-2 rounded-full bg-[#FBF5E9] px-4 py-2 text-sm font-bold text-[#A47B2D]"><MessageCircleQuestion className="size-5" aria-hidden="true" />الأسئلة الشائعة</p><h2 id="university-faq-title" className="mb-6 mt-4 text-2xl font-bold leading-[1.35] text-[#082B50]">الأسئلة الشائعة عن الجامعة</h2><FaqAccordion items={content.faqs} name={`university-faq-${university.id}`} /></section> : null}
      </div>
      <ConsultationCta as="aside" variant="contextual" titleId="university-contact-title" className="xl:sticky xl:top-[var(--university-header-offset)]" title="لديك استفسار عن الجامعة؟" description="تواصل مع فريق طريق للحصول على إرشاد مناسب حول الجامعة والتخصصات وشروط القبول." note="استشارة إرشادية وليست طلب قبول رسميًا." action={
        <a data-university-whatsapp href={whatsapp} target="_blank" rel="noopener noreferrer" className={consultationActionClass}><MessageCircle className="size-5" aria-hidden="true" />استفسر عبر واتساب<span className="sr-only">(يفتح في نافذة جديدة)</span></a>
      } />
    </div>
  </div>;
}

export function UniversityHeroLogo({ src, name }: { src: string | null; name: string }) {
  return <span className="grid size-16 shrink-0 place-items-center rounded-xl border bg-white p-2 sm:size-20">{src ? <Image src={src} alt={`شعار ${name}`} width={64} height={64} className="max-h-full w-auto object-contain" /> : <GraduationCap className="size-9 text-accent" aria-hidden="true" />}</span>;
}
