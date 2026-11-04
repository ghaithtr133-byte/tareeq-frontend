import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";

export type CountryOverviewImage = {
  src: string;
  alt: string;
  author: string;
  source: string;
  license: string;
  licenseUrl: string;
};

// Explicit local editorial assets, keyed by canonical Country slug, not inferred
// from a display name. This is shared presentation metadata, not a Backend field
// or a Demo-content fallback. Do not map other countries to the Turkey image.
const images: Readonly<Record<string, CountryOverviewImage>> = {
  turkey: {
    src: "/images/study-abroad/overview/turkey-overview.webp",
    alt: "بوابة جامعة إسطنبول التاريخية في تركيا",
    author: "Yair Haklai",
    source: "https://commons.wikimedia.org/wiki/File:Main_gate_of_Istanbul_University-.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};

export function getCountryOverviewImage(slug: string): CountryOverviewImage | null {
  const image = Object.hasOwn(images, slug) ? images[slug] : undefined;
  return image && existsSync(join(process.cwd(), "public", image.src)) ? image : null;
}
