"use server";

import { serverApiClient } from "@/lib/api-client/server-client";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { parseScholarshipFaqs, scholarshipDetailSlug, type ScholarshipFaqResult } from "@/lib/scholarship-detail-live";

export async function loadScholarshipFaqs(slug: string, page = 1): Promise<ScholarshipFaqResult> {
  if (isPublicDemoMode() || !scholarshipDetailSlug(slug) || !Number.isSafeInteger(page) || page < 1) return { ok: false };
  try {
    const response = await serverApiClient.get(`/scholarships/${encodeURIComponent(slug)}/faqs`, { params: { page, limit: 5 }, timeout: 12_000 });
    if (response.data?.success !== true) throw Error("Invalid FAQ envelope");
    const data = parseScholarshipFaqs(response.data.data);
    if (data.pagination.page !== page || data.pagination.limit !== 5) throw Error("Invalid FAQ pagination");
    return { ok: true, data };
  } catch { return { ok: false }; }
}
