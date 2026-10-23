export type PublicContentMode = "demo" | "live";

/**
 * Selects one complete public-content source. Unknown or absent values always
 * keep the published site on the live Backend; there is deliberately no
 * automatic fallback between sources.
 */
export function getPublicContentMode(): PublicContentMode {
  return process.env.PUBLIC_CONTENT_MODE === "demo" ? "demo" : "live";
}

export function isPublicDemoMode() {
  return getPublicContentMode() === "demo";
}
