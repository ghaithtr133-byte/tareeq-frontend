import "server-only";
import { serverApiClient } from "@/lib/api-client/server-client";
import { parseContactSettingsResponse } from "@/lib/contact";

export async function getContactSettings(demo: boolean) {
  if (demo) return {}; // No fictional contact details and no Live-to-Demo fallback.
  const response = await serverApiClient.get("/site-settings");
  return parseContactSettingsResponse(response.data);
}
