import { ArticlesTicker } from "@/components/layout/articles-ticker";
import { getArticleTickerPage } from "@/lib/article-ticker-server";

/** Keep the existing request/failure policy, without blocking the whole public shell. */
export async function AsyncArticlesTicker() {
  const page = await getArticleTickerPage().catch(() => undefined);
  return page?.items.length ? <ArticlesTicker initialPage={page} /> : null;
}
