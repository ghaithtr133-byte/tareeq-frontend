import { browserApiClient } from "@/api/client";
import { ApiError } from "@/api/error";
import type { InquiryPayload } from "@/lib/contact";

export async function submitInquiry(payload: InquiryPayload, demo: boolean) {
  if (demo) return; // Demo never sends or stores personal information.
  const response = await browserApiClient.post("/inquiries", payload);
  // Match the existing public create-submission pattern: storage, not email delivery.
  if (response.status !== 201) throw new ApiError(response.status, "Inquiry storage was not confirmed.");
}
