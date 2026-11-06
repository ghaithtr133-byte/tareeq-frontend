import { browserApiClient } from "@/api/client";
import type { LiveUniversityParams } from "@/lib/university-directory-data";
import { parseUniversityFacets } from "@/lib/university-directory-data";

export async function getBrowserUniversityFilterOptions(params: LiveUniversityParams) {
  const { search, country, featured, major, studyLevel, language, city, universityType } = params;
  const response = await browserApiClient.get("/universities/filter-options", { params: { search, country, featured, major, studyLevel, language, city, universityType }, withCredentials: false, timeout: 12000 });
  if (response.data?.success !== true) throw Error("Invalid filter-options response");
  return parseUniversityFacets(response.data.data);
}
