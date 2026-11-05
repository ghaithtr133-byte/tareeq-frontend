import type { Article } from "@/api/public-content";

export function latestOtherArticles(articles: Article[], currentId: string) {
  const seen = new Set([currentId]);
  return articles.filter((article) => {
    if (article.status !== "PUBLISHED" || seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  }).slice(0, 3);
}
