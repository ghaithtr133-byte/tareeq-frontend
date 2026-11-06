import type { PublicList, University } from "@/lib/api-client/public-content";
import type { UniversityProgram } from "@/lib/university-details";
import { homeImageUrl } from "@/lib/homepage-data";
import { directoryLanguages, directoryStudyLevels } from "@/lib/university-directory-data";

export type DetailUniversity = University & { universityType?: "PUBLIC" | "PRIVATE" | null; cityId?: string | null; city?: { id: string; nameAr: string } | null };
export type DetailResult<T> = { ok: true; data: T } | { ok: false };
export type AdmissionItem = { id: string; label: string; content: string };
export type GalleryItem = { id: string; src: string | null; alt: string };
export type UniversityFaq = { id: string; question: string; answer: string };
export type LiveDetailSections = {
  programs: DetailResult<PublicList<UniversityProgram>>;
  admissions: DetailResult<AdmissionItem[]>;
  gallery: DetailResult<GalleryItem[]>;
  faqs: DetailResult<PublicList<UniversityFaq>>;
};
export type LiveProgramFilters = { search?: string; studyLevel?: string; language?: string; faculty?: string };
export const detailSlug = (value: unknown): value is string => typeof value === "string" && value.length >= 2 && value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export const detailText = (value: unknown) => typeof value === "string" ? value.trim() : "";
export const detailUnavailable = (label: string) => `${label} (غير متوفر حالياً)`;
export function detailWebsite(value: unknown) {
  if (typeof value !== "string") return null;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? value : null; } catch { return null; }
}

/** Public detail projections omit status; reject explicit unpublished records, never infer publication from Demo. */
export function parseDetailUniversity(value: unknown, requestedSlug: string): DetailUniversity {
  const row = value as DetailUniversity;
  if (!row || !detailText(row.id) || row.slug !== requestedSlug || !detailText(row.nameAr) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid university detail");
  const country = row.country;
  const city = row.city && row.city.id === row.cityId && detailText(row.city.nameAr) ? row.city : null;
  return { ...row, nameAr: row.nameAr.trim(), nameEn: detailText(row.nameEn) || null, overviewAr: detailText(row.overviewAr), city, cityAr: detailText(city?.nameAr) || detailText(row.cityAr),
    seoTitleAr: detailText(row.seoTitleAr) || null, seoDescriptionAr: detailText(row.seoDescriptionAr) || null,
    officialWebsite: detailWebsite(row.officialWebsite), imageUrl: homeImageUrl(row.imageUrl) ?? null, imageAltAr: detailText(row.imageAltAr) || null,
    country: country && country.id === row.countryId && detailSlug(country.slug) && detailText(country.nameAr) ? country : undefined,
  };
}

export function detailList<T>(value: unknown, map: (item: Record<string, unknown>) => T): PublicList<T> {
  const list = value as PublicList<Record<string, unknown>>;
  const p = list?.pagination;
  if (!Array.isArray(list?.items) || !p || ![p.page, p.limit, p.total, p.totalPages].every(Number.isSafeInteger) || p.page < 1 || p.limit < 1 || p.limit > 100 || p.total < 0 || p.totalPages !== Math.ceil(p.total / p.limit) || list.items.length > Math.min(p.limit, p.total) || (p.page <= p.totalPages && !list.items.length)) throw Error("Invalid detail collection");
  const seen = new Set<string>();
  return { pagination: p, items: list.items.map((row) => {
    if (!row || !detailText(row.id) || seen.has(String(row.id)) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid detail item");
    seen.add(String(row.id));
    return map(row);
  }) };
}

export function programQuery(filters: LiveProgramFilters, page: number) {
  if (!filters || typeof filters !== "object" || !Number.isSafeInteger(page) || page < 1) throw Error("Invalid program query");
  const query: Record<string, string | number> = { page, limit: 12 };
  for (const key of ["search", "faculty"] as const) {
    const value = filters[key];
    if (value !== undefined && (typeof value !== "string" || value.trim().length > 200)) throw Error("Invalid program filter");
    if (value?.trim()) query[key] = value.trim();
  }
  for (const [key, labels] of [["studyLevel", directoryStudyLevels], ["language", directoryLanguages]] as const) {
    const value = filters[key];
    if (value && !Object.hasOwn(labels, value)) throw Error("Invalid program enum");
    if (value) query[key] = value;
  }
  return query;
}
function localized(value: unknown, labels: Record<string, string>, label: string) { return typeof value === "string" && labels[value] ? labels[value] : detailUnavailable(label); }
function tuition(value: unknown): UniversityProgram["tuition"] {
  if (!value || typeof value !== "object") return null;
  const fee = value as Record<string, unknown>;
  const amount = typeof fee.amount === "string" && /^\d+(?:\.\d+)?$/.test(fee.amount) ? Number(fee.amount) : fee.amount;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || !/^[A-Z]{3}$/.test(detailText(fee.currency))) return null;
  const periods: Record<string, string> = { YEAR: "سنوياً", SEMESTER: "فصلياً", FULL_PROGRAM: "لكامل مدة التخصص" };
  return { amount, currency: String(fee.currency), period: periods[String(fee.billingPeriod)], academicYear: detailText(fee.academicYear) || undefined };
}
export function parseDetailPrograms(value: unknown) {
  return detailList<UniversityProgram>(value, (row) => ({
    id: String(row.id), name: detailText(row.nameAr) || detailText(row.nameEn) || detailText((row.academicMajor as { nameAr?: string } | null)?.nameAr) || detailUnavailable("اسم التخصص"),
    level: localized(row.studyLevel, directoryStudyLevels, "المستوى الدراسي"), faculty: detailText(row.facultyNameAr) || detailText(row.facultyNameEn) || detailUnavailable("الكلية"),
    language: Array.isArray(row.languages) && row.languages.length ? row.languages.map((item) => localized(item, directoryLanguages, "لغة الدراسة")).join("، ") : detailUnavailable("لغة الدراسة"),
    duration: typeof row.durationValue === "number" && row.durationValue > 0 && ["MONTHS", "YEARS"].includes(String(row.durationUnit)) ? `${row.durationValue} ${row.durationUnit === "YEARS" ? "سنوات" : "أشهر"}` : detailUnavailable("مدة الدراسة"),
    tuition: tuition(row.tuition),
    // Keep all verified academic-year schedules; do not replace missing current tuition with an arbitrary historic fee.
    tuitionHistory: Array.isArray(row.tuitionFees) ? row.tuitionFees.map(tuition).filter((fee) => fee !== null) : [],
  }));
}
export function parseDetailAdmissions(value: unknown): AdmissionItem[] {
  const data = value as Record<string, Record<string, unknown>[]>;
  return ([ ["university", "UNIVERSITY", "متطلبات الجامعة"], ["studyLevels", "STUDY_LEVEL", "متطلبات المرحلة"], ["programs", "PROGRAM", "متطلبات التخصص"] ] as const).flatMap(([key, scope, label]) => {
    if (!Array.isArray(data?.[key])) throw Error("Invalid admissions collection");
    return data[key].map((row) => {
      if (!row || !detailText(row.id) || row.scope !== scope || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid admissions scope");
      const program = row.program as { id?: string; nameAr?: string; nameEn?: string } | null;
      if (scope === "PROGRAM" && (!detailText(row.programId) || (program && program.id !== row.programId))) throw Error("Invalid admission program");
      return { id: String(row.id), label: scope === "STUDY_LEVEL" ? `${label}: ${localized(row.studyLevel, directoryStudyLevels, "المستوى الدراسي")}` : scope === "PROGRAM" ? `${label}: ${detailText(program?.nameAr) || detailText(program?.nameEn) || detailUnavailable("اسم التخصص")}` : label,
        content: detailText(row.contentAr) || detailUnavailable("شروط القبول") };
    });
  });
}
export function parseDetailGallery(value: unknown): GalleryItem[] {
  const data = value as { items: Record<string, unknown>[] };
  if (!Array.isArray(data?.items)) throw Error("Invalid gallery");
  return data.items.map((row) => {
    if (!row || !detailText(row.id) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid gallery item");
    return { id: String(row.id), src: homeImageUrl(row.imageUrl) ?? null, alt: detailText(row.altAr) || "صورة الجامعة" };
  });
}
export function parseDetailFaqs(value: unknown) {
  return detailList<UniversityFaq>(value, (row) => {
    if (row.scope !== "UNIVERSITY") throw Error("Incorrect FAQ scope");
    return { id: String(row.id), question: detailText(row.questionAr) || detailUnavailable("السؤال"), answer: detailText(row.answerAr) || detailUnavailable("الإجابة") };
  });
}
