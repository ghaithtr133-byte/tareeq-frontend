import type { Metadata } from "next";

export function createPageMetadata(title: string, description: string, index = false): Metadata {
  return {
    title,
    description,
    robots: index ? undefined : { index: false, follow: false },
    openGraph: { title, description, locale: "ar", type: "website" },
  };
}
