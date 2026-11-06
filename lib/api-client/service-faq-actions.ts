"use server";

import { serverApiClient } from "@/lib/api-client/server-client";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { serviceDetailList, serviceText, validServiceSlug, type ServiceFaqResult } from "@/lib/service-detail-live";
import { homeCardText } from "@/lib/homepage-card-content";

export async function loadServiceFaqs(slug: string, page = 1): Promise<ServiceFaqResult> {
  if (isPublicDemoMode() || !validServiceSlug(slug) || !Number.isSafeInteger(page) || page < 1) return { ok: false };
  try {
    const response = await serverApiClient.get(`/services/${encodeURIComponent(slug)}/faqs`, { params: { page, limit: 5 }, timeout: 12_000 });
    if (response.data?.success !== true) throw Error("Invalid FAQ envelope");
    const data = serviceDetailList(response.data.data, (row) => {
      if (row.scope !== "SERVICE") throw Error("Invalid FAQ scope");
      return { id: String(row.id), question: homeCardText(serviceText(row.questionAr), "السؤال"), answer: homeCardText(serviceText(row.answerAr), "الإجابة") };
    });
    if (data.pagination.page !== page || data.pagination.limit !== 5) throw Error("Invalid FAQ pagination");
    return { ok: true, data };
  } catch { return { ok: false }; }
}
