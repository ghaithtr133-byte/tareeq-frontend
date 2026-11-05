import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Bookmark, Building2, CalendarDays, Check, ClipboardList, Coins, Diamond, ExternalLink, FileText, GraduationCap, Info, ShieldCheck, Star } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ScholarshipCountryFlag } from "@/components/public/scholarship-country-flag";
import { ScholarshipAssistance, ScholarshipAssistanceButton } from "@/components/public/scholarship-assistance";
import { canRequestScholarshipAssistance, scholarshipOfficialLink } from "@/lib/scholarship-assistance";
import { scholarshipDeadline, scholarshipStatus } from "@/lib/scholarship-directory";
import type { DemoScholarshipDetails } from "@/lib/mocks/scholarship-detail-fixtures";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { innerPageHero } from "@/lib/inner-page-hero";
import { ScholarshipDetailImage } from "@/components/public/scholarship-detail-image";
import { directoryApplicationStatus, directoryScholarshipLabel, scholarshipUnavailable } from "@/lib/scholarship-directory-live";
import { scholarshipDetailSource, unavailableScholarshipBenefits, unavailableScholarshipRequirements, unavailableScholarshipSteps, type ScholarshipDetailRecord } from "@/lib/scholarship-detail-live";
import { HomeSectionError } from "@/components/home/home-section-error";

type InfoItem = { label: string; value: ReactNode; icon: ReactNode };
function Information({ items }: { items: InfoItem[] }) {
  return <dl className="grid grid-cols-2 gap-x-4 sm:grid-cols-3 lg:block">
    {items.map(({ label, value, icon }) => <div key={label} className="min-w-0 border-b border-[#E6ECF3] py-3 lg:flex lg:items-center lg:justify-between lg:gap-3">
      <dt className="mb-1 flex items-center gap-1.5 text-xs leading-6 text-muted-foreground lg:mb-0"><span className="shrink-0 text-[#5B779B]">{icon}</span>{label}</dt>
      <dd className="min-w-0 text-sm font-bold leading-6 text-primary [overflow-wrap:anywhere]">{value}</dd>
    </div>)}
  </dl>;
}

function SectionHeading({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return <h2 className="mb-3 flex items-center gap-2.5 text-lg font-bold leading-8 text-primary sm:text-xl"><span className="shrink-0 text-[#B88C3F]">{icon}</span>{children}</h2>;
}

function CheckList({ items }: { items: string[] }) {
  return <ul className="grid gap-x-5 gap-y-2 sm:grid-cols-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-7 text-muted-foreground"><span className="mt-1.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#BD9347] text-white"><Check className="size-3" aria-hidden="true" /></span>{item}</li>)}</ul>;
}

export function ScholarshipDetails({ scholarship, demo, extras, media }: {
  scholarship: ScholarshipDetailRecord;
  demo: boolean;
  extras?: DemoScholarshipDetails;
  media?: { src: string; alt: string; position?: string };
}) {
  const applicationStatus = demo ? scholarshipStatus(scholarship) : directoryApplicationStatus(scholarship);
  const open = applicationStatus === "OPEN";
  const statusLabel = open ? "التقديم مفتوح" : applicationStatus === "CLOSED" ? "التقديم مغلق" : scholarshipUnavailable("حالة التقديم");
  const allowed = canRequestScholarshipAssistance(scholarship);
  // Pending Backend fields are deliberately NOT read from the Live record.
  const detail = demo ? extras : undefined;
  const illustration = demo ? media : undefined;
  const external = scholarshipOfficialLink(scholarshipDetailSource(scholarship.officialSourceUrl), allowed ? detail?.applicationUrl : undefined);
  const deadline = scholarshipDeadline(scholarship.verifiedDeadline);
  const status = <span className={open ? "text-[#14783D]" : "text-[#5C6573]"}>{statusLabel}</span>;
  const description = detail?.descriptionAr ?? (scholarship.descriptionAr || scholarshipUnavailable("نبذة المنحة"));
  const benefits = demo ? detail?.benefits ?? [] : unavailableScholarshipBenefits;
  const requirements = demo ? detail?.requirements ?? [] : unavailableScholarshipRequirements;
  const steps = demo ? detail?.steps ?? [] : unavailableScholarshipSteps;
  const items: InfoItem[] = [
    { label: "الدولة", value: scholarship.country ? <Link href={`/study-abroad/${scholarship.country.slug}`} className="inline-flex items-center gap-2 rounded-sm hover:underline"><ScholarshipCountryFlag slug={scholarship.country.slug} name={scholarship.country.nameAr} />{scholarship.country.nameAr}</Link> : demo ? "غير محددة" : <span className="inline-flex items-center gap-2"><ScholarshipCountryFlag slug="" name="الدولة" />{scholarshipUnavailable("الدولة")}</span>, icon: <Building2 className="size-4" aria-hidden="true" /> },
    ...(scholarship.university ? [{ label: "الجامعة / الجهة", value: <Link href={`/universities/${scholarship.university.slug}`} className="rounded-sm hover:underline">{scholarship.university.nameAr}</Link>, icon: <Building2 className="size-4" aria-hidden="true" /> }] : !demo && scholarship.universityId ? [{ label: "الجامعة / الجهة", value: scholarshipUnavailable("الجامعة"), icon: <Building2 className="size-4" aria-hidden="true" /> }] : []),
    { label: "المرحلة الدراسية", value: demo ? scholarship.studyLevel || "غير محددة" : directoryScholarshipLabel(scholarship.studyLevel, "study"), icon: <GraduationCap className="size-4" aria-hidden="true" /> },
    { label: "نوع التمويل", value: demo ? scholarship.fundingType || "غير محدد" : directoryScholarshipLabel(scholarship.fundingType, "funding"), icon: <Coins className="size-4" aria-hidden="true" /> },
    { label: "الموعد النهائي", value: deadline ? <time dateTime={scholarship.verifiedDeadline!}>{deadline}</time> : demo ? "الموعد غير محدد" : scholarshipUnavailable("موعد التقديم"), icon: <CalendarDays className="size-4" aria-hidden="true" /> },
    { label: "حالة التقديم", value: status, icon: <ShieldCheck className="size-4" aria-hidden="true" /> },
  ];
  return <ScholarshipAssistance key={scholarship.id} scholarship={scholarship} demo={demo}>
    <main className="bg-[#F7FAFD] pb-8 text-primary [overflow-wrap:anywhere]">
      <section aria-labelledby="scholarship-title" className="relative overflow-hidden border-b border-[#E5ECF3] bg-gradient-to-l from-[#F1F7FC] via-white to-[#F1F7FC]">
        <GraduationCap className="pointer-events-none absolute bottom-3 left-[8%] hidden size-32 -rotate-12 text-[#C5D5E6]/40 lg:block" strokeWidth={1} aria-hidden="true" />
        <Container className={`${innerPageHero.content} max-w-7xl`}>
          <nav aria-label="مسار التنقل" className={innerPageHero.breadcrumb}><ol className="flex flex-wrap gap-x-2 gap-y-1"><li><Link href="/" className="rounded-sm hover:underline">الرئيسية</Link><span className="ms-2" aria-hidden="true">/</span></li><li><Link href="/scholarships" className="rounded-sm hover:underline">المنح الدراسية</Link><span className="ms-2" aria-hidden="true">/</span></li><li aria-current="page">{scholarship.titleAr}</li></ol></nav>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div className="min-w-0 lg:max-w-3xl"><p className="mb-1 text-sm font-bold text-[#99712E]">فرصتك التالية</p><h1 id="scholarship-title" className={innerPageHero.title}>{scholarship.titleAr}</h1>{scholarship.titleEn ? <p dir="ltr" className="mt-1 text-right text-sm leading-6 text-[#526B88]">{scholarship.titleEn}</p> : null}<p className="mt-2 line-clamp-3 max-w-3xl text-sm leading-7 text-muted-foreground">{scholarship.descriptionAr || scholarshipUnavailable("نبذة المنحة")}</p></div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 text-xs font-bold"><span className={`rounded-lg px-3 py-2 ${open ? "bg-[#12813E] text-white" : "bg-[#E8EDF2] text-[#495565]"}`}>{statusLabel}</span>{scholarship.featured ? <span className="inline-flex items-center gap-1 rounded-lg bg-[#C59A45] px-3 py-2 text-[#132C4D]"><Star className="size-3.5" fill="currentColor" aria-hidden="true" />مميزة</span> : null}</div>
          </div>
        </Container>
      </section>

      <Container className="max-w-7xl pt-5">
        <div data-scholarship-layout className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:items-start lg:gap-y-0">
          <div data-scholarship-media className="relative order-1 aspect-[16/7] min-w-0 overflow-hidden rounded-xl border border-[#E2EAF2] bg-[#173C62] lg:col-start-2 lg:row-start-1 lg:aspect-[16/5] lg:rounded-b-none lg:border-b-0">
            {!demo ? <ScholarshipDetailImage src={scholarship.imageUrl} alt={scholarship.imageAltAr || scholarship.titleAr} /> : illustration ? <Image src={illustration.src} alt={illustration.alt} fill priority sizes="(min-width: 1280px) 770px, (min-width: 1024px) 62vw, 100vw" className="object-cover" style={{ objectPosition: illustration.position ?? "center" }} /> : <div role="img" aria-label="رسم أكاديمي بديل من أكاديمية طريق، وليس صورة للجهة المانحة" className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#25618E] via-[#143C63] to-[#082B50] text-[#E2BD73]"><GraduationCap className="size-16 sm:size-24" strokeWidth={1.1} aria-hidden="true" /><span className="text-xs text-white/80">TAREEQ ACADEMY</span></div>}
          </div>

          <aside aria-labelledby="scholarship-summary-title" className="order-2 min-w-0 rounded-xl border border-[#E2EAF2] bg-white p-4 shadow-[0_3px_14px_-8px_rgba(8,43,80,0.18)] sm:p-5 lg:sticky lg:top-24 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <h2 id="scholarship-summary-title" className="hidden items-center gap-2 border-b border-[#E6ECF3] pb-3 text-base font-bold lg:flex"><Bookmark className="size-5 text-[#B88C3F]" aria-hidden="true" />ملخص المنحة</h2>
            <Information items={items} />
            {!demo && scholarship.relationLookupFailed ? <div className="mt-3"><HomeSectionError title="تعذّر تحميل بعض المعلومات المرتبطة" description="معلومات المنحة متاحة؛ يرجى إعادة المحاولة لتحميل بيانات الدولة أو الجامعة." /></div> : null}
            {allowed ? <ScholarshipAssistanceButton primary className="mt-4 w-full">اطلب مساعدة بالتقديم</ScholarshipAssistanceButton> : <div className="mt-4 rounded-lg bg-secondary p-3 text-sm leading-7"><p>طلب المساعدة المرتبط بهذه المنحة غير متاح حالياً.</p><Link href="/contact" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-sm font-bold underline underline-offset-4">استشارة عامة<ArrowLeft className="size-4" aria-hidden="true" /></Link></div>}
            {external ? <a href={external.href} target="_blank" rel="noopener noreferrer" className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#55769B] px-3 py-2 text-sm font-bold text-primary hover:bg-secondary">{external.label}<ExternalLink className="size-4" aria-hidden="true" /><span className="sr-only">(يفتح في نافذة جديدة)</span></a> : !demo ? <span role="link" aria-disabled="true" className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#55769B] px-3 py-2 text-sm font-bold text-muted-foreground">{scholarshipUnavailable("المصدر الرسمي للمنحة")}<ExternalLink className="size-4" aria-hidden="true" /></span> : null}
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-[#F1F6FB] p-3 text-xs leading-6 text-muted-foreground"><Info className="mt-1 size-4 shrink-0 text-[#4373A4]" aria-hidden="true" />أكاديمية طريق تقدم المساعدة والإرشاد، وليست الجهة المانحة. طلب المساعدة لا يُعدّ تقديماً رسمياً ولا يضمن القبول.</p>
          </aside>

          <article className="order-3 min-w-0 rounded-xl border border-[#E2EAF2] bg-white px-4 py-4 shadow-[0_3px_14px_-8px_rgba(8,43,80,0.18)] sm:px-6 sm:py-5 lg:col-start-2 lg:row-start-2 lg:rounded-t-none lg:border-t-0">
            {demo ? <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-900">عرض تجريبي: المعلومات والصور توضيحية، ولا تمثل إعلاناً رسمياً. المزايا والشروط الإضافية والخطوات أمثلة خيالية فقط.</p> : null}
            <section aria-labelledby="scholarship-about"><div id="scholarship-about"><SectionHeading icon={<FileText className="size-5" aria-hidden="true" />}>نبذة عن المنحة</SectionHeading></div><p className="whitespace-pre-line text-sm leading-8 text-muted-foreground sm:text-base">{description}</p></section>
            {benefits.length ? <section className="mt-5 border-t border-[#E6ECF3] pt-5"><SectionHeading icon={<Diamond className="size-5" aria-hidden="true" />}>مزايا المنحة</SectionHeading><CheckList items={benefits} /></section> : null}
            <section className="mt-5 border-t border-[#E6ECF3] pt-5"><SectionHeading icon={<ClipboardList className="size-5" aria-hidden="true" />}>شروط التقديم</SectionHeading><p className="whitespace-pre-line text-sm leading-8 text-muted-foreground sm:text-base">{detail?.requirementsAr ?? (scholarship.requirementsAr || (demo ? "لم تُنشر متطلبات إضافية لهذه المنحة." : scholarshipUnavailable("شروط التقديم")))}</p>{requirements.length ? <div className="mt-3"><CheckList items={requirements} /></div> : null}</section>
            {allowed || (!demo && applicationStatus === null) ? <ConsultationCta id="scholarship-context-cta" variant="contextual" className="mt-4" titleId="scholarship-context-title" title="مو متأكد إذا كنت تستوفي شروط المنحة؟" description="فريقنا جاهز لمراجعة استفسارك ومساعدتك في فهم متطلبات التقديم." action={allowed ? <ScholarshipAssistanceButton className={consultationActionClass}>احصل على مساعدة</ScholarshipAssistanceButton> : <span role="button" aria-disabled="true" className={consultationActionClass}>طلب المساعدة غير متاح حالياً</span>} /> : null}
            {steps.length ? <section className="mt-5 border-t border-[#E6ECF3] pt-5"><SectionHeading icon={<ClipboardList className="size-5" aria-hidden="true" />}>خطوات التقديم</SectionHeading><p className="mb-3 text-xs leading-6 text-muted-foreground">{demo ? "مسار توضيحي خيالي، وليس تعليمات تقديم رسمية." : scholarshipUnavailable("تعليمات التقديم الرسمية")}</p><ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">{steps.map((step, index) => <li key={step} className="flex items-start gap-2 text-xs leading-6 text-primary"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#173F6B] font-bold text-white" aria-hidden="true">{index + 1}</span>{step}</li>)}</ol></section> : null}
          </article>
        </div>

        <ConsultationCta id="scholarship-closing-cta" className="mt-5" titleId="scholarship-closing-title" title={allowed ? "جاهز تبدأ رحلتك مع هذه المنحة؟" : "تحتاج إرشاداً لاختيار خطوتك التالية؟"} description={allowed ? "فريقنا جاهز لمساعدتك في فهم متطلبات التقديم وتجهيز طلبك." : "يمكنك التواصل معنا لاستشارة عامة؛ التقديم المرتبط بهذه المنحة غير متاح حالياً."} decoration={<GraduationCap strokeWidth={1.3} />} action={
          allowed ? <ScholarshipAssistanceButton className={consultationActionClass}>اطلب مساعدة بالتقديم</ScholarshipAssistanceButton> : <Link href="/contact" className={consultationActionClass}>تواصل معنا</Link>
        } />
      </Container>
    </main>
  </ScholarshipAssistance>;
}
