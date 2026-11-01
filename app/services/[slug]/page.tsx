import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService, getServices, type Service } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { ApiUnavailable } from "@/components/public/public-content";
import { ServiceDetails } from "@/components/public/service-details";
import { demoServiceDetails } from "@/lib/mocks/service-detail-fixtures";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { emptyServiceExtras, otherPublishedServices, serviceDetailHref, serviceDetailMedia } from "@/lib/service-details";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let service: Service;
  try {
    service = await getService(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    // Keep a draft/not-found response out of search, including when metadata cannot load.
    return createPageMetadata("الخدمة التعليمية", "معلومات الخدمة المنشورة لدى طريق الأكاديمية.");
  }
  if (service.status !== "PUBLISHED") notFound();
  return createPageMetadata(service.seoTitleAr || service.titleAr, service.seoDescriptionAr || service.summaryAr || service.descriptionAr, {
    index: true, pathname: serviceDetailHref(service), imageUrl: serviceDetailMedia(service)?.src, publishedAt: service.publishedAt,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  let service: Service | undefined;
  try { service = await getService(slug); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); }
  if (!service) return <main><Container className="space-y-4 py-10"><ApiUnavailable /><a href={`/services/${encodeURIComponent(slug)}`} className="inline-flex min-h-11 items-center rounded-lg border px-5 font-bold text-primary focus-visible:outline-2 focus-visible:outline-accent">إعادة المحاولة</a></Container></main>;
  if (service.status !== "PUBLISHED") notFound();
  const demo = isPublicDemoMode();
  // Existing public listing only: at most four records yield three alternatives after exclusion.
  const listing = await getServices({ limit: 4, sort: "manual" }).then((data) => ({ ok: true as const, items: data.items })).catch(() => ({ ok: false as const, items: [] }));
  return <ServiceDetails service={service} extras={demo ? demoServiceDetails(service) : emptyServiceExtras()} related={otherPublishedServices(listing.items, service)} relatedFailed={!listing.ok} demo={demo} />;
}
