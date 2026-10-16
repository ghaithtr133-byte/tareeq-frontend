import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { ContentSection, PageIntro } from "@/components/public/page-components";
import { ScholarshipFilters } from "@/components/public/scholarship-filters";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("المنح الدراسية", "تصفح المنح المنشورة عند توفر بياناتها المعتمدة.", { pathname: "/scholarships" });

export default function ScholarshipsPage() {
  return (
    <main>
      <PageIntro eyebrow="المنح الدراسية" title="فرص تمويل تُعرض بوضوح" intro="لا توجد سجلات منح موثقة حاليًا. تتوفر أدوات تصفية الواجهة استعدادًا للبيانات المنشورة والمعتمدة." />
      <ContentSection>
        <Container className="max-w-5xl">
          <Suspense fallback={<div className="min-h-64 border border-primary/15 bg-card" aria-busy="true" aria-label="جارٍ تحميل أدوات تصفية المنح" />}>
            <ScholarshipFilters />
          </Suspense>
        </Container>
      </ContentSection>
    </main>
  );
}
