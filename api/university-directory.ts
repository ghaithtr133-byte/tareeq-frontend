import "server-only";
import { serverApiClient } from "@/api/server-client";
import { parseUniversityFacets, type LiveUniversityParams } from "@/lib/university-directory-data";

export async function getUniversityFilterOptions(params: LiveUniversityParams) {
  const { search, country, featured, major, studyLevel, language, city, universityType } = params;
  const response = await serverApiClient.get("/universities/filter-options", { params: { search, country, featured, major, studyLevel, language, city, universityType }, timeout: 12_000 });
  if (response.data?.success !== true) throw Error("Invalid filter-options response");
  return parseUniversityFacets(response.data.data);
}
