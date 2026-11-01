import type { Article, Scholarship } from "@/api/public-content";

/** Only resolve the confirmed single association, never a broad country/university query. */
export async function articleRelatedScholarships(article: Article, load: (slug: string) => Promise<Scholarship>): Promise<Scholarship[]> {
  if (!article.scholarshipId || !article.scholarship?.slug || article.scholarship.id !== article.scholarshipId) return [];
  try {
    const scholarship = await load(article.scholarship.slug);
    return scholarship.id === article.scholarshipId && scholarship.status === "PUBLISHED" ? [scholarship] : [];
  } catch { return []; }
}

export function latestOtherArticles(articles: Article[], currentId: string) {
  const seen = new Set([currentId]);
  return articles.filter((article) => {
    if (article.status !== "PUBLISHED" || seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  }).slice(0, 3);
}
