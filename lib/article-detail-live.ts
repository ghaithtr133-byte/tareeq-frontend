import type { Article, ArticleBlock, Scholarship } from "@/lib/api-client/public-content";
import { articleDirectoryDate } from "@/lib/article-directory-live";
import { articleImageSource } from "@/lib/article-directory";
import { homeCardText } from "@/lib/homepage-card-content";

export const validArticleSlug = (value: unknown): value is string => typeof value === "string" && value.length >= 2 && value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const blockTypes = new Set(["paragraph", "heading2", "heading3", "bulleted-list", "numbered-list", "quote"]);
export type ArticleScholarship = Pick<Scholarship, "id" | "slug" | "titleAr" | "status" | "country"> & { imageUrl?: string | null; effectiveApplicationStatus?: "OPEN" | "CLOSED" | null; applicationStatus?: "OPEN" | "CLOSED" };
export function parseArticleBody(value: unknown): { blocks: ArticleBlock[]; failed: boolean } {
  if (value == null) return { blocks: [], failed: false };
  if (!Array.isArray(value) || value.some((block) => !block || !blockTypes.has(block.type) || typeof block.text !== "string" || !block.text.trim() || block.text.length > 10000 || Object.keys(block).some((key) => key !== "type" && key !== "text"))) return { blocks: [], failed: true };
  return { blocks: value, failed: false };
}
export function parsePublishedArticle(value: unknown, slug?: string): Article {
  const row = value as Article;
  if (!row || !text(row.id) || !validArticleSlug(row.slug) || (slug && row.slug !== slug) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid published article");
  return { ...row, status: "PUBLISHED", titleAr: homeCardText(text(row.titleAr), "عنوان المقال"), summaryAr: text(row.summaryAr),
    bodyAr: parseArticleBody(row.bodyAr).blocks, publishedAt: articleDirectoryDate(row.publishedAt),
    coverImageUrl: articleImageSource(text(row.coverImageUrl) || null), coverImageAltAr: text(row.coverImageAltAr) || null,
    seoTitleAr: text(row.seoTitleAr) || null, seoDescriptionAr: text(row.seoDescriptionAr) || null,
    countryId: text(row.countryId) || null, universityId: text(row.universityId) || null,
    // Expanded country/university previews are not part of the Article detail contract.
    country: null, university: null, scholarship: null };
}
export function parseArticleScholarships(value: unknown): ArticleScholarship[] {
  if (!Array.isArray(value)) throw Error("Invalid article scholarships");
  const seen = new Set<string>();
  return value.map((row) => {
    if (!row || !text(row.id) || seen.has(row.id) || !validArticleSlug(row.slug) || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid related scholarship");
    seen.add(row.id);
    const country = row.country;
    if (country != null && (!text(country.id) || !validArticleSlug(country.slug) || !text(country.nameAr))) throw Error("Invalid related country");
    return { id: row.id, slug: row.slug, titleAr: homeCardText(text(row.titleAr), "اسم المنحة"), status: "PUBLISHED", country: country ?? null,
      imageUrl: articleImageSource(text(row.imageUrl) || null), effectiveApplicationStatus: row.effectiveApplicationStatus === "OPEN" || row.effectiveApplicationStatus === "CLOSED" ? row.effectiveApplicationStatus : null } as ArticleScholarship;
  });
}
export function parseLatestArticles(value: unknown, currentId: string, currentSlug: string): Article[] {
  const list = value as { items: unknown[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
  const p = list?.pagination;
  if (!Array.isArray(list?.items) || !p || p.page !== 1 || p.limit !== 4 || !Number.isSafeInteger(p.total) || p.total < 0 || p.totalPages !== Math.ceil(p.total / 4) || list.items.length > Math.min(4, p.total) || (p.total > 0 && !list.items.length)) throw Error("Invalid latest articles page");
  const seen = new Set<string>(), slugs = new Set<string>();
  return list.items.map((row) => {
    const article = parsePublishedArticle(row);
    if (seen.has(article.id) || slugs.has(article.slug)) throw Error("Duplicate latest article");
    seen.add(article.id); slugs.add(article.slug); return article;
  }).filter((row) => row.id !== currentId && row.slug !== currentSlug).slice(0, 3);
}
