import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ContentSection, ContentUnavailable, PageIntro } from "@/components/public/page-components";
import { getApprovedDestination } from "@/lib/public-destinations";
import { createPageMetadata } from "@/lib/seo";

type DestinationPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = getApprovedDestination(slug);
  return destination
    ? createPageMetadata(`الدراسة في ${destination.name}`, `محتوى الدراسة في ${destination.name} لدى طريق الأكاديمية.`, false)
    : createPageMetadata("الوجهة غير متاحة", "لم نعثر على وجهة الدراسة المطلوبة.", false);
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const destination = getApprovedDestination(slug);
  if (!destination) notFound();

  return (
    <main>
      <PageIntro eyebrow="وجهات الدراسة" title={`الدراسة في ${destination.name}`} intro="ستتاح معلومات هذه الوجهة عند نشر المحتوى المعتمد من فريق الأكاديمية." />
      <ContentSection>
        <Container className="max-w-5xl">
          <ContentUnavailable title="تفاصيل الوجهة قيد الإتاحة" description="لن نعرض معلومات عن القبول أو التأشيرات أو التكاليف قبل اعتمادها من المصدر المناسب." contact />
        </Container>
      </ContentSection>
    </main>
  );
}
