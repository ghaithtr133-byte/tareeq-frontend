import "server-only";
import { cache } from "react";
import { getServices } from "@/lib/api-client/public-content";
import { getContactSettings } from "@/lib/api-client/site-settings";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { parsePublishedService, serviceDetailList } from "@/lib/service-detail-live";
import type { AboutProfileState } from "@/lib/about-content";
import type { Service } from "@/lib/api-client/public-content";
import type { ContactSettings } from "@/lib/contact";

export const loadAboutPage = cache(async (): Promise<{ demo: boolean; profile: AboutProfileState; identity: PromiseSettledResult<ContactSettings>; services: PromiseSettledResult<Service[]> }> => {
  const demo = isPublicDemoMode();
  const [identity, services] = await Promise.allSettled([
    getContactSettings(demo),
    getServices({ limit: 3, sort: "manual" }).then((raw) => {
      const data = serviceDetailList(raw, (row) => parsePublishedService(row));
      if (data.pagination.page !== 1 || data.pagination.limit !== 3) throw Error("Invalid About services page");
      return data.items;
    }),
  ]);
  // OpenAPI has neither an About route nor About fields in SiteSettings. Do not guess a URL
  // or silently replace a failed/unpublished profile with Demo or a static success record.
  const profile: AboutProfileState = { status: "unsupported" };
  return { demo, profile, identity, services };
});
