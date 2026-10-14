import { Container } from "@/components/layout/container";
import { ContentSection, PageIntro } from "@/components/public/page-components";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("عن طريق الأكاديمية", "تعرف إلى طريق الأكاديمية وخدماتها التعليمية.", true);

export default function AboutPage() {
  return (
    <main>
      <PageIntro eyebrow="عن طريق" title="إرشاد تعليمي يبدأ بالوضوح" intro="طريق الأكاديمية تقدّم استشارات تعليمية، ومساعدة في القبول الجامعي، وتوجيهًا للطلاب المهتمين بالدراسة في الخارج." />
      <ContentSection>
        <Container className="max-w-5xl">
          <div className="border-s-2 border-accent bg-card p-6 sm:p-9">
            <p className="max-w-3xl text-lg font-bold leading-9 text-primary">نحافظ على دقة المعلومات المعروضة وننشر التفاصيل الإضافية عند اعتمادها من فريق الأكاديمية.</p>
          </div>
        </Container>
      </ContentSection>
    </main>
  );
}
