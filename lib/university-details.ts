import type { PublicList, Scholarship } from "@/api/public-content";

export const universityTabs = [
  { id: "overview", label: "نظرة عامة" },
  { id: "programs", label: "التخصصات والرسوم" },
  { id: "admissions", label: "شروط القبول" },
  { id: "gallery", label: "صور الجامعة" },
] as const;
export type UniversityTab = typeof universityTabs[number]["id"];
export function universityTab(value: string | null): UniversityTab {
  return universityTabs.find((tab) => tab.id === value)?.id ?? "overview";
}

// Presentation model, NOT a Backend schema. The Live adapter maps the confirmed public contract.
export type UniversityProgram = {
  id: string; name: string; level: string; faculty: string | null;
  language: string | null; duration: string | null;
  tuition: { amount: number; currency: string; period?: string; academicYear?: string } | null;
  tuitionHistory?: NonNullable<UniversityProgram["tuition"]>[];
};
export type UniversityDetailContent = {
  programs: UniversityProgram[];
  admissions: string[];
  gallery: { src: string; alt: string; caption?: string }[];
  faqs: { question: string; answer: string }[];
  logo: string | null;
};
export function emptyUniversityContent(): UniversityDetailContent {
  return { programs: [], admissions: [], gallery: [], faqs: [], logo: null };
}
export type ProgramFilters = { search: string; level: string; language: string; faculty: string };
export function filterUniversityPrograms(programs: UniversityProgram[], filters: ProgramFilters) {
  const search = filters.search.trim().toLocaleLowerCase();
  return programs.filter((program) => (!search || program.name.toLocaleLowerCase().includes(search))
    && (!filters.level || program.level === filters.level)
    && (!filters.language || program.language === filters.language)
    && (!filters.faculty || program.faculty === filters.faculty));
}
export function programTuition(tuition: UniversityProgram["tuition"]) {
  if (!tuition) return "غير معلنة";
  return [new Intl.NumberFormat("ar", { maximumFractionDigits: 2 }).format(tuition.amount), tuition.currency,
    tuition.period, tuition.academicYear].filter(Boolean).join(" · ");
}
export const RELATED_SCHOLARSHIP_BATCH = 3;
export function nextScholarshipPage(page: PublicList<Scholarship>) {
  return page.pagination.page < page.pagination.totalPages ? page.pagination.page + 1 : undefined;
}
export function uniqueUniversityScholarships(pages: PublicList<Scholarship>[], id: string, slug: string) {
  const seen = new Set<string>();
  return pages.flatMap((page) => page.items).filter((item) => {
    if ((item.status !== undefined && item.status !== "PUBLISHED") || item.universityId !== id || (item.university && item.university.slug !== slug) || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
