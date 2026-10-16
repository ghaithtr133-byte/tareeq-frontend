import type { Metadata } from "next";

type PageMetadataOptions = {
  index?: boolean;
  pathname?: string;
};

/** Returns the approved public origin only when it is a complete HTTP(S) URL. */
export function getSiteOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredOrigin) return undefined;

  try {
    const url = new URL(configuredOrigin);
    return url.protocol === "https:" || url.protocol === "http:" ? new URL(url.origin) : undefined;
  } catch {
    return undefined;
  }
}

export function createPageMetadata(
  title: string,
  description: string,
  { index = false, pathname }: PageMetadataOptions = {},
): Metadata {
  const origin = getSiteOrigin();
  const canonical = origin && pathname ? new URL(pathname, origin).toString() : undefined;

  return {
    title,
    description,
    robots: index ? undefined : { index: false, follow: false },
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: { title, description, locale: "ar", type: "website", ...(canonical ? { url: canonical } : {}) },
  };
}
