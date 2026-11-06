import "server-only";
import { serverApiClient } from "@/lib/api-client/server-client";
import { contactSettings } from "@/lib/contact";

export async function getContactSettings(demo: boolean) {
  if (demo) return {}; // No fictional contact details and no Live-to-Demo fallback.
  const response = await serverApiClient.get("/site-settings");
  // Use the same public success/data envelope as the existing content adapters.
  const data = response.data?.data;
  const fields = ["academyNameAr", "contactEmail", "contactPhone", "addressAr", "facebookUrl", "instagramUrl", "linkedinUrl", "youtubeUrl"];
  if (response.data?.success !== true || !data || typeof data !== "object" || Array.isArray(data) || !fields.some((key) => key in data) || fields.some((key) => data[key] !== undefined && data[key] !== null && typeof data[key] !== "string")) throw new Error("Invalid site settings response.");
  return contactSettings(response.data.data);
}
