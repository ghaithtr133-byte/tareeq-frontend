import type { PublicList, Service } from "@/lib/api-client/public-content";
import { homeImageUrl } from "@/lib/homepage-data";
import { homeCardText } from "@/lib/homepage-card-content";

export const validServiceSlug = (value: unknown): value is string => typeof value === "string" && value.length >= 2 && value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export const serviceText = (value: unknown) => typeof value === "string" ? value.trim() : "";
export type ServiceFaq = { id: string; question: string; answer: string };
export type ServiceFaqResult = { ok: true; data: PublicList<ServiceFaq> } | { ok: false };
export function realServiceMedia(service: Service) {
  const src = homeImageUrl(service.imageUrl);
  return src ? { src, alt: serviceText(service.imageAltAr) || service.titleAr } : null;
}
export function parsePublishedService(value: unknown, slug?: string): Service {
  const row = value as Service;
  if (!row || !serviceText(row.id) || !validServiceSlug(row.slug) || (slug && row.slug !== slug) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid published service");
  return { ...row, status: "PUBLISHED", titleAr: homeCardText(serviceText(row.titleAr), "اسم الخدمة"), summaryAr: serviceText(row.summaryAr), descriptionAr: serviceText(row.descriptionAr),
    imageUrl: homeImageUrl(row.imageUrl) ?? null, imageAltAr: serviceText(row.imageAltAr) || null, seoTitleAr: serviceText(row.seoTitleAr) || null, seoDescriptionAr: serviceText(row.seoDescriptionAr) || null };
}
export function serviceDetailList<T>(value: unknown, map: (row: Record<string, unknown>) => T): PublicList<T> {
  const list = value as PublicList<Record<string, unknown>>;
  const p = list?.pagination;
  if (!Array.isArray(list?.items) || !p || ![p.page, p.limit, p.total, p.totalPages].every(Number.isSafeInteger) || p.page < 1 || p.limit < 1 || p.limit > 100 || p.total < 0 || p.totalPages !== Math.ceil(p.total / p.limit) || list.items.length > Math.min(p.limit, p.total) || (p.page <= p.totalPages && !list.items.length)) throw Error("Invalid service collection");
  const seen = new Set<string>();
  return { pagination: p, items: list.items.map((row) => { if (!row || !serviceText(row.id) || seen.has(String(row.id)) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid collection item"); seen.add(String(row.id)); return map(row); }) };
}
