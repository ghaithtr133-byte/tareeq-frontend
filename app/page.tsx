import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ContentSection, ContentUnavailable, EditorialLink, SectionTitle } from "@/components/public/page-components";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowUpLeftIcon } from "@/components/ui/icons";
import { approvedDestinations } from "@/lib/public-destinations";

export default function Home() {
  return (
    <main id="top" className="overflow-x-clip">

      <section id="intro" className="relative isolate overflow-hidden border-b border-border/80 bg-background" aria-labelledby="hero-title">
        <div className="pointer-events-none absolute inset-y-0 start-0 -z-10 hidden w-[42%] border-e border-border/60 bg-secondary/35 lg:block" />
        <Container className="grid gap-8 py-10 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(21rem,0.72fr)] lg:items-center lg:gap-20 lg:py-[var(--space-section)]">
          <div className="max-w-2xl lg:py-10">
            <p className="mb-5 flex items-center gap-3 text-[0.6875rem] font-bold tracking-[0.17em] text-accent sm:mb-7">
              <span className="h-px w-10 bg-accent" aria-hidden="true" />
              استشارات تعليمية
            </p>
            <h1 id="hero-title" className="max-w-xl text-[2.2rem] font-bold leading-[1.27] tracking-[-0.035em] text-primary sm:text-5xl lg:text-[4.35rem] lg:leading-[1.2]">
              طريقٌ أكثر وضوحًا <span className="relative isolate inline-block px-1 text-primary before:absolute before:inset-x-0 before:bottom-[0.14em] before:-z-10 before:h-[0.42em] before:bg-accent/25">للدراسة</span> في الخارج.
            </h1>
            <p className="mt-5 max-w-xl text-[0.975rem] leading-8 text-muted-foreground sm:mt-7 sm:text-lg sm:leading-9">
              تقدّم طريق الأكاديمية استشارات تعليمية، ومساعدة في القبول الجامعي، وتوجيهًا للطلاب المهتمين بالدراسة في الخارج.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:mt-10 sm:flex-row sm:items-center sm:gap-3">
              <Button asChild size="lg" className="w-full min-w-52 sm:w-auto"><a href="https://wa.me/963992277142" target="_blank" rel="noreferrer">تواصل عبر واتساب</a></Button>
              <Button asChild size="lg" variant="ghost" className="w-full justify-start px-4 text-primary sm:w-auto sm:justify-center"><Link href="/services"><span>تعرّف إلى خدماتنا</span><ArrowLeftIcon className="size-4" /></Link></Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-label="تكوين بصري أكاديمي">
            <div className="absolute -end-5 -top-5 size-24 border border-accent/50 sm:size-32" aria-hidden="true" />
            <div className="relative border border-primary/15 bg-card p-5 shadow-[0_20px_60px_-30px_color-mix(in_srgb,var(--primary)_38%,transparent)] sm:p-7">
              <div className="flex items-start justify-between border-b border-border pb-5 sm:pb-6">
                <p className="text-[0.65rem] font-bold tracking-[0.2em] text-accent" dir="ltr">TAREEQ ACADEMY</p>
                <span className="text-xs font-bold text-primary/55">٠١</span>
              </div>
              <p className="mt-6 max-w-[16rem] text-[1.65rem] font-bold leading-[1.4] text-primary sm:mt-10 sm:max-w-[18rem] sm:text-4xl">ما الذي يناسب خطوتك القادمة؟</p>
              <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-3 border-t border-border pt-4 sm:mt-10 sm:gap-5 sm:pt-5">
                <p className="text-xs leading-6 text-muted-foreground">من الاستشارة الأولى إلى توجيه الخطوة التالية.</p>
                <div className="grid size-12 place-items-center rounded-full border border-accent text-accent sm:size-14" aria-hidden="true"><ArrowUpLeftIcon className="size-5 sm:size-6" /></div>
              </div>
            </div>
            <div className="absolute -bottom-6 -start-3 hidden border border-border bg-background px-5 py-4 text-xs font-bold text-primary shadow-sm sm:block">
              <span className="text-accent">—</span> دراسة في الخارج
            </div>
          </div>
        </Container>
      </section>

      <ContentSection className="bg-muted/70" >
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow="وجهات الدراسة" title="ابدأ باستكشاف الوجهة الأقرب إلى خطتك." intro="الأسماء أدناه هي الوجهات الأولية المعتمدة، بينما ستُنشر تفاصيل كل وجهة من المحتوى الذي يديره فريق الأكاديمية." />
            <EditorialLink href="/study-abroad">كل وجهات الدراسة</EditorialLink>
          </div>
          <div className="mt-10 grid border-t border-primary/15 sm:grid-cols-3">
            {approvedDestinations.map((destination) => (
              <EditorialLink key={destination.slug} href={`/study-abroad/${destination.slug}`}><span className="block border-b border-primary/15 py-6 text-xl">{destination.name}</span></EditorialLink>
            ))}
          </div>
        </Container>
      </ContentSection>

      <ContentSection className="bg-background">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionTitle eyebrow="الخدمات" title="خدمات تعليمية تُعرض بتفاصيلها المعتمدة." intro="ستظهر الخدمات المتاحة ووصفها بعد نشر المحتوى الرسمي." />
          <ContentUnavailable title="الخدمات قيد النشر" description="نحافظ على دقة المعلومات؛ لذلك لن نعرض تفاصيل خدمة قبل اعتمادها." contact />
        </Container>
      </ContentSection>

      <ContentSection>
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionTitle eyebrow="رحلة الطالب" title="خطوات واضحة تبدأ بمعلومة معتمدة." intro="سيُنشر تسلسل رحلة الطالب ومراحل الدعم عند اعتماد محتوى الرحلة." />
          <ContentUnavailable title="تفاصيل الرحلة غير متاحة بعد" description="لا نعرض مراحل أو متطلبات غير معتمدة." />
        </Container>
      </ContentSection>

      <ContentSection className="bg-background">
        <Container className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <ContentUnavailable title="الجامعات المميزة" description="ستظهر الجامعات عندما تتوفر البيانات الموثقة من المصدر." />
          <ContentUnavailable title="المنح الدراسية" description="ستعرض المنح وحالتها عند نشر البيانات المعتمدة." />
          <ContentUnavailable title="المقالات التعليمية" description="ستظهر المقالات المنشورة عند توفر محتواها التحريري." />
          <ContentUnavailable title="الفيديوهات المختارة" description="ستظهر الفيديوهات عند اعتماد مصادرها ومحتواها للنشر." />
        </Container>
      </ContentSection>

      <section className="bg-primary py-14 text-primary-foreground sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[0.6875rem] font-bold tracking-[0.17em] text-accent">تواصل</p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.4] sm:text-4xl">هل ترغب في بدء محادثة تعليمية؟</h2>
            <p className="mt-4 text-sm leading-7 text-primary-foreground/80 sm:text-base">تواصل مع طريق الأكاديمية عبر واتساب للحصول على معلومات التواصل المعتمدة.</p>
          </div>
          <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"><a href="https://wa.me/963992277142" target="_blank" rel="noreferrer">تواصل عبر واتساب</a></Button>
        </Container>
      </section>
    </main>
  );
}
