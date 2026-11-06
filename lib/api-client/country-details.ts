import "server-only";
import { cache } from "react";
import { getCountry, type Country } from "@/lib/api-client/public-content";
import { serverApiClient } from "@/lib/api-client/server-client";
import { ApiError } from "@/lib/api-client/error";
import { homeImageUrl } from "@/lib/homepage-data";

export const countrySlugIsValid = (slug: string) => slug.length >= 2 && slug.length <= 120 && /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug);

/** Validate only the published detail projection, not the larger Admin entity. */
export const getPublishedCountry = cache(async (slug: string): Promise<Country> => {
  if (!countrySlugIsValid(slug)) throw new ApiError(404, "Unknown country");
  const value = await getCountry(slug) as unknown;
  if (!value || typeof value !== "object") throw new Error("Invalid country response");
  const item = value as Record<string, unknown>;
  const text = (key: string) => typeof item[key] === "string" ? item[key].trim() : "";
  if (item.status !== undefined && item.status !== "PUBLISHED") throw new ApiError(404, "Unpublished country");
  if (!text("id") || !text("nameAr") || !countrySlugIsValid(text("slug"))) throw new Error("Invalid country identity");
  return { ...item, id: text("id"), nameAr: text("nameAr"), slug: text("slug"), introductionAr: text("introductionAr"), detailsAr: text("detailsAr"), imageUrl: homeImageUrl(item.imageUrl) ?? null, imageAltAr: text("imageAltAr") || null, seoTitleAr: text("seoTitleAr") || null, seoDescriptionAr: text("seoDescriptionAr") || null, publishedAt: typeof item.publishedAt === "string" && Number.isFinite(Date.parse(item.publishedAt)) ? item.publishedAt : null } as Country;
});

export type CountryFaqResult = { kind: "success" | "empty" | "error"; items: { question: string; answer: string }[] };

export async function getCountryFaqs(country: Country): Promise<CountryFaqResult> {
  try {
    // Actual supported association endpoint. Never substitute GLOBAL FAQs.
    const response = await serverApiClient.get(`/countries/${encodeURIComponent(country.slug)}/faqs`, { params: { limit: 6 }, timeout: 12_000 });
    const data = response.data?.data;
    if (response.data?.success !== true || !Array.isArray(data?.items) || !Number.isInteger(data?.pagination?.total) || data.pagination.total < data.items.length || (data.pagination.total > 0 && !data.items.length)) throw new Error("Invalid country FAQ response");
    const seen = new Set<string>();
    const items = data.items.map((item: Record<string, unknown>) => {
      if (!item || typeof item.id !== "string" || seen.has(item.id) || item.scope !== "COUNTRY" || typeof item.questionAr !== "string" || !item.questionAr.trim() || typeof item.answerAr !== "string" || !item.answerAr.trim() || (item.countryId !== undefined && item.countryId !== country.id) || (item.status !== undefined && item.status !== "PUBLISHED")) throw new Error("Invalid country FAQ association");
      seen.add(item.id);
      return { question: item.questionAr.trim(), answer: item.answerAr.trim() };
    });
    return { kind: items.length ? "success" : "empty", items };
  } catch { return { kind: "error", items: [] }; }
}
