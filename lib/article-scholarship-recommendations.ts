import "server-only";

import { getScholarships } from "@/lib/api-client/public-content";
import { parseArticleScholarships, type ArticleScholarship } from "@/lib/article-detail-live";

const appendUnique = (target: ArticleScholarship[], candidates: ArticleScholarship[]) => {
  const seen = new Set(target.map((item) => item.id));
  for (const candidate of candidates) {
    if (target.length === 3) break;
    if (candidate.status !== "PUBLISHED" || candidate.effectiveApplicationStatus !== "OPEN") continue;
    if (!seen.has(candidate.id)) {
      seen.add(candidate.id);
      target.push(candidate);
    }
  }
};

/** Bounded server-side recommendation sequence; no catalogue scan or N+1 detail calls. */
export async function recommendArticleScholarships(
  manuallyLinked: unknown,
  countrySlug: string | null | undefined,
): Promise<{ scholarships: ArticleScholarship[]; failed: boolean }> {
  const scholarships: ArticleScholarship[] = [];
  appendUnique(scholarships, parseArticleScholarships(manuallyLinked));
  let failed = false;
  const fill = async (params: { country?: string; featured?: "true" }) => {
    if (scholarships.length === 3) return;
    try {
      const data = await getScholarships({
        ...params,
        applicationStatus: "OPEN",
        limit: 3 - scholarships.length,
        excludeIds: scholarships.map((item) => item.id).join(",") || undefined,
      });
      appendUnique(scholarships, parseArticleScholarships(data.items));
    } catch {
      failed = true;
    }
  };

  if (countrySlug) await fill({ country: countrySlug });
  await fill({ featured: "true" });
  return { scholarships, failed };
}
