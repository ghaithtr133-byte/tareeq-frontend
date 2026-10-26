/**
 * Edge-safe slug lookup for the demo-only detail-route guard. Keep this
 * intentionally data-free: records remain in public-demo-content.ts, while
 * Proxy can return a real 404 without importing Axios or contacting the API.
 */
const demoSlugs = {
  countries: ["romania", "turkey", "poland", "hungary", "malaysia", "cyprus", "united-kingdom"],
  universities: ["university-bucharest", "polytechnic-university-bucharest", "istanbul-university", "middle-east-technical-university", "university-of-warsaw", "eotvos-lorand-university"],
  scholarships: ["romania-academic-scholarship", "bucharest-excellence-scholarship", "turkey-masters-scholarship", "ankara-study-grant", "poland-research-scholarship", "hungary-language-preparation"],
  services: ["destination-guidance", "university-guidance", "application-preparation", "visa-guidance"],
  articles: ["study-guide", "turkey-guide", "compare-study-destinations", "ielts-and-admission-plan", "quiet-study-note", "romania-living-costs", "documents-before-application", "university-questions", "how-to-read-admission-requirements", "budget-planning-notes", "choosing-study-level", "research-before-contact", "application-timeline"],
} as const;

export function isDemoDetailSlug(collection: string, slug: string) {
  return (demoSlugs[collection as keyof typeof demoSlugs] as readonly string[] | undefined)?.includes(slug) ?? false;
}
