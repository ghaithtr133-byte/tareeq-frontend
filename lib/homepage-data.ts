import type { Article, Country, PublicList, Scholarship, Service, University } from "@/lib/api-client/public-content";

export type HomeFaqRecord = { id: string; scope: "GLOBAL"; questionAr: string; answerAr: string; publishedAt?: string | null };
export type HomeUniversity = University & { universityType?: "PUBLIC" | "PRIVATE" | null; city?: { nameAr?: string } | null };
export type HomeEntities = { countries: Country; universities: HomeUniversity; scholarships: Scholarship; services: Service; articles: Article; faqs: HomeFaqRecord };
export type HomeSection = keyof HomeEntities;
export const homeQueries = {
  countries: { limit: 4, sort: "manual" }, universities: { featured: "true", limit: 12, sort: "newest" },
  scholarships: { featured: "true", limit: 4, sort: "newest" }, services: { limit: 5, sort: "manual" },
  articles: { limit: 6, sort: "newest" }, faqs: { scope: "GLOBAL", limit: 6 },
} as const;
export type HomeResult<T> = { kind: "success" | "empty" | "partial"; items: T[]; total: number; invalidRecords: number } | { kind: "error"; items: T[]; total: null; invalidRecords: number };

export function homeImageUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  if (/^\/(?!\/)/.test(value)) return value;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? value : undefined; } catch { return undefined; }
}

/** Public list projections omit status; explicit non-published fixtures are still rejected. */
export function parseHomeList<K extends HomeSection>(section: K, value: unknown): HomeResult<HomeEntities[K]> {
  const data = value as PublicList<Record<string, unknown>> | null;
  if (!data || !Array.isArray(data.items) || !data.pagination || !Number.isInteger(data.pagination.total) || data.pagination.total < 0) throw new Error("Invalid Homepage collection.");
  if ((!data.items.length && data.pagination.total > 0) || data.pagination.total < data.items.length) throw new Error("Inconsistent Homepage collection.");
  const seen = new Set<string>();
  const items = data.items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const text = (key: string) => typeof item[key] === "string" ? item[key].trim() : "";
    const title = text(section === "countries" || section === "universities" ? "nameAr" : section === "faqs" ? "questionAr" : "titleAr");
    if (!text("id") || seen.has(text("id")) || !title || (item.status !== undefined && item.status !== "PUBLISHED")) return [];
    if (section === "faqs" ? item.scope !== "GLOBAL" || !text("answerAr") : !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text("slug"))) return [];
    seen.add(text("id"));
    const normalized = { ...item };
    for (const key of ["id", "slug", "nameAr", "titleAr", "summaryAr", "introductionAr", "overviewAr", "studyLevel", "fundingType", "cityAr", "questionAr", "answerAr", "imageAltAr", "coverImageAltAr"]) if (key in normalized) normalized[key] = text(key);
    if ("featured" in normalized && typeof normalized.featured !== "boolean") normalized.featured = false;
    const city = normalized.city as Record<string, unknown> | null;
    if (city && typeof city.nameAr !== "string") delete normalized.city;
    for (const key of ["imageUrl", "coverImageUrl"]) if (key in normalized) normalized[key] = homeImageUrl(normalized[key]) ?? null;
    if (normalized.publishedAt && (typeof normalized.publishedAt !== "string" || !Number.isFinite(Date.parse(normalized.publishedAt)))) normalized.publishedAt = null;
    for (const key of ["country", "university"] as const) {
      const ref = normalized[key] as Record<string, unknown> | null;
      if (ref && (typeof ref.nameAr !== "string" || typeof ref.slug !== "string")) delete normalized[key];
    }
    return [normalized as HomeEntities[K]];
  });
  const invalidRecords = data.items.length - items.length;
  return { kind: invalidRecords ? "partial" : items.length ? "success" : "empty", items, total: data.pagination.total, invalidRecords };
}

export const homeError = <T>(): HomeResult<T> => ({ kind: "error", items: [], total: null, invalidRecords: 0 });

// Labels for observed public content codes, not estimates of amounts or eligibility.
const homeLabels: Record<string, string> = {
  MASTER: "ماجستير", MASTERS: "ماجستير", BACHELOR: "بكالوريوس", BACHELORS: "بكالوريوس", PHD: "دكتوراه",
  BACHELOR_MASTER_PHD: "بكالوريوس، ماجستير، دكتوراه",
  ASSOCIATE_BACHELOR_MASTER_PHD: "دبلوم، بكالوريوس، ماجستير، دكتوراه",
  GOVERNMENT_FUNDED: "تمويل حكومي", GOVERNMENT_FUNDED_FULL: "تمويل حكومي شامل", TUITION_AND_STIPEND: "رسوم دراسية ومخصص مالي",
};
export function homeMetadataLabel(value?: string | null) {
  const text = value?.trim();
  return text ? homeLabels[text] ?? (/^[A-Z][A-Z_]+$/.test(text) ? undefined : text) : undefined;
}
