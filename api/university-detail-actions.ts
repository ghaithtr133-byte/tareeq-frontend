"use server";

import { getScholarships } from "@/api/public-content";
import { RELATED_SCHOLARSHIP_BATCH } from "@/lib/university-details";
import { serverApiClient } from "@/api/server-client";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { detailSlug, detailList, detailText, programQuery, parseDetailPrograms, parseDetailAdmissions, parseDetailGallery, parseDetailFaqs, type LiveProgramFilters } from "@/lib/university-detail-live";
import type { Scholarship } from "@/api/public-content";

/** Read-only bridge to the EXISTING public scholarship client; source mode stays server-owned. */
export async function loadUniversityScholarships(slug: string, page: number) {
  if (!detailSlug(slug) || !Number.isSafeInteger(page) || page < 1) {
    return { ok: false as const };
  }
  try {
    const data = await getScholarships({ university: slug, page, limit: RELATED_SCHOLARSHIP_BATCH, sort: "newest" });
    if (isPublicDemoMode()) return { ok: true as const, data };
    const parsed = detailList<Scholarship>(data, (row) => {
      if (!detailSlug(row.slug) || !detailText(row.universityId)) throw Error("Invalid related scholarship");
      if (!["OPEN", "CLOSED"].includes(String(row.effectiveApplicationStatus ?? row.applicationStatus))) throw Error("Invalid scholarship status");
      return { ...row, titleAr: detailText(row.titleAr) || "اسم المنحة (غير متوفر حالياً)", studyLevel: detailText(row.studyLevel), fundingType: detailText(row.fundingType), descriptionAr: detailText(row.descriptionAr) } as Scholarship;
    });
    if (parsed.pagination.page !== page || parsed.pagination.limit !== RELATED_SCHOLARSHIP_BATCH) throw Error("Invalid scholarship pagination");
    return { ok: true as const, data: parsed };
  } catch {
    return { ok: false as const };
  }
}

async function detailRequest<T>(slug: string, suffix: string, parse: (data: unknown) => T, params?: Record<string, string | number>) {
  if (!detailSlug(slug) || isPublicDemoMode()) return { ok: false as const };
  try {
    const response = await serverApiClient.get(`/universities/${encodeURIComponent(slug)}/${suffix}`, { params, timeout: 12_000 });
    if (response.data?.success !== true) throw Error("Invalid detail response");
    return { ok: true as const, data: parse(response.data.data) };
  } catch { return { ok: false as const }; }
}

export async function loadUniversityPrograms(slug: string, filters: LiveProgramFilters = {}, page = 1) {
  try {
    return await detailRequest(slug, "programs", (data) => {
      const parsed = parseDetailPrograms(data);
      if (parsed.pagination.page !== page || parsed.pagination.limit !== 12) throw Error("Invalid programs pagination");
      return parsed;
    }, programQuery(filters, page));
  } catch { return { ok: false as const }; }
}
export async function loadUniversityAdmissions(slug: string) { return detailRequest(slug, "admission-requirements", parseDetailAdmissions); }
export async function loadUniversityGallery(slug: string) { return detailRequest(slug, "gallery", parseDetailGallery); }
export async function loadUniversityFaqs(slug: string, page = 1) {
  if (!Number.isSafeInteger(page) || page < 1) return { ok: false as const };
  return detailRequest(slug, "faqs", (data) => {
    const parsed = parseDetailFaqs(data);
    if (parsed.pagination.page !== page || parsed.pagination.limit !== 5) throw Error("Invalid FAQ pagination");
    return parsed;
  }, { page, limit: 5 });
}
