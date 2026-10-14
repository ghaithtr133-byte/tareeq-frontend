import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowUpLeftIcon } from "@/components/ui/icons";

const guidance = [
  { number: "01", title: "استشارة تعليمية" },
  { number: "02", title: "مساعدة في القبول الجامعي" },
  { number: "03", title: "توجيه للدراسة في الخارج" },
];

export default function Home() {
  return (
    <main id="top" className="overflow-x-clip">
      <SiteHeader />

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
              <Button asChild size="lg" variant="ghost" className="w-full justify-start px-4 text-primary sm:w-auto sm:justify-center"><a href="#foundation"><span>تعرّف إلى طريق الأكاديمية</span><ArrowLeftIcon className="size-4" /></a></Button>
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

      <section id="foundation" className="bg-muted/70 py-[var(--space-section)]" aria-labelledby="foundation-title">
        <Container className="grid gap-8 sm:gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="max-w-md">
            <p className="text-[0.6875rem] font-bold tracking-[0.17em] text-accent">طريق الأكاديمية</p>
            <h2 id="foundation-title" className="mt-4 text-3xl font-bold leading-[1.45] tracking-tight text-primary sm:mt-5 sm:text-4xl">كل مرحلة تبدأ بفهمٍ أفضل للخطوة التالية.</h2>
          </div>
          <ol className="border-t border-primary/15">
            {guidance.map((item) => (
              <li key={item.number} className="grid grid-cols-[2rem_1fr] items-center gap-4 border-b border-primary/15 py-5 sm:grid-cols-[auto_1fr] sm:gap-10 sm:py-7">
                <span className="text-xs font-bold tracking-[0.12em] text-accent" dir="ltr">{item.number}</span>
                <p className="text-lg font-bold text-primary sm:text-xl">{item.title}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
