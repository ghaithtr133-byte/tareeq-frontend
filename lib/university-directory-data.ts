import type { Country, PublicList, University, UniversityListParams } from "@/api/public-content";
import type { RouteSearchParams } from "@/lib/public-search-params";
import { homeImageUrl } from "@/lib/homepage-data";

// Supported public query values, confirmed against /universities OpenAPI.
export const directoryStudyLevels = { FOUNDATION: "سنة تحضيرية", DIPLOMA: "دبلوم", BACHELORS: "بكالوريوس", MASTERS: "ماجستير", PHD: "دكتوراه" } as const;
export const directoryLanguages = { ARABIC: "العربية", ENGLISH: "الإنجليزية", FRENCH: "الفرنسية", GERMAN: "الألمانية", TURKISH: "التركية", ROMANIAN: "الرومانية", RUSSIAN: "الروسية", SPANISH: "الإسبانية", ITALIAN: "الإيطالية" } as const;
export const directoryUniversityTypes = { PUBLIC: "حكومية", PRIVATE: "خاصة" } as const;
export function directoryFilterLabel(key: string, value: string) {
  const labels = key === "studyLevel" ? directoryStudyLevels : key === "language" ? directoryLanguages : key === "universityType" ? directoryUniversityTypes : undefined;
  return labels && Object.hasOwn(labels, value) ? labels[value as keyof typeof labels] : value;
}
export type DirectoryUniversity = University & { universityType?: keyof typeof directoryUniversityTypes | null; city?: { nameAr?: string } | null };
export type LiveUniversityParams = UniversityListParams & { major?: string; studyLevel?: keyof typeof directoryStudyLevels; language?: keyof typeof directoryLanguages; city?: string; universityType?: keyof typeof directoryUniversityTypes };
export type DirectoryFilterGroup = { key: string; label: string; options: readonly (readonly [string, string])[]; unavailable?: string };
const slug = (value: unknown) => typeof value === "string" && value.length >= 2 && value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : undefined;
function enumValue<T extends Record<string, string>>(value: unknown, labels: T): keyof T | undefined {
  return typeof value === "string" && Object.hasOwn(labels, value) ? value as keyof T : undefined;
}

export function liveUniversityFilters(raw: RouteSearchParams) {
  // Canonical Backend keys; retain existing Demo bookmark aliases where unambiguous.
  const levelAliases: Record<string, string> = { bachelor: "BACHELORS", master: "MASTERS" };
  const legacyLevel = typeof raw.level === "string" ? levelAliases[raw.level] : undefined;
  return {
    major: slug(raw.major),
    studyLevel: enumValue(raw.studyLevel ?? legacyLevel, directoryStudyLevels),
    language: enumValue(typeof raw.language === "string" ? raw.language.toUpperCase() : undefined, directoryLanguages),
    city: slug(raw.city),
    universityType: enumValue(raw.universityType ?? (typeof raw.type === "string" ? raw.type.toUpperCase() : undefined), directoryUniversityTypes),
  };
}

function validateList(value: unknown) {
  const data = value as PublicList<Record<string, unknown>> | null;
  const p = data?.pagination;
  if (!Array.isArray(data?.items) || !p || ![p.page, p.limit, p.total, p.totalPages].every(Number.isInteger) || p.page < 1 || p.limit < 1 || p.limit > 50 || p.total < 0 || p.totalPages !== Math.ceil(p.total / p.limit) || data.items.length > p.limit || data.items.length > p.total || (p.page <= p.totalPages && !data.items.length)) throw Error("Invalid directory response");
  const ids = new Set<string>(), slugs = new Set<string>();
  for (const item of data.items) {
    if (!item || typeof item.id !== "string" || !item.id.trim() || ids.has(item.id) || !slug(item.slug) || slugs.has(item.slug as string) || typeof item.nameAr !== "string" || !item.nameAr.trim() || (item.status !== undefined && item.status !== "PUBLISHED")) throw Error("Invalid directory record");
    ids.add(item.id); slugs.add(item.slug as string);
  }
  return data;
}

export function parseDirectoryCountries(value: unknown): PublicList<Country> {
  return validateList(value) as unknown as PublicList<Country>;
}

export function parseDirectoryUniversities(value: unknown): PublicList<DirectoryUniversity> {
  const data = validateList(value);
  return { pagination: data.pagination, items: data.items.map((item) => ({
    ...item, nameAr: (item.nameAr as string).trim(),
    cityAr: typeof item.cityAr === "string" ? item.cityAr.trim() : "",
    city: item.city && typeof item.city === "object" && typeof (item.city as { nameAr?: unknown }).nameAr === "string" ? item.city : null,
    overviewAr: typeof item.overviewAr === "string" ? item.overviewAr.trim() : "",
    universityType: enumValue(item.universityType, directoryUniversityTypes) ?? null,
    imageUrl: homeImageUrl(item.imageUrl) ?? null,
    imageAltAr: typeof item.imageAltAr === "string" ? item.imageAltAr.trim() : null,
  })) as DirectoryUniversity[] };
}

export function joinDirectoryCountries(universities: PublicList<DirectoryUniversity>, countries: Country[]): PublicList<DirectoryUniversity> {
  const byId = new Map(countries.map((country) => [country.id, country]));
  return { ...universities, items: universities.items.map((university) => {
    const joined = university.country;
    if (joined && joined.id === university.countryId && slug(joined.slug) && typeof joined.nameAr === "string" && joined.nameAr.trim()) return university;
    const country = byId.get(university.countryId);
    // Public list currently supplies IDs only. Reuse the single bounded lookup;
    // never infer a country from a name, Demo fixture or featured row position.
    return { ...university, country: country ? { id: country.id, slug: country.slug, nameAr: country.nameAr, nameEn: country.nameEn } : undefined };
  }) };
}

export function parseUniversityFacets(value: unknown): DirectoryFilterGroup[] {
  const data = value as Record<string, unknown> | null;
  return [
    { key: "major", label: "التخصص", source: "majors" },
    { key: "studyLevel", label: "المستوى الدراسي", source: "studyLevels", labels: directoryStudyLevels },
    { key: "language", label: "لغة الدراسة", source: "languages", labels: directoryLanguages },
    { key: "city", label: "المدينة", source: "cities" },
    { key: "universityType", label: "نوع الجامعة", source: "universityTypes", labels: directoryUniversityTypes },
  ].map(({ key, label, source, labels }) => {
    const rows = data?.[source];
    if (!Array.isArray(rows)) throw Error("Invalid directory facets");
    const seen = new Set<string>();
    const options = rows.map((row) => {
      if (!row || typeof row.value !== "string" || seen.has(row.value) || !Number.isInteger(row.count) || row.count < 0) throw Error("Invalid facet option");
      const optionLabel = labels ? (Object.hasOwn(labels, row.value) ? labels[row.value as keyof typeof labels] : undefined) : (slug(row.value) && typeof row.nameAr === "string" ? row.nameAr.trim() : undefined);
      if (!optionLabel) throw Error("Invalid facet label");
      seen.add(row.value);
      return [row.value, optionLabel] as const;
    });
    return { key, label, options, unavailable: options.length ? undefined : "لا توجد خيارات منشورة لهذه المعايير حالياً" };
  });
}
