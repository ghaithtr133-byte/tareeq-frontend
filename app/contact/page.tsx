import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ContentSection, PageIntro } from "@/components/public/page-components";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("تواصل معنا", "تواصل مع طريق الأكاديمية عبر واتساب.", true);

export default function ContactPage() {
  return (
    <main>
      <PageIntro eyebrow="تواصل" title="تواصل مع طريق الأكاديمية" intro="تتوفر حاليًا قناة تواصل معتمدة واحدة للاستفسارات العامة." />
      <ContentSection>
        <Container className="max-w-5xl">
          <div className="grid gap-8 border border-primary/15 bg-card p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-9">
            <div>
              <p className="text-[0.6875rem] font-bold tracking-[0.17em] text-accent">واتساب</p>
              <a className="mt-4 inline-block rounded-sm text-2xl font-bold tracking-wide text-primary transition-colors hover:text-accent" href="https://wa.me/963992277142" target="_blank" rel="noreferrer" dir="ltr">+963 992 277 142</a>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">لا تتوفر حاليًا عناوين مكاتب أو بريد إلكتروني معتمد للنشر.</p>
            </div>
            <Button asChild size="lg"><a href="https://wa.me/963992277142" target="_blank" rel="noreferrer">فتح واتساب</a></Button>
          </div>
        </Container>
      </ContentSection>
    </main>
  );
}
