import { browserApiClient } from "@/lib/api-client/client";
import { parseContactSettingsResponse } from "@/lib/contact";

/** Public browser request for static page shells; it never falls back to Demo data. */
export async function getBrowserContactSettings() {
  const response = await browserApiClient.get("/site-settings", { withCredentials: false, timeout: 15000 });
  return parseContactSettingsResponse(response.data);
}
