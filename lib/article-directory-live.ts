import type { Article, Country, PublicList } from "@/api/public-content";
import { homeCardText } from "@/lib/homepage-card-content";
import { articleImageSource } from "@/lib/article-directory";

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
function publishedList<T>(value: unknown, map: (row: Record<string, unknown>) => T): PublicList<T> {
  const list = value as PublicList<Record<string, unknown>>;
  const p = list?.pagination;
  if (!Array.isArray(list?.items) || !p || ![p.page, p.limit, p.total, p.totalPages].every(Number.isSafeInteger) || p.page < 1 || p.limit < 1 || p.limit > 50 || p.total < 0 || p.totalPages !== Math.ceil(p.total / p.limit) || list.items.length > Math.min(p.total, p.limit) || (p.page <= p.totalPages && !list.items.length)) throw Error("Invalid article collection");
  const ids = new Set<string>(), slugs = new Set<string>();
  return { pagination: p, items: list.items.map((row) => {
    if (!row || !text(row.id) || ids.has(String(row.id)) || typeof row.slug !== "string" || row.slug.length < 2 || row.slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) || slugs.has(row.slug) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid published article");
    ids.add(String(row.id)); slugs.add(row.slug); return map(row);
  }) };
}
export function articleDirectoryDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? value : null;
}
export function parseArticleDirectory(value: unknown, page: number, approved: Article[] = []): PublicList<Article> {
  const data = publishedList<Article>(value, (row) => {
    const original = approved.find((item) => item.slug === row.slug && item.titleAr === text(row.titleAr));
    return { ...row, titleAr: homeCardText(text(row.titleAr), "عنوان المقال"), summaryAr: homeCardText(text(row.summaryAr), "ملخص المقال", original?.summaryAr),
      publishedAt: articleDirectoryDate(row.publishedAt), featured: row.featured === true,
      coverImageUrl: articleImageSource(text(row.coverImageUrl) || null), coverImageAltAr: text(row.coverImageAltAr) || null,
    } as Article;
  });
  if (data.pagination.page !== page || data.pagination.limit !== 12) throw Error("Invalid article page");
  return data;
}
export function parseArticleCountries(value: unknown): PublicList<Country> {
  const data = publishedList<Country>(value, (row) => { if (!text(row.nameAr)) throw Error("Invalid country label"); return row as Country; });
  if (data.pagination.page !== 1 || data.pagination.limit !== 50) throw Error("Invalid country lookup");
  return data;
}
