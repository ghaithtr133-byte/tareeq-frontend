import type { Scholarship } from "@/api/public-content";
import { homeImageUrl } from "@/lib/homepage-data";
import { directoryDeadline, scholarshipUnavailable, type DirectoryLiveScholarship } from "@/lib/scholarship-directory-live";

export type ScholarshipDetailRecord = DirectoryLiveScholarship & { relationLookupFailed?: boolean };

export const scholarshipDetailSlug = (value: unknown): value is string => typeof value === "string" && value.length >= 2 && value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

/** A public information source is not an application form. Reject administrative/internal destinations. */
export function scholarshipDetailSource(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const path = decodeURIComponent(url.pathname);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || /(^|\.)admin(\.|$)/i.test(url.hostname) || /\/(admin|administrator|wp-admin)(\/|$)/i.test(path) || ["localhost", "127.0.0.1", "[::1]", "api.tareeq-academy.com"].includes(url.hostname.toLowerCase())) return null;
    return url.href;
  } catch { return null; }
}

export function parseScholarshipDetail(value: unknown, requestedSlug: string): DirectoryLiveScholarship {
  const row = value as Scholarship & { imageUrl?: unknown; imageAltAr?: unknown };
  if (!row || !text(row.id) || row.slug !== requestedSlug) throw Error("Invalid scholarship identity");
  if (row.status !== undefined && row.status !== "PUBLISHED") throw Error("Unpublished scholarship");
  return { ...row,
    // The documented public endpoint guarantees publication while omitting status in its projection.
    // Explicit unpublished data is rejected by the server adapter before this normalization.
    status: "PUBLISHED", titleAr: text(row.titleAr) || scholarshipUnavailable("اسم المنحة"), titleEn: text(row.titleEn) || null,
    descriptionAr: text(row.descriptionAr), requirementsAr: text(row.requirementsAr), studyLevel: text(row.studyLevel), fundingType: text(row.fundingType),
    countryId: text(row.countryId) || null, universityId: text(row.universityId) || null,
    imageUrl: homeImageUrl(row.imageUrl) ?? null, imageAltAr: text(row.imageAltAr) || null,
    verifiedDeadline: directoryDeadline(row.verifiedDeadline), officialSourceUrl: scholarshipDetailSource(row.officialSourceUrl),
    seoTitleAr: text(row.seoTitleAr) || null, seoDescriptionAr: text(row.seoDescriptionAr) || null, featured: row.featured === true,
  };
}

// Existing design slots, not assumed API fields. No general description is mined for verified benefits or documents.
export const unavailableScholarshipBenefits = ["تغطية الرسوم الدراسية", "الدعم المالي", "المزايا الأكاديمية", "المزايا الإضافية"].map(scholarshipUnavailable);
export const unavailableScholarshipRequirements = ["متطلبات الأهلية", "الوثائق المطلوبة", "المتطلبات الإضافية", "متطلبات اللغة"].map(scholarshipUnavailable);
export const unavailableScholarshipSteps = ["خطوة التقديم الأولى", "خطوة التقديم الثانية", "خطوة التقديم الثالثة", "خطوة التقديم الرابعة"].map(scholarshipUnavailable);
