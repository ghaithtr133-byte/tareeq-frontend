import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServices, type Service } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { HomeSectionError } from "@/components/home/home-section-error";
import { ServiceDetails } from "@/components/public/service-details";
import { demoServiceDetails } from "@/lib/mocks/service-detail-fixtures";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { otherPublishedServices, serviceDetailHref, serviceDetailMedia } from "@/lib/service-details";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedServiceDetail, parseOtherServices, unavailableServiceContent } from "@/api/service-detail";
import { loadServiceFaqs } from "@/api/service-faq-actions";
import { realServiceMedia } from "@/lib/service-detail-live";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let service: Service;
  try {
    service = await getPublishedServiceDetail(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    // Keep a draft/not-found response out of search, including when metadata cannot load.
    return createPageMetadata("الخدمة التعليمية", "معلومات الخدمة المنشورة لدى طريق الأكاديمية.");
  }
  return createPageMetadata(service.seoTitleAr || service.titleAr, service.seoDescriptionAr || service.summaryAr || service.descriptionAr, {
    index: true, pathname: serviceDetailHref(service), imageUrl: (isPublicDemoMode() ? serviceDetailMedia(service) : realServiceMedia(service))?.src, publishedAt: service.publishedAt,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  let service: Service | undefined;
  try { service = await getPublishedServiceDetail(slug); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); }
  if (!service) return <main><Container className="space-y-4 py-10"><HomeSectionError title="تعذّر تحميل معلومات الخدمة" description="حدثت مشكلة أثناء جلب الخدمة المنشورة. يرجى المحاولة مجدداً." /></Container></main>;
  const demo = isPublicDemoMode();
  // Existing public listing only: at most four records yield three alternatives after exclusion.
  const [listing, faq] = await Promise.all([
    getServices({ limit: 4, sort: "manual" }).then((data) => ({ ok: true as const, items: demo ? data.items : parseOtherServices(data).items })).catch(() => ({ ok: false as const, items: [] })),
    demo ? Promise.resolve(undefined) : loadServiceFaqs(service.slug),
  ]);
  const presentation = demo ? { service, extras: demoServiceDetails(service) } : unavailableServiceContent(service);
  return <ServiceDetails service={presentation.service} extras={presentation.extras} related={otherPublishedServices(listing.items, service)} relatedFailed={!listing.ok} demo={demo} liveFaq={faq} />;
}
