import { Container } from "@/components/layout/container";
import { Breadcrumbs, ContentSection, ContentUnavailable, PageIntro } from "@/components/public/page-components";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("طلب مساعدة دراسية", "معلومات طلب المساعدة الدراسية لدى طريق الأكاديمية.", { pathname: "/apply" });

export default function ApplyPage() {
  return (
    <main>
      <Breadcrumbs items={[{ href: "/", label: "الرئيسية" }, { label: "طلب مساعدة دراسية" }]} />
      <PageIntro eyebrow="طلب مساعدة" title="ابدأ بطلب مساعدة دراسية" intro="تساعد طريق الأكاديمية الطلاب المهتمين بالدراسة في الخارج والحصول على القبول الجامعي. ستتوفر خطوات الطلب عند اعتماد آلية تقديمها." />
      <ContentSection>
        <Container className="max-w-5xl">
          <ContentUnavailable title="نموذج طلب المساعدة قيد الإتاحة" description="لا نعرض نموذجًا أو نجمع بيانات طلبات قبل اعتماد حقول التقديم وآلية الإرسال من Backend. يمكنك استخدام قناة التواصل المعتمدة للاستفسارات العامة." contact />
        </Container>
      </ContentSection>
    </main>
  );
}
