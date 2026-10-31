import { browserApiClient } from "@/api/client";
import { ApiError } from "@/api/error";
import type { ScholarshipAssistancePayload } from "@/lib/scholarship-assistance";

/** Existing public application contract. A 201 confirms storage, not email delivery. */
export async function submitScholarshipAssistance(payload: ScholarshipAssistancePayload, demo: boolean) {
  if (demo) {
    // Demonstrate pending/success without sending or retaining personal information.
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    return;
  }
  const response = await browserApiClient.post("/applications", payload);
  if (response.status !== 201) throw new ApiError(response.status, "Application storage was not confirmed.");
}
