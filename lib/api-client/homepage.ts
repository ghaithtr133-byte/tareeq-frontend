import "server-only";
import { cache } from "react";
import { serverApiClient } from "@/lib/api-client/server-client";
import { homeError, homeQueries, parseHomeList, type HomeEntities, type HomeResult, type HomeSection } from "@/lib/homepage-data";

export type PublishedContentStatistics = {
  publishedCountries: number;
  publishedUniversities: number;
  publishedScholarships: number;
  publishedUniversityPrograms: number;
};

function isPublishedCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/** Reads only server-calculated catalog totals; it never derives them from a paginated collection. */
export function parsePublishedContentStatistics(value: unknown): PublishedContentStatistics | undefined {
  const response = value && typeof value === "object" ? value as { success?: unknown; data?: unknown } : undefined;
  const data = response?.data && typeof response.data === "object" ? response.data as { publishedContent?: unknown } : undefined;
  const publishedContent = data?.publishedContent && typeof data.publishedContent === "object" ? data.publishedContent as Record<string, unknown> : undefined;
  if (response?.success !== true || !publishedContent) return undefined;

  const { publishedCountries, publishedUniversities, publishedScholarships, publishedUniversityPrograms } = publishedContent;
  if (!isPublishedCount(publishedCountries) || !isPublishedCount(publishedUniversities) || !isPublishedCount(publishedScholarships) || !isPublishedCount(publishedUniversityPrograms)) return undefined;
  return { publishedCountries, publishedUniversities, publishedScholarships, publishedUniversityPrograms };
}

export async function loadPublishedContentStatistics(demo: boolean): Promise<PublishedContentStatistics | undefined> {
  if (demo) return undefined;
  try {
    const response = await serverApiClient.get("/statistics", { timeout: 12_000 });
    return parsePublishedContentStatistics(response.data);
  } catch {
    return undefined;
  }
}

async function demoCollection(section: HomeSection) {
  if (section === "faqs") {
    const { demoHomeQuestions } = await import("@/lib/mocks/home-faq");
    return { items: demoHomeQuestions.map((item, index) => ({ id: `demo-faq-${index}`, scope: "GLOBAL", questionAr: item.question, answerAr: item.answer })), pagination: { total: demoHomeQuestions.length } };
  }
  const api = await import("@/lib/api-client/public-content");
  switch (section) {
    case "countries": return api.getCountries(homeQueries.countries);
    case "universities": return api.getUniversities(homeQueries.universities);
    case "scholarships": return api.getScholarships(homeQueries.scholarships);
    case "services": return api.getServices(homeQueries.services);
    case "articles": return api.getArticles(homeQueries.articles);
  }
}

async function loadHomeSectionUncached<K extends HomeSection>(section: K, demo: boolean): Promise<HomeResult<HomeEntities[K]>> {
  try {
    if (demo) return parseHomeList(section, await demoCollection(section));
    const response = await serverApiClient.get(`/${section}`, { params: homeQueries[section], timeout: 12_000 });
    if (response.data?.success !== true) throw new Error("Invalid Homepage envelope.");
    return parseHomeList(section, response.data.data);
  } catch { return homeError<HomeEntities[K]>(); }
}

/** Axios requests are not automatically memoized; share this exact section request within one SSR render. */
export const loadHomeSection = cache(loadHomeSectionUncached);
