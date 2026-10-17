import "server-only";

const mockFlagIsEnabled = process.env.NEXT_PUBLIC_ENABLE_DESIGN_REVIEW_MOCKS === "true";
const vercelEnvironment = process.env.VERCEL_ENV;
const isLocalDevelopment = process.env.NODE_ENV === "development" && !vercelEnvironment;
const isVercelPreview = vercelEnvironment === "preview";

/**
 * Design-review fixtures are server-rendered and deliberately unavailable in
 * Production. Unknown deployment contexts default to the public, mock-free UI.
 */
export const isDesignReviewMockEnabled = mockFlagIsEnabled && (isLocalDevelopment || isVercelPreview);

/**
 * Preview protection is configured in Vercel, not inferred from `noindex`.
 * Keep one clear disclosure until the deployment is confirmed access-protected.
 */
export const shouldShowDesignReviewDisclosure = isDesignReviewMockEnabled
  && isVercelPreview
  && process.env.TAREEQ_PREVIEW_ACCESS_PROTECTED !== "true";
