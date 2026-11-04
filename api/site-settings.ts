import "server-only";
import { serverApiClient } from "@/api/server-client";
import { contactSettings } from "@/lib/contact";

export async function getContactSettings(demo: boolean) {
  if (demo) return {}; // No fictional contact details and no Live-to-Demo fallback.
  const response = await serverApiClient.get("/site-settings");
  // Use the same public success/data envelope as the existing content adapters.
  if (response.data?.success !== true || !response.data.data || typeof response.data.data !== "object") throw new Error("Invalid site settings response.");
  return contactSettings(response.data.data);
}
