import "server-only";
import { cache } from "react";
import { getServices } from "@/lib/api-client/public-content";
import { getContactSettings } from "@/lib/api-client/site-settings";
import { ApiError } from "@/lib/api-client/error";
import { serverApiClient } from "@/lib/api-client/server-client";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { parsePublishedService, serviceDetailList } from "@/lib/service-detail-live";
import type { AboutCopy, AboutProfileState } from "@/lib/about-content";
import type { Service } from "@/lib/api-client/public-content";
import type { ContactSettings } from "@/lib/contact";
import { homeImageUrl } from "@/lib/homepage-data";

type AboutUsPublic = {
  id: string;
  heroTitleAr?: unknown; heroSubtitleAr?: unknown; heroImageUrl?: unknown; heroImageAltAr?: unknown;
  introTitleAr?: unknown; introBodyAr?: unknown; introImageUrl?: unknown; introImageAltAr?: unknown;
  missionTitleAr?: unknown; missionBodyAr?: unknown; visionTitleAr?: unknown; visionBodyAr?: unknown;
  ctaTitleAr?: unknown; ctaDescriptionAr?: unknown; ctaButtonLabelAr?: unknown;
  seoTitleAr?: unknown; seoDescriptionAr?: unknown; publishedAt?: unknown;
};

export type PublishedAbout = AboutCopy & { id: string; seoTitleAr: string | null; seoDescriptionAr: string | null; publishedAt: string | null };
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const nullableText = (value: unknown) => text(value) || null;
const publishedAt = (value: unknown) => {
  const date = text(value);
  return date && Number.isFinite(Date.parse(date)) ? date : null;
};

export function parsePublishedAbout(value: unknown): PublishedAbout {
  const about = value as AboutUsPublic;
  if (!about || !text(about.id)) throw Error("Invalid published About content");
  return {
    id: text(about.id),
    heroTitle: text(about.heroTitleAr) || undefined, heroSubtitle: text(about.heroSubtitleAr) || undefined,
    heroImageUrl: homeImageUrl(about.heroImageUrl) ?? null, heroImageAltAr: nullableText(about.heroImageAltAr),
    introductionTitle: text(about.introTitleAr) || undefined, introduction: text(about.introBodyAr) || undefined,
    introImageUrl: homeImageUrl(about.introImageUrl) ?? null, introImageAltAr: nullableText(about.introImageAltAr),
    missionTitle: text(about.missionTitleAr) || undefined, mission: text(about.missionBodyAr) || undefined,
    visionTitle: text(about.visionTitleAr) || undefined, vision: text(about.visionBodyAr) || undefined,
    ctaTitle: text(about.ctaTitleAr) || undefined, ctaDescription: text(about.ctaDescriptionAr) || undefined, ctaButtonLabel: text(about.ctaButtonLabelAr) || undefined,
    seoTitleAr: nullableText(about.seoTitleAr), seoDescriptionAr: nullableText(about.seoDescriptionAr), publishedAt: publishedAt(about.publishedAt),
  };
}

export const getPublishedAbout = cache(async () => {
  const response = await serverApiClient.get("/about", { timeout: 12_000 });
  if (response.data?.success !== true) throw Error("Invalid About envelope");
  return parsePublishedAbout(response.data.data);
});

export const loadAboutPage = cache(async (): Promise<{ demo: boolean; profile: AboutProfileState; identity: PromiseSettledResult<ContactSettings>; services: PromiseSettledResult<Service[]> }> => {
  const demo = isPublicDemoMode();
  const [about, identity, services] = await Promise.allSettled([
    demo ? Promise.resolve(null) : getPublishedAbout(),
    getContactSettings(demo),
    getServices({ limit: 3, sort: "manual" }).then((raw) => {
      const data = serviceDetailList(raw, (row) => parsePublishedService(row));
      if (data.pagination.page !== 1 || data.pagination.limit !== 3) throw Error("Invalid About services page");
      return data.items;
    }),
  ]);
  let profile: AboutProfileState;
  if (demo) profile = { status: "unsupported" };
  else if (about.status === "fulfilled") profile = about.value ? { status: "ready", content: about.value } : { status: "empty" };
  else profile = about.reason instanceof ApiError && about.reason.status === 404 ? { status: "unpublished" } : { status: "error" };
  return { demo, profile, identity, services };
});
