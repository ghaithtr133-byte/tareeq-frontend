import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ContentSection, EditorialLink, PageIntro } from "@/components/public/page-components";
import { approvedDestinations } from "@/lib/public-destinations";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("الدراسة في الخارج", "استكشف وجهات الدراسة الأولية المعتمدة لدى طريق الأكاديمية.", { index: true, pathname: "/study-abroad" });

export default function StudyAbroadPage() {
  return (
    <main>
      <PageIntro eyebrow="وجهات الدراسة" title="وجهات الدراسة في الخارج" intro="تعرّف إلى الوجهات الأولية المعتمدة. ستُنشر التفاصيل والمعلومات العملية عند توفر المحتوى الذي يديره فريق الأكاديمية." />
      <ContentSection>
        <Container>
          <ol className="border-t border-primary/15">
            {approvedDestinations.map((destination, index) => (
              <li key={destination.slug} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-primary/15 py-6 sm:grid-cols-[3rem_1fr_auto] sm:py-8">
                <span className="text-xs font-bold tracking-[0.14em] text-accent" dir="ltr">0{index + 1}</span>
                <Link href={`/study-abroad/${destination.slug}`} className="rounded-sm text-xl font-bold text-primary transition-colors hover:text-accent focus-visible:text-accent sm:text-2xl">{destination.name}</Link>
                <EditorialLink href={`/study-abroad/${destination.slug}`}>عرض الوجهة</EditorialLink>
              </li>
            ))}
          </ol>
        </Container>
      </ContentSection>
    </main>
  );
}
