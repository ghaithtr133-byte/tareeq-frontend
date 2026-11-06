import "server-only";
import { serverApiClient } from "@/lib/api-client/server-client";
import { homeError, homeQueries, parseHomeList, type HomeEntities, type HomeResult, type HomeSection } from "@/lib/homepage-data";

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

export async function loadHomeSection<K extends HomeSection>(section: K, demo: boolean): Promise<HomeResult<HomeEntities[K]>> {
  try {
    if (demo) return parseHomeList(section, await demoCollection(section));
    const response = await serverApiClient.get(`/${section}`, { params: homeQueries[section], timeout: 12_000 });
    if (response.data?.success !== true) throw new Error("Invalid Homepage envelope.");
    return parseHomeList(section, response.data.data);
  } catch { return homeError<HomeEntities[K]>(); }
}
