import "server-only";

import { cache } from "react";
import { getCountries, getUniversity } from "@/lib/api-client/public-content";
import { ApiError } from "@/lib/api-client/error";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { detailSlug, parseDetailUniversity } from "@/lib/university-detail-live";

/** Same established detail client in both modes; cache only within the current render request. */
export const getUniversityDetail = cache(async (slug: string) => {
  if (!detailSlug(slug)) throw new ApiError(404, "University not found");
  const raw = await getUniversity(slug);
  if (isPublicDemoMode()) return raw;
  if (raw?.status !== undefined && raw.status !== "PUBLISHED") throw new ApiError(404, "University not published");
  const university = parseDetailUniversity(raw, slug);
  if (!university.country && university.countryId) {
    // Detail currently exposes countryId only. One bounded shared lookup, never N+1 or a guessed relation.
    try {
      const countries = await getCountries({ limit: 50, sort: "manual" });
      const country = countries.items.find((item) => item.id === university.countryId && (item.status === undefined || item.status === "PUBLISHED"));
      if (country && detailSlug(country.slug) && typeof country.nameAr === "string" && country.nameAr.trim()) university.country = { id: country.id, slug: country.slug, nameAr: country.nameAr, nameEn: country.nameEn };
    } catch { /* A country lookup failure must not take down the university; preserve its labeled metadata slot. */ }
  }
  return university;
});
