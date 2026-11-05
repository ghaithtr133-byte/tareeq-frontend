import { browserApiClient } from "@/api/client";
import { ApiError } from "@/api/error";
import type { InquiryPayload } from "@/lib/contact";

export async function submitInquiry(payload: InquiryPayload, demo: boolean) {
  if (demo) return; // Demo never sends or stores personal information.
  const response = await browserApiClient.post("/inquiries", payload, { withCredentials: false, timeout: 15000 });
  // Match the existing public create-submission pattern: storage, not email delivery.
  if (response.status !== 201 || response.data?.success !== true || typeof response.data.data?.message !== "string" || !response.data.data.message.trim()) throw new ApiError(response.status, "Inquiry storage was not confirmed.");
}
