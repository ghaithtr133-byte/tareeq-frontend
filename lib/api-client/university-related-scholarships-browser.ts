import type { PublicList, Scholarship } from "@/lib/api-client/public-content";
import { getBrowserScholarships } from "@/lib/api-client/public-content-browser";
import type { LiveUniversityParams } from "@/lib/university-directory-data";
import { parseRelatedScholarships, universityScholarshipParams } from "@/lib/university-related-scholarships";

export async function loadBrowserRelatedUniversityScholarships(criteria: LiveUniversityParams, page: number): Promise<PublicList<Scholarship>> {
  const data = parseRelatedScholarships(await getBrowserScholarships(universityScholarshipParams(criteria, page)));
  if (data.pagination.page !== page) throw Error("Unexpected related scholarship page");
  return data;
}
