import "server-only";
import { cache } from "react";
import { getArticle, getCountries, getUniversities } from "@/api/public-content";
import type { Article, Country, University } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { parseArticleBody, parseArticleScholarships, parsePublishedArticle, validArticleSlug } from "@/lib/article-detail-live";
import { scholarshipLookup } from "@/lib/scholarship-directory-live";
import { homeCardText } from "@/lib/homepage-card-content";
import { publicDemoContent } from "@/lib/mocks/public-demo-content";

export const getPublishedArticleDetail = cache(async (slug: string) => {
  if (!validArticleSlug(slug)) throw new ApiError(404, "Invalid article slug");
  const raw = await getArticle(slug);
  if (raw?.status !== undefined && raw.status !== "PUBLISHED") throw new ApiError(404, "Unpublished article");
  if (raw && raw.slug !== slug) throw new ApiError(404, "Article identity mismatch");
  if (isPublicDemoMode()) return { article: raw, bodyFailed: false, summaryForMetadata: raw.summaryAr };
  const article = parsePublishedArticle(raw, slug);
  const summaryForMetadata = article.summaryAr || article.titleAr;
  const same = publicDemoContent.articles.find((item) => item.slug === raw.slug && item.titleAr === raw.titleAr);
  article.summaryAr = homeCardText(article.summaryAr, "ملخص المقال", same?.summaryAr);
  return { article, summaryForMetadata, bodyFailed: parseArticleBody(raw.bodyAr).failed, relatedScholarships: (raw as Article & { relatedScholarships?: unknown }).relatedScholarships };
});

export async function articleEntityRelations(article: Article) {
  // Two bounded shared lookups at most, only for real IDs; never scan the full catalog or infer from keywords.
  const [country, university] = await Promise.allSettled([
    article.countryId ? getCountries({ limit: 50, sort: "manual" }).then((raw) => scholarshipLookup<Country>(raw).items.find((row) => row.id === article.countryId) ?? null) : Promise.resolve(null),
    article.universityId ? getUniversities({ limit: 50, sort: "name" }).then((raw) => scholarshipLookup<University>(raw).items.find((row) => row.id === article.universityId) ?? null) : Promise.resolve(null),
  ]);
  return { country: country.status === "fulfilled" ? country.value : null, university: university.status === "fulfilled" ? university.value : null,
    failed: country.status === "rejected" || university.status === "rejected" };
}

export async function articleScholarships(value: unknown) {
  return parseArticleScholarships(value);
}
