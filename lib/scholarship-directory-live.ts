import type { Country, PublicList, Scholarship, University } from "@/lib/api-client/public-content";
import { homeImageUrl } from "@/lib/homepage-data";

export type DirectoryLiveScholarship = Scholarship & { imageUrl?: string | null; imageAltAr?: string | null };
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const slug = (value: unknown) => typeof value === "string" && value.length >= 2 && value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export const scholarshipUnavailable = (label: string) => `${label} (غير متوفر حالياً)`;

// Backend controls application status. Publication and local clocks never imply OPEN/CLOSED.
export function directoryApplicationStatus(item: Scholarship) {
  const value = item.effectiveApplicationStatus ?? item.applicationStatus;
  return value === "OPEN" || value === "CLOSED" ? value : null;
}
export function directoryDeadline(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? value : null;
}

export function scholarshipLookup<T extends Country | University>(value: unknown): PublicList<T> {
  return publishedList(value, (row) => {
    if (!text(row.nameAr)) throw Error("Invalid lookup name");
    return row as T;
  });
}
function publishedList<T>(value: unknown, map: (row: Record<string, unknown>) => T): PublicList<T> {
  const list = value as PublicList<Record<string, unknown>>;
  const p = list?.pagination;
  if (!Array.isArray(list?.items) || !p || ![p.page, p.limit, p.total, p.totalPages].every(Number.isSafeInteger) || p.page < 1 || p.limit < 1 || p.limit > 50 || p.total < 0 || p.totalPages !== Math.ceil(p.total / p.limit) || list.items.length > Math.min(p.limit, p.total) || (p.page <= p.totalPages && !list.items.length)) throw Error("Invalid scholarship collection");
  const ids = new Set<string>(), slugs = new Set<string>();
  return { pagination: p, items: list.items.map((row) => {
    // Public projections omit status; explicit drafts/archives or invalid identity are response errors, not empty results.
    if (!row || !text(row.id) || ids.has(String(row.id)) || !slug(row.slug) || slugs.has(String(row.slug)) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid public record");
    ids.add(String(row.id)); slugs.add(String(row.slug));
    return map(row);
  }) };
}
export function parseScholarshipDirectory(value: unknown, page: number): PublicList<DirectoryLiveScholarship> {
  const parsed = publishedList<DirectoryLiveScholarship>(value, (row) => ({ ...row,
    titleAr: text(row.titleAr) || scholarshipUnavailable("اسم المنحة"), titleEn: text(row.titleEn) || null,
    countryId: text(row.countryId) || null, universityId: text(row.universityId) || null,
    studyLevel: text(row.studyLevel), fundingType: text(row.fundingType),
    imageUrl: homeImageUrl(row.imageUrl) ?? null, imageAltAr: text(row.imageAltAr) || null,
    verifiedDeadline: directoryDeadline(row.verifiedDeadline), featured: row.featured === true,
  }) as DirectoryLiveScholarship);
  if (parsed.pagination.page !== page || parsed.pagination.limit !== 12) throw Error("Invalid requested page");
  return parsed;
}

export function joinScholarshipDirectory(items: DirectoryLiveScholarship[], countries: Country[], universities: University[]) {
  const countryById = new Map(countries.map((row) => [row.id, row]));
  const universityById = new Map(universities.map((row) => [row.id, row]));
  return items.map((item) => {
    const valid = (row: { id: string; slug: string; nameAr: string } | null | undefined, id: string | null) => row && row.id === id && slug(row.slug) && text(row.nameAr) ? row : undefined;
    const country = valid(item.country, item.countryId) ?? countryById.get(item.countryId ?? "");
    const university = valid(item.university, item.universityId) ?? universityById.get(item.universityId ?? "");
    return { ...item, country: country ? { id: country.id, slug: country.slug, nameAr: country.nameAr } : null,
      university: university ? { id: university.id, slug: university.slug, nameAr: university.nameAr } : null };
  });
}

// Presentation translations of actual string values, NOT a Backend enum or fabricated filter choices.
const studyLabels: Record<string, string> = {
  MASTER: "ماجستير", MASTERS: "ماجستير", BACHELOR: "بكالوريوس", BACHELORS: "بكالوريوس", PHD: "دكتوراه", DIPLOMA: "دبلوم", FOUNDATION: "سنة تحضيرية",
  BACHELOR_MASTER_PHD: "بكالوريوس، ماجستير، دكتوراه", ASSOCIATE_BACHELOR_MASTER_PHD: "دبلوم، بكالوريوس، ماجستير، دكتوراه",
};
const fundingLabels: Record<string, string> = {
  FULL: "تمويل كامل", PARTIAL: "تمويل جزئي", TUITION_AND_STIPEND: "رسوم دراسية ومنحة مالية", GOVERNMENT_FUNDED_FULL: "تمويل حكومي كامل", GOVERNMENT_FUNDED: "تمويل حكومي",
};
export function directoryScholarshipLabel(value: string, kind: "study" | "funding") {
  return (kind === "study" ? studyLabels : fundingLabels)[value] || value || scholarshipUnavailable(kind === "study" ? "المستوى الدراسي" : "نوع التمويل");
}
