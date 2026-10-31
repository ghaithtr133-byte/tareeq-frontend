import type { Scholarship, ScholarshipListParams } from "@/api/public-content";
import { scholarshipsParams, type RouteSearchParams } from "@/lib/public-search-params";

export const scholarshipFilterKeys = ["search", "country", "university", "studyLevel", "fundingType", "applicationStatus", "featured", "sort"] as const;
export type ScholarshipFilterKey = (typeof scholarshipFilterKeys)[number];
export type ScholarshipFilterValues = Record<ScholarshipFilterKey, string>;

export function directoryScholarshipParams(raw: RouteSearchParams): ScholarshipListParams {
  const parsed = scholarshipsParams(raw);
  return { ...parsed, search: parsed.search?.slice(0, 200), page: parsed.page ?? 1, limit: 12, sort: parsed.sort ?? "newest" };
}

export function scholarshipFilterValues(params: ScholarshipListParams): ScholarshipFilterValues {
  return Object.fromEntries(scholarshipFilterKeys.map((key) => [key, params[key] ?? ""])) as ScholarshipFilterValues;
}

export function scholarshipDirectoryHref(values: Partial<ScholarshipFilterValues>, page = 1) {
  const query = new URLSearchParams();
  for (const key of scholarshipFilterKeys) {
    const value = values[key]?.trim();
    if (value && !(key === "sort" && value === "newest")) query.set(key, value);
  }
  if (page > 1) query.set("page", String(page));
  return `/scholarships${query.size ? `?${query}` : ""}`;
}

export function scholarshipStatus(scholarship: Scholarship) {
  return scholarship.effectiveApplicationStatus ?? scholarship.applicationStatus;
}

export function scholarshipDeadline(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("ar", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function scholarshipPageNumbers(page: number, total: number): (number | string)[] {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  if (page <= 2) pages.add(3);
  if (page >= total - 1) pages.add(total - 2);
  const sorted = [...pages].filter((item) => item > 0 && item <= total).sort((a, b) => a - b);
  return sorted.flatMap((item, index) => index && item - sorted[index - 1] > 1 ? [`gap-${item}`, item] : [item]);
}
