# Public Website — Data-State Design Policy

Applies to every future Public Website page migration. This policy supersedes earlier guidance to hide approved sections or remove visual elements because Backend data is absent. It does not authorize a full-site migration or changes to API contracts.

**Preserve the original design. Change only content according to Backend data availability.**

| State | Required presentation |
| --- | --- |
| Loading | Use the existing matching Skeleton only while a real request/navigation is pending. Preserve original geometry. Never use a permanent skeleton for missing data. |
| Success | Render real published Backend data in the original components, preserving cards, icons, labels, dividers, spacing, routes and responsive behavior. |
| Empty | Keep the approved section heading and container visible. Render the shared, section-specific `EmptyState` inside its existing content area. Never invent cards to fill the layout. |
| Partial data | Render all available real fields first. For missing editorial fields with approved original copy, use that copy followed by `(غير متوفر حالياً)`. Without an approved editorial value, use `غير متوفر حالياً` / `المحتوى غير متوفر حالياً`. Never invent factual values. Preserve all surrounding components. |
| Error | Keep the section visible and render the shared `ErrorState` inside its existing container, with retry when appropriate. Never interpret errors, timeouts, invalid responses or unsupported functionality as a successful empty collection. Isolate independent section failures. |
| Missing Backend capability | Retain the required data slot, icon, separator and card; show a clear unavailable label. Report the missing API field separately, marking proposed names as proposals. Do not invent an endpoint or consume an unapproved schema. |

## Implementation rules

- Reuse `components/ui/content-state.tsx` (`EmptyState`, `ErrorState`) and existing Skeletons in `components/ui/skeleton.tsx` / `components/public/content-skeletons.tsx`. Homepage retries already use `components/home/home-section-error.tsx`.
- Do not replace missing values with Demo records, mock collections, fabricated metrics, dates, media, relations or counts. The only temporary editorial exception is existing approved copy, centrally maintained and explicitly marked `(غير متوفر حالياً)`. Real integrated data takes priority field by field and removes that indicator. Never use this exception to disguise failed requests or empty published collections. Keep global Demo/Live separation unchanged.
- Genuinely approved static website content and decorative artwork independent of Backend records are not data fallbacks. Preserve them.
- Homepage Student Journey eyebrow, section title and section description are approved static copy in both modes, without unavailable indicators. Its four approved step titles/descriptions render normally in Demo; in Live, only missing step fields use original copy plus `(غير متوفر حالياً)`. `lib/homepage-content.ts` centralizes that copy. Its static artwork and all four numbered positions/timeline remain unchanged. `lib/homepage-journey.ts` accepts mapped presentation content for a future contract adapter; it defines no endpoint or API schema.
- Keep the approved static Hero artwork `/images/hero/study-abroad-student-landmarks.png` and Journey artwork `/images/journey/journey-background.png`. No dedicated Homepage media contract currently supplies them; this is not a reason to show an unavailable placeholder.
- Backend-managed Hero/Journey images are an optional future capability requiring Lead-approved fields and contract. They are not a prerequisite to rendering current static artwork and must not replace it until explicitly approved.
- Missing record media retains its original media container with a neutral icon/unavailable label; never substitute an unrelated photo or disguise a campus image as a university logo.
- Real data must automatically replace state content inside the same existing components. Do not build a second design for Live mode. Keep controls, keyboard access, RTL and responsive layout intact.
- Log/report gaps as: missing API capability; existing field without Seed Data; frontend mapping bug; optional improvement. Never request a field already present in the contract.
- Test loading, populated, empty, partial and failed responses independently, with no silent fallback and no disappearing approved sections. Report browser verification separately from source/automated checks.

Report management: provide implementation summaries in the conversation. Do not create per-task Markdown/visualization reports. Reuse one existing Backend gap report only for actionable Backend requirements or corrections; distinguish new findings from known gaps and do not duplicate requests. Current Homepage report: `docs/homepage-journey-trust-backend-gaps.md`. Other pages adopt this policy when their own migration is approved.
