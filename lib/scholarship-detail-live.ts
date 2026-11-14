import type { PublicList, Scholarship } from "@/lib/api-client/public-content";
import { homeImageUrl } from "@/lib/homepage-data";
import { directoryDeadline, scholarshipUnavailable, type DirectoryLiveScholarship } from "@/lib/scholarship-directory-live";

export type ScholarshipDetailRecord = DirectoryLiveScholarship & {
  benefitsAr?: string[];
  requirementItemsAr?: string[];
  applicationStepsAr?: string[];
  relationLookupFailed?: boolean;
};
export type ScholarshipFaq = { id: string; question: string; answer: string; displayOrder: number };
export type ScholarshipFaqResult = { ok: true; data: PublicList<ScholarshipFaq> } | { ok: false };

export const scholarshipDetailSlug = (value: unknown): value is string => typeof value === "string" && value.length >= 2 && value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const textList = (value: unknown) => Array.isArray(value) ? [...new Set(value.map(text).filter(Boolean))] : [];

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

export function parseScholarshipDetail(value: unknown, requestedSlug: string): ScholarshipDetailRecord {
  const row = value as Scholarship & { imageUrl?: unknown; imageAltAr?: unknown; benefitsAr?: unknown; requirementItemsAr?: unknown; applicationStepsAr?: unknown };
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
    benefitsAr: textList(row.benefitsAr), requirementItemsAr: textList(row.requirementItemsAr), applicationStepsAr: textList(row.applicationStepsAr),
    seoTitleAr: text(row.seoTitleAr) || null, seoDescriptionAr: text(row.seoDescriptionAr) || null, featured: row.featured === true,
  } as ScholarshipDetailRecord;
}

export function parseScholarshipFaqs(value: unknown): PublicList<ScholarshipFaq> {
  const data = value as PublicList<Record<string, unknown>>;
  const p = data?.pagination;
  if (!Array.isArray(data?.items) || !p || ![p.page, p.limit, p.total, p.totalPages].every(Number.isSafeInteger) || p.page < 1 || p.limit < 1 || p.limit > 100 || p.total < 0 || p.totalPages !== Math.ceil(p.total / p.limit) || data.items.length > Math.min(p.limit, p.total) || (p.page <= p.totalPages && !data.items.length)) throw Error("Invalid scholarship FAQ collection");
  const seen = new Set<string>();
  const items = data.items.map((row) => {
    const displayOrder = row?.displayOrder;
    if (!row || !text(row.id) || seen.has(String(row.id)) || row.scope !== "SCHOLARSHIP" || typeof displayOrder !== "number" || !Number.isSafeInteger(displayOrder) || displayOrder < 0 || (row.status !== undefined && row.status !== "PUBLISHED")) throw Error("Invalid scholarship FAQ");
    seen.add(String(row.id));
    return { id: String(row.id), question: text(row.questionAr) || scholarshipUnavailable("السؤال"), answer: text(row.answerAr) || scholarshipUnavailable("الإجابة"), displayOrder };
  }).sort((left, right) => left.displayOrder - right.displayOrder || left.id.localeCompare(right.id));
  return { items, pagination: p };
}

// Existing design slots, not assumed API fields. No general description is mined for verified benefits or documents.
export const unavailableScholarshipBenefits = ["تغطية الرسوم الدراسية", "الدعم المالي", "المزايا الأكاديمية", "المزايا الإضافية"].map(scholarshipUnavailable);
export const unavailableScholarshipRequirements = ["متطلبات الأهلية", "الوثائق المطلوبة", "المتطلبات الإضافية", "متطلبات اللغة"].map(scholarshipUnavailable);
export const unavailableScholarshipSteps = ["خطوة التقديم الأولى", "خطوة التقديم الثانية", "خطوة التقديم الثالثة", "خطوة التقديم الرابعة"].map(scholarshipUnavailable);
