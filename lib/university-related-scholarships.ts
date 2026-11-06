import type { PublicList, Scholarship, ScholarshipListParams } from "@/lib/api-client/public-content";
import type { LiveUniversityParams } from "@/lib/university-directory-data";
import { liveUniversityFilters } from "@/lib/university-directory-data";

export const RELATED_DIRECTORY_BATCH = 4;
export function universityScholarshipParams(criteria: LiveUniversityParams, page: number) {
  if (!criteria || typeof criteria !== "object" || !Number.isSafeInteger(page) || page < 1) throw Error("Invalid related criteria");
  const filters = liveUniversityFilters(criteria as Record<string, string>);
  const params = {
    universitySearch: typeof criteria.search === "string" && criteria.search.trim().length <= 200 ? criteria.search.trim() || undefined : undefined,
    universityCountry: typeof criteria.country === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(criteria.country) && criteria.country.length <= 120 ? criteria.country : undefined,
    universityMajor: filters.major,
    universityStudyLevel: filters.studyLevel,
    universityLanguage: filters.language,
    universityCity: filters.city,
    universityType: filters.universityType,
    universityFeatured: criteria.featured === "true" || criteria.featured === "false" ? criteria.featured : undefined,
  };
  if (!Object.values(params).some((value) => value !== undefined)) throw Error("Related request requires active university criteria");
  // page/limit belong only to scholarships. Never forward University page,
  // University sort=name, IDs, or ordinary Scholarship filters with other meanings.
  return { ...params, page, limit: RELATED_DIRECTORY_BATCH, sort: "newest" as const } satisfies ScholarshipListParams;
}

export function parseRelatedScholarships(value: unknown): PublicList<Scholarship> {
  const data = value as PublicList<Scholarship> | null;
  const p = data?.pagination;
  if (!data || !Array.isArray(data.items) || !p || ![p.page, p.limit, p.total, p.totalPages].every(Number.isInteger) || p.page < 1 || p.limit !== RELATED_DIRECTORY_BATCH || p.total < 0 || p.totalPages !== Math.ceil(p.total / p.limit) || data.items.length > p.limit || data.items.length > p.total || (!data.items.length && p.total > 0 && p.page <= p.totalPages)) throw Error("Invalid related scholarship response");
  const seen = new Set<string>();
  for (const item of data.items) {
    if (!item || typeof item.id !== "string" || !item.id.trim() || seen.has(item.id) || typeof item.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || typeof item.titleAr !== "string" || !item.titleAr.trim() || typeof item.universityId !== "string" || !item.universityId || (item.status !== undefined && item.status !== "PUBLISHED")) throw Error("Invalid related scholarship");
    seen.add(item.id);
  }
  return { ...data, items: data.items.map((item) => {
    const reference = (value: unknown, expected: string | null) => {
      const ref = value as { id?: unknown; slug?: unknown; nameAr?: unknown } | null;
      return ref && ref.id === expected && typeof ref.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(ref.slug) && typeof ref.nameAr === "string" && ref.nameAr.trim() ? { id: ref.id as string, slug: ref.slug, nameAr: ref.nameAr.trim() } : null;
    };
    return { ...item, titleAr: item.titleAr.trim(), studyLevel: typeof item.studyLevel === "string" ? item.studyLevel : "", fundingType: typeof item.fundingType === "string" ? item.fundingType : "", university: reference(item.university, item.universityId), country: reference(item.country, item.countryId) };
  }) };
}

export function nextRelatedScholarshipPage(last: PublicList<Scholarship>) {
  return last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined;
}
