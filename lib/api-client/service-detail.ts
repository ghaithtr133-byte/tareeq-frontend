import "server-only";
import { cache } from "react";
import { getService } from "@/lib/api-client/public-content";
import { ApiError } from "@/lib/api-client/error";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { parsePublishedService, validServiceSlug } from "@/lib/service-detail-live";
import { publicDemoContent } from "@/lib/mocks/public-demo-content";
import { demoServiceDetails } from "@/lib/mocks/service-detail-fixtures";
import { homeCardText } from "@/lib/homepage-card-content";
import type { Service, PublicList } from "@/lib/api-client/public-content";
import type { ServiceDetailExtras } from "@/lib/service-details";
import { serviceDetailList } from "@/lib/service-detail-live";

export const getPublishedServiceDetail = cache(async (slug: string) => {
  if (!validServiceSlug(slug)) throw new ApiError(404, "Invalid service slug");
  const raw = await getService(slug);
  if (raw?.status !== undefined && raw.status !== "PUBLISHED") throw new ApiError(404, "Unpublished service");
  return isPublicDemoMode() ? raw : parsePublishedService(raw, slug);
});

/** Presentation recovery only, never a substitute for failed or nonexistent Live records. */
export function unavailableServiceContent(service: Service): { service: Service; extras: ServiceDetailExtras } {
  const same = publicDemoContent.services.find((item) => item.slug === service.slug && item.titleAr === service.titleAr);
  const original = same ? demoServiceDetails(same) : undefined;
  const slots = (items: { title: string; description: string }[] | undefined, label: string) => items?.length ? items.map((item) => ({ title: homeCardText(undefined, label, item.title), description: homeCardText(undefined, label, item.description) })) : [{ title: homeCardText(undefined, label), description: homeCardText(undefined, `تفاصيل ${label}`) }];
  return { service: { ...service, summaryAr: homeCardText(service.summaryAr, "ملخص الخدمة", same?.summaryAr), descriptionAr: homeCardText(service.descriptionAr, "وصف الخدمة", same?.descriptionAr) },
    extras: { steps: slots(original?.steps, "مراحل الخدمة"), benefits: slots(original?.benefits, "مميزات الخدمة"), faqs: [] } };
}
export function parseOtherServices(value: unknown): PublicList<Service> {
  const list = serviceDetailList(value, (row) => parsePublishedService(row));
  if (list.pagination.page !== 1 || list.pagination.limit !== 4) throw Error("Invalid service alternatives page");
  return list;
}
