import "server-only";

import { getArticles } from "@/api/public-content";
import { toArticleTickerItems, type ArticleTickerPage } from "@/lib/article-ticker";

export const ARTICLE_TICKER_PAGE_SIZE = 4;

/**
 * Reads a compact, newest-first page through the existing mode-aware API.
 * Demo and Live selection stays entirely within api/public-content.ts.
 */
export async function getArticleTickerPage(page = 1): Promise<ArticleTickerPage> {
  const result = await getArticles({ page, limit: ARTICLE_TICKER_PAGE_SIZE, sort: "newest" });

  return {
    items: toArticleTickerItems(result.items),
    page: result.pagination.page,
    totalPages: result.pagination.totalPages,
  };
}
