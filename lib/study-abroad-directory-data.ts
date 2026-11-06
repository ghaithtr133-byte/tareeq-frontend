import type { Country, Pagination, PublicList } from "@/lib/api-client/public-content";
import { approvedHomeCardCopy, homeCardText } from "@/lib/homepage-card-content";

// Actual public list projection omits status/createdAt/updatedAt. The endpoint
// guarantees published-only records; do not require the full entity schema.
export type DestinationCountry = Pick<Country, "id" | "slug" | "nameAr" | "featured" | "introductionAr" | "imageUrl" | "imageAltAr">;

function mediaUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const src = value.trim();
  if (/^\/(?!\/)/.test(src)) return src;
  try {
    const url = new URL(src);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? src : null;
  } catch { return null; }
}

export function parseDestinationDirectory(value: unknown): PublicList<DestinationCountry> {
  const data = value as { items?: unknown[]; pagination?: Pagination } | null;
  const pagination = data?.pagination;
  if (!Array.isArray(data?.items) || !pagination ||
    ![pagination.page, pagination.limit, pagination.total, pagination.totalPages].every(Number.isInteger) ||
    pagination.page < 1 || pagination.limit !== 6 || pagination.total < 0 ||
    pagination.totalPages !== Math.ceil(pagination.total / pagination.limit) ||
    data.items.length > pagination.limit || data.items.length > pagination.total ||
    (pagination.page <= pagination.totalPages && data.items.length === 0)) {
    throw new Error("Invalid destinations response");
  }
  const seen = new Set<string>();
  const slugs = new Set<string>();
  const items = data.items.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid destination");
    const item = raw as Record<string, unknown>;
    const text = (key: string) => typeof item[key] === "string" ? item[key].trim() : "";
    const id = text("id"), slug = text("slug"), nameAr = text("nameAr");
    if (!id || !nameAr || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || seen.has(id) || slugs.has(slug) ||
      (item.status !== undefined && item.status !== "PUBLISHED")) throw new Error("Invalid destination identity");
    seen.add(id);
    slugs.add(slug);
    const original = approvedHomeCardCopy("countries", slug, nameAr);
    return {
      id, slug, nameAr,
      featured: item.featured === true,
      introductionAr: homeCardText(text("introductionAr"), "وصف الوجهة", original?.description),
      imageUrl: mediaUrl(item.imageUrl),
      imageAltAr: text("imageAltAr") || null,
    };
  });
  return { items, pagination: { ...pagination } };
}
