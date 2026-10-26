export type ArticleTickerItem = {
  id: string;
  slug: string;
  titleAr: string;
  publishedAt: string | null;
  coverImageUrl?: string | null;
  coverImageAltAr?: string | null;
};

export type ArticleTickerPage = {
  items: ArticleTickerItem[];
  page: number;
  totalPages: number;
};

export type ArticleTickerRailItem = ArticleTickerItem & {
  copy: 0 | 1;
};

type TickerArticleSource = ArticleTickerItem & { status: string };

/** Keep the ticker limited to records the public API marks as published. */
export function toArticleTickerItems(articles: readonly TickerArticleSource[]): ArticleTickerItem[] {
  return articles
    .filter((article) => article.status === "PUBLISHED" && article.slug && article.titleAr)
    .map(({ id, slug, titleAr, publishedAt, coverImageUrl, coverImageAltAr }) => ({ id, slug, titleAr, publishedAt, coverImageUrl, coverImageAltAr }));
}

/** Later pagination responses can overlap without repeating an announcement or link. */
export function mergeArticleTickerItems(
  current: readonly ArticleTickerItem[],
  incoming: readonly ArticleTickerItem[],
): ArticleTickerItem[] {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !seen.has(item.id))];
}

/**
 * The second sequence makes the CSS marquee seamless. Keep its identity
 * explicit so it is presentational only and cannot replace a real link.
 */
export function createArticleTickerRail(
  items: readonly ArticleTickerItem[],
): ArticleTickerRailItem[] {
  return [0, 1].flatMap((copy) =>
    items.map((item) => ({ ...item, copy: copy as 0 | 1 })),
  );
}

export function tickerPage(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 10_000 ? parsed : 1;
}
