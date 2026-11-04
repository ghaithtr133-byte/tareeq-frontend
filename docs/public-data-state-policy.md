# Public Website — Data-State Design Policy

Final policy: supersedes all conflicting previous data-fallback and UI-state instructions. Applies to Homepage now and other Public Website pages only when their Live migration is explicitly approved. It does not authorize a full-site migration or changes to API contracts.

**Preserve the original design. Change only content according to Backend data availability.**

| State | Required presentation |
| --- | --- |
| Loading | Use the existing matching Skeleton only while a real request/navigation is pending. Preserve original geometry. Never use a permanent skeleton for missing data. |
| Success | Render real published Backend data in the original components, preserving cards, icons, labels, dividers, spacing, routes and responsive behavior. |
| Empty | Keep the approved section heading and container visible. Render the shared, section-specific `EmptyState` inside its existing content area. Never invent cards to fill the layout. |
| Partial data | Render every available real field first. Restore exact previously approved content only for the SAME reliably identified record and append `(غير متوفر حالياً)`. Without a verified original value, use the descriptive field label plus `(غير متوفر حالياً)`, never an ambiguous unavailable-only message. Never borrow from another record or invent factual values. Preserve the original slot, icon, badge and styling. |
| Error | Keep the section visible and render the shared `ErrorState` inside its existing container, with retry when appropriate. Never interpret errors, timeouts, invalid responses or unsupported functionality as a successful empty collection. Isolate independent section failures. |
| Missing Backend capability | Retain the required data slot, icon, separator and card; show a clear unavailable label. Report the missing API field separately, marking proposed names as proposals. Do not invent an endpoint or consume an unapproved schema. |

## Implementation rules

- Reuse `components/ui/content-state.tsx` (`EmptyState`, `ErrorState`) and existing Skeletons in `components/ui/skeleton.tsx` / `components/public/content-skeletons.tsx`. Homepage retries already use `components/home/home-section-error.tsx`.
- Never fabricate statistics, fees, scholarship amounts, deadlines, admission requirements, partnerships, media or relations. Temporary content must be exact approved same-record content, or a descriptive field label, centralized and visibly marked `(غير متوفر حالياً)`. Provisional Demo numbers are not verified business statistics. Real integrated values always take priority and remove the indicator. Never use temporary values to disguise failures or empty published collections, add fake records, or switch Live to Demo. Keep the global configuration unchanged.
- Homepage card temporary content is centralized in `lib/homepage-card-content.ts`. Approved per-record values require exact slug AND name matching; never match by array position or borrow another entity's data. Do not turn temporary country text into a confirmed relation or infer a flag from it.
- Genuinely approved static website content and decorative artwork independent of Backend records are not data fallbacks. Preserve them.
- Homepage Student Journey eyebrow, section title and section description are approved static copy in both modes, without unavailable indicators. Its four approved step titles/descriptions render normally in Demo; in Live, only missing step fields use original copy plus `(غير متوفر حالياً)`. `lib/homepage-content.ts` centralizes that copy. Its static artwork and all four numbered positions/timeline remain unchanged. `lib/homepage-journey.ts` accepts mapped presentation content for a future contract adapter; it defines no endpoint or API schema.
- Keep the approved static Hero artwork `/images/hero/study-abroad-student-landmarks.png` and Journey artwork `/images/journey/journey-background.png`. No dedicated Homepage media contract currently supplies them; this is not a reason to show an unavailable placeholder.
- Backend-managed Hero/Journey images are an optional future capability requiring Lead-approved fields and contract. They are not a prerequisite to rendering current static artwork and must not replace it until explicitly approved.
- Missing record media retains its original media container with a neutral icon/unavailable label; never substitute an unrelated photo or disguise a campus image as a university logo.
- Real data must automatically replace state content inside the same existing components. Do not build a second design for Live mode. Keep controls, keyboard access, RTL and responsive layout intact.
- Preserve section order, original content slots, typography, spacing, proportions, images/containers, decorations, dividers, badges, actions and navigation. Never remove, simplify or rearrange approved UI merely because content is missing.
- Keep variable collections balanced with the existing responsive grid/carousel: center small groups, retain consistent card dimensions, avoid awkward last rows and horizontal overflow across mobile/tablet/desktop/wide screens. Never create filler cards.
- Log/report gaps as: missing API capability; existing field without Seed Data; frontend mapping bug; optional improvement. Never request a field already present in the contract.
- Test loading, populated, empty, partial and failed responses independently, with no silent fallback and no disappearing approved sections. Report browser verification separately from source/automated checks.

Report management: provide implementation summaries in the conversation. Do not create per-task Markdown/visualization reports. Reuse one existing Backend gap report only for actionable Backend requirements or corrections; distinguish new findings from known gaps and do not duplicate requests. Track missing API capabilities, unseeded existing fields, media, relations, frontend mapping issues and useful optional Backend improvements, distinguishing proposed fields from existing properties. Provide a concise Arabic request only for genuinely NEW Backend requirements; otherwise state there are none. Current Homepage report: `docs/homepage-journey-trust-backend-gaps.md`.

Verification: use focused TypeScript, lint and relevant tests. No mandatory screenshots, exhaustive browser audits, repeated viewport checks, unnecessary dependencies, commits or deployment. Do not claim browser verification from automated/source checks.
