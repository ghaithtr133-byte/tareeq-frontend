import type { UniversityListParams } from "@/api/public-content";
import { publicDemoContent } from "@/lib/mocks/public-demo-content";

// These illustrative program records belong only to the demo directory.
const programs = [
  { universityId: "demo-university-bucharest", major: "medicine", level: "bachelor", language: "english" },
  { universityId: "demo-university-bucharest", major: "business", level: "master", language: "romanian" },
  { universityId: "demo-university-polytechnic-bucharest", major: "engineering", level: "bachelor", language: "romanian" },
  { universityId: "demo-university-istanbul", major: "medicine", level: "bachelor", language: "turkish" },
  { universityId: "demo-university-middle-east-technical", major: "engineering", level: "master", language: "english" },
  { universityId: "demo-university-warsaw", major: "business", level: "master", language: "english" },
  { universityId: "demo-university-budapest", major: "engineering", level: "bachelor", language: "english" },
];

export const demoFilterOptions = {
  major: [["medicine", "الطب"], ["engineering", "الهندسة"], ["business", "إدارة الأعمال"]],
  level: [["bachelor", "بكالوريوس"], ["master", "ماجستير"]],
  language: [["english", "الإنجليزية"], ["turkish", "التركية"], ["romanian", "الرومانية"]],
  city: [["bucharest", "بوخارست"], ["istanbul", "إسطنبول"], ["ankara", "أنقرة"], ["warsaw", "وارسو"], ["budapest", "بودابست"]],
  type: [["public", "حكومية"], ["private", "خاصة"]],
} as const;

export type DemoDirectoryFilters = { major?: string; level?: string; language?: string; city?: string; type?: string };
const cities: Record<string, string> = { bucharest: "بوخارست", istanbul: "إسطنبول", ankara: "أنقرة", warsaw: "وارسو", budapest: "بودابست" };

export function getDemoDirectory(
  params: UniversityListParams,
  filters: DemoDirectoryFilters,
  includeRelatedScholarships = false,
) {
  const search = params.search?.toLocaleLowerCase();
  let matching = publicDemoContent.universities.filter((item) => {
    if (search && ![item.nameAr, item.nameEn, item.officialName, item.overviewAr].some((text) => text?.toLocaleLowerCase().includes(search))) return false;
    if (params.country && item.country?.slug !== params.country) return false;
    if (params.featured && item.featured !== (params.featured === "true")) return false;
    if (filters.city && item.cityAr !== cities[filters.city]) return false;
    // The demo set currently contains only public institutions.
    if (filters.type && filters.type !== "public") return false;
    if (filters.major || filters.level || filters.language) {
      return programs.some((program) => program.universityId === item.id && (!filters.major || program.major === filters.major) && (!filters.level || program.level === filters.level) && (!filters.language || program.language === filters.language));
    }
    return true;
  });
  matching = [...matching].sort(params.sort === "name" ? (a, b) => a.nameAr.localeCompare(b.nameAr, "ar") : (a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  const page = params.page ?? 1;
  const limit = params.limit ?? 6;
  const matchingUniversityIds = includeRelatedScholarships
    ? new Set(matching.map((item) => item.id))
    : null;
  return {
    matchingUniversities: matching,
    universities: { items: matching.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: matching.length, totalPages: Math.ceil(matching.length / limit) } },
    scholarships: includeRelatedScholarships
      ? publicDemoContent.scholarships.filter((item) =>
          item.universityId && matchingUniversityIds?.has(item.universityId),
        )
      : [],
  };
}
