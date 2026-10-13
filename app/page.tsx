import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

const foundations = [
  { number: "01", title: "وضوح المسار", description: "بداية منظمة تساعدك على فهم الخطوات القادمة في رحلتك التعليمية." },
  { number: "02", title: "معلومة موثوقة", description: "مساحة مصممة لتقديم المعرفة التعليمية بلغة واضحة ومهنية." },
  { number: "03", title: "دعم قريب", description: "تواصل مباشر عندما تحتاج إلى نقطة انطلاق أو توجيه أولي." },
];

export default function Home() {
  return (
    <main id="top" className="overflow-x-clip">
      <SiteHeader />

      <section id="intro" className="relative isolate overflow-hidden bg-background" aria-labelledby="hero-title">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_right,_var(--secondary),_transparent_65%)]" />
        <Container className="grid gap-12 py-[var(--space-section)] lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full bg-secondary px-4 py-2 text-xs font-bold text-primary">طريقك يبدأ بخطوة واضحة</p>
            <h1 id="hero-title" className="text-4xl font-bold leading-[1.45] tracking-tight text-primary sm:text-5xl lg:text-6xl">
              أساسٌ هادئ وواثق لرحلتك التعليمية خارج الحدود.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              طريق الأكاديمية منصة استشارات تعليمية عربية، نعمل على بناء تجربة واضحة ومريحة للطلاب الراغبين بالدراسة في الخارج.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><a href="https://wa.me/963992277142" target="_blank" rel="noreferrer">ابدأ محادثة عبر واتساب</a></Button>
              <Button asChild size="lg" variant="outline"><a href="#foundation">تعرّف إلى الأساس</a></Button>
            </div>
          </div>

          <aside className="border-s-4 border-accent bg-card p-7 shadow-sm sm:p-9" aria-label="هوية مؤقتة">
            <p className="text-xs font-bold tracking-[0.18em] text-accent">TAREEQ ACADEMY</p>
            <p className="mt-5 text-2xl font-bold leading-relaxed text-primary">تصميم أكاديمي عربي أولاً.</p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">هذه هوية نصية مؤقتة إلى حين تزويدنا بالشعار الرسمي وألوان العلامة النهائية.</p>
          </aside>
        </Container>
      </section>

      <section id="foundation" className="bg-muted/65 py-[var(--space-section)]" aria-labelledby="foundation-title">
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.16em] text-accent">الأساس</p>
            <h2 id="foundation-title" className="mt-4 text-3xl font-bold leading-relaxed text-primary sm:text-4xl">نظام بصري بسيط، منظم، وسهل التطور.</h2>
            <p className="mt-5 text-sm leading-8 text-muted-foreground sm:text-base">هذه الصفحة تعرض أساس التصميم فقط، دون إضافة أقسام أو خدمات لم تُعتمد بعد.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden border bg-border sm:grid-cols-3">
            {foundations.map((item) => (
              <article key={item.number} className="bg-card p-7 sm:p-8">
                <span className="text-sm font-bold text-accent">{item.number}</span>
                <h3 className="mt-7 text-xl font-bold text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
