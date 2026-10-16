import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { Breadcrumbs, ContentSection, ContentUnavailable, PageIntro } from "@/components/public/page-components";
import { getApprovedDestination } from "@/lib/public-destinations";
import { createPageMetadata } from "@/lib/seo";

type DestinationPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = getApprovedDestination(slug);
  return destination
    ? createPageMetadata(`الدراسة في ${destination.name}`, `محتوى الدراسة في ${destination.name} لدى طريق الأكاديمية.`, { pathname: `/study-abroad/${destination.slug}` })
    : createPageMetadata("الوجهة غير متاحة", "لم نعثر على وجهة الدراسة المطلوبة.");
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const destination = getApprovedDestination(slug);
  if (!destination) notFound();

  return (
    <main>
      <Breadcrumbs items={[{ href: "/", label: "الرئيسية" }, { href: "/study-abroad", label: "الدراسة في الخارج" }, { label: destination.name }]} />
      <PageIntro eyebrow="وجهات الدراسة" title={`الدراسة في ${destination.name}`} intro="ستتاح معلومات هذه الوجهة عند نشر المحتوى المعتمد من فريق الأكاديمية." />
      <ContentSection>
        <Container className="max-w-5xl">
          <ContentUnavailable title="تفاصيل الوجهة قيد الإتاحة" description="لن نعرض معلومات عن القبول أو التأشيرات أو التكاليف قبل اعتمادها من المصدر المناسب." contact />
        </Container>
      </ContentSection>
    </main>
  );
}
