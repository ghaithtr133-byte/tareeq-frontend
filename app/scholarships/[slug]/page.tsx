import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedScholarshipDetail } from "@/api/scholarship-detail";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { ContentSection } from "@/components/public/page-components";
import { HomeSectionError } from "@/components/home/home-section-error";
import { ScholarshipDetails } from "@/components/public/scholarship-details";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; try { const scholarship = await getPublishedScholarshipDetail(slug); return createPageMetadata(scholarship.seoTitleAr ?? scholarship.titleAr, scholarship.seoDescriptionAr ?? scholarship.descriptionAr, { index: true, pathname: `/scholarships/${scholarship.slug}`, publishedAt: scholarship.publishedAt, imageUrl: isPublicDemoMode() ? undefined : (scholarship as { imageUrl?: string | null }).imageUrl }); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); return createPageMetadata("المنحة الدراسية", "معلومات المنحة المنشورة لدى طريق الأكاديمية."); } }
export default async function ScholarshipDetailPage({ params }: Props) {
  const { slug } = await params;
  let scholarship;
  try { scholarship = await getPublishedScholarshipDetail(slug); }
  catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <main><ContentSection><Container className="max-w-5xl"><HomeSectionError title="تعذّر تحميل معلومات المنحة" description="حدثت مشكلة أثناء جلب معلومات المنحة. يرجى المحاولة مجدداً." /></Container></ContentSection></main>;
  }
  const demo = isPublicDemoMode();
  // Isolate illustrative content and pending fields from the Live data path.
  if (demo) {
    const [{ getDemoScholarshipDetails }, { demoScholarshipMedia }] = await Promise.all([
      import("@/lib/mocks/scholarship-detail-fixtures"), import("@/lib/mocks/scholarship-directory-fixtures"),
    ]);
    return <ScholarshipDetails scholarship={scholarship} demo extras={getDemoScholarshipDetails(slug)} media={demoScholarshipMedia[slug]} />;
  }
  return <ScholarshipDetails scholarship={scholarship} demo={false} />;
}
