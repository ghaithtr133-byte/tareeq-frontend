"use server";

import { getScholarships } from "@/lib/api-client/public-content";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import type { LiveUniversityParams } from "@/lib/university-directory-data";
import { parseRelatedScholarships, universityScholarshipParams } from "@/lib/university-related-scholarships";

/** Read-only bridge, matching the existing scholarship load-more pattern. */
export async function loadRelatedUniversityScholarships(criteria: LiveUniversityParams, page: number) {
  try {
    if (isPublicDemoMode()) return { ok: false as const };
    const params = universityScholarshipParams(criteria, page);
    const data = parseRelatedScholarships(await getScholarships(params));
    if (data.pagination.page !== page) throw Error("Unexpected related scholarship page");
    return { ok: true as const, data };
  } catch { return { ok: false as const }; }
}
