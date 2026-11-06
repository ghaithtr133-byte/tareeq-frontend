import type { PublicList, Service } from "@/lib/api-client/public-content";
import { homeImageUrl } from "@/lib/homepage-data";
import { approvedHomeCardCopy, homeCardText } from "@/lib/homepage-card-content";
import { publicServices, type PublicService } from "@/lib/public-services";

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
export function servicesDirectoryPage(value: unknown) {
  return typeof value === "string" && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= 1 ? Number(value) : 1;
}

/** Validate the public projection without requiring Admin-only status/timestamps. Keep Backend order. */
export function parseServicesDirectory(value: unknown, page: number): PublicList<Service> {
  const data = value as PublicList<Service>;
  const p = data?.pagination;
  if (!Array.isArray(data?.items) || !p || ![p.page, p.limit, p.total, p.totalPages].every(Number.isSafeInteger) || p.page !== page || p.page < 1 || p.limit !== 5 || p.total < 0 || p.totalPages !== Math.ceil(p.total / p.limit) || data.items.length > Math.min(p.limit, p.total) || (p.page <= p.totalPages && !data.items.length)) throw Error("Invalid services collection");
  const seen = new Set<string>(), slugs = new Set<string>();
  for (const row of data.items) {
    if (!row || !text(row.id) || seen.has(row.id) || typeof row.slug !== "string" || row.slug.length < 2 || row.slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) || slugs.has(row.slug) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid public service");
    seen.add(row.id); slugs.add(row.slug);
  }
  return data;
}

export function serviceOverviewFromLive(row: Service): PublicService {
  const title = text(row.titleAr);
  // Exact previously approved slug + Arabic title, never array position or fuzzy name inference.
  const copy = approvedHomeCardCopy("services", row.slug, title);
  const approved = copy ? publicServices.find((item) => item.title === title) : undefined;
  const src = homeImageUrl(row.imageUrl);
  return { slug: row.slug, title: homeCardText(title, "اسم الخدمة"),
    homepageSummary: text(row.summaryAr), description: homeCardText(text(row.summaryAr) || text(row.descriptionAr), "وصف الخدمة", approved?.description),
    icon: approved?.icon ?? "general", image: src ? { src, alt: text(row.imageAltAr) || homeCardText(title, "صورة الخدمة") } : null,
    detailAvailable: false, // Live CTA is explicitly supplied from the actual published record, not a planned URL.
  };
}
