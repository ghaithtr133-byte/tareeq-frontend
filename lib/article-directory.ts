import type { Article, ArticleListParams } from "@/api/public-content";
import { articlesParams, type RouteSearchParams } from "@/lib/public-search-params";

export type ArticleFilterValues = { search: string; country: string; featured: string };

export function directoryArticleParams(raw: RouteSearchParams): ArticleListParams {
  const parsed = articlesParams(raw);
  return { ...parsed, page: parsed.page ?? 1, limit: 12, search: parsed.search?.slice(0, 200), featured: parsed.featured === "true" ? "true" : undefined, sort: "newest" };
}

export function articleFilterValues(params: ArticleListParams): ArticleFilterValues {
  return { search: params.search ?? "", country: params.country ?? "", featured: params.featured === "true" ? "true" : "" };
}

export function articleDirectoryHref(values: ArticleFilterValues, page = 1) {
  const params = directoryArticleParams(values);
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.country) query.set("country", params.country);
  if (params.featured) query.set("featured", params.featured);
  if (Number.isInteger(page) && page > 1) query.set("page", String(page));
  return `/articles${query.size ? `?${query}` : ""}`;
}

/** Editorial placement is confined to this API page; no second dataset or duplicates. */
export function editorialArticles(articles: Article[]) {
  const candidates = articles.filter((article) => article.featured).slice(0, 2);
  const featured = candidates.length === 2 ? candidates : [];
  const selected = new Set(featured.map((article) => article.id));
  return { featured, regular: articles.filter((article) => !selected.has(article.id)) };
}

export function articlePublicationDate(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("ar", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function articleImageSource(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}

export function articlePageNumbers(page: number, total: number): (number | string)[] {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  if (page <= 2) pages.add(3);
  if (page >= total - 1) pages.add(total - 2);
  const sorted = [...pages].filter((item) => item > 0 && item <= total).sort((a, b) => a - b);
  return sorted.flatMap((item, index) => index && item - sorted[index - 1] > 1 ? [`gap-${item}`, item] : [item]);
}
