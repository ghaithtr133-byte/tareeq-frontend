"use server";

import { getScholarships } from "@/api/public-content";
import { RELATED_SCHOLARSHIP_BATCH } from "@/lib/university-details";

/** Read-only bridge to the EXISTING public scholarship client; source mode stays server-owned. */
export async function loadUniversityScholarships(slug: string, page: number) {
  if (typeof slug !== "string" || !slug.trim() || slug.length > 200 || !Number.isSafeInteger(page) || page < 1) {
    return { ok: false as const };
  }
  try {
    const data = await getScholarships({ university: slug, page, limit: RELATED_SCHOLARSHIP_BATCH, sort: "newest" });
    return { ok: true as const, data };
  } catch {
    return { ok: false as const };
  }
}
