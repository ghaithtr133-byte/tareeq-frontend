import "server-only";
import { cache } from "react";
import { getScholarship, getCountries, getUniversities, type Country, type University } from "@/lib/api-client/public-content";
import { ApiError } from "@/lib/api-client/error";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { parseScholarshipDetail, scholarshipDetailSlug } from "@/lib/scholarship-detail-live";
import { joinScholarshipDirectory, scholarshipLookup } from "@/lib/scholarship-directory-live";

export const getPublishedScholarshipDetail = cache(async (slug: string) => {
  if (!scholarshipDetailSlug(slug)) throw new ApiError(404, "Invalid scholarship slug");
  const raw = await getScholarship(slug);
  if (raw?.status !== undefined && raw.status !== "PUBLISHED") throw new ApiError(404, "Unpublished scholarship");
  if (isPublicDemoMode()) return raw;
  const item = parseScholarshipDetail(raw, slug);
  const hasRelation = (row: { id: string; slug: string; nameAr: string } | null | undefined, id: string | null) => row && row.id === id && scholarshipDetailSlug(row.slug) && typeof row.nameAr === "string" && row.nameAr.trim();
  // At most one bounded lookup per missing relationship; never a request per benefit/card or a guessed university.
  const [countries, universities] = await Promise.allSettled([
    item.countryId && !hasRelation(item.country, item.countryId) ? getCountries({ limit: 50, sort: "manual" }).then(scholarshipLookup<Country>) : Promise.resolve(null),
    item.universityId && !hasRelation(item.university, item.universityId) ? getUniversities({ limit: 50, sort: "name" }).then(scholarshipLookup<University>) : Promise.resolve(null),
  ]);
  return { ...joinScholarshipDirectory([item], countries.status === "fulfilled" ? countries.value?.items ?? [] : [], universities.status === "fulfilled" ? universities.value?.items ?? [] : [])[0],
    relationLookupFailed: countries.status === "rejected" || universities.status === "rejected" };
});
