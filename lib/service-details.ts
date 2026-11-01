import type { Service } from "@/api/public-content";
import type { FaqItem } from "@/components/public/faq-accordion";

export type ServiceKind = "admissions" | "major" | "scholarships" | "documents" | "follow-up" | "general";
export type ServiceDetailExtras = {
  steps: { title: string; description: string }[];
  benefits: { title: string; description: string }[];
  faqs: FaqItem[];
};
export const emptyServiceExtras = (): ServiceDetailExtras => ({ steps: [], benefits: [], faqs: [] });

/** Presentation identity only. URLs always come from actual published records, never this map. */
export function serviceKind(service: Pick<Service, "titleAr">): ServiceKind {
  const kinds: Record<string, ServiceKind> = {
    "القبول الجامعي": "admissions", "اختيار التخصص": "major", "المنح الدراسية": "scholarships",
    "تجهيز الملف": "documents", "متابعة القبول": "follow-up",
  };
  return kinds[service.titleAr.trim()] ?? "general";
}

export function serviceDetailHref(service: Pick<Service, "slug">) {
  return `/services/${encodeURIComponent(service.slug)}`;
}

export function serviceDetailMedia(service: Service) {
  if (serviceKind(service) === "admissions") return {
    src: "/images/services/university-admission-hero.png",
    alt: "طالب أمام مبنى جامعي — صورة توضيحية لخدمة القبول الجامعي",
  };
  if (service.imageUrl && (/^\/(?!\/)/.test(service.imageUrl) || /^https?:\/\//i.test(service.imageUrl))) {
    return { src: service.imageUrl, alt: service.imageAltAr || service.titleAr };
  }
  return null;
}

export function otherPublishedServices(items: Service[], current: Service) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (item.status !== "PUBLISHED" || item.id === current.id || item.slug === current.slug || !item.slug || seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  }).slice(0, 3);
}

/** Enable a directory CTA only when the current source supplies a matching published service. */
export function publishedServiceHref(title: string, items: Service[]) {
  const matches = items.filter((item) => item.status === "PUBLISHED" && item.titleAr.trim() === title.trim() && item.slug);
  return matches.length === 1 ? serviceDetailHref(matches[0]) : null;
}
