import { approvedHomeJourney } from "@/lib/homepage-content";

// Frontend presentation input, NOT a proposed API response schema.
// No public Journey contract exists yet. A future approved API adapter should
// supply validated real content here without changing the four visual positions.
export type JourneyContent = {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  steps?: readonly { title?: string | null; description?: string | null }[] | null;
};

export function getHomeJourney(demoMode: boolean, realContent?: JourneyContent | null) {
  const content = demoMode ? approvedHomeJourney : realContent;
  const text = (value: string | null | undefined, approved: string) => value?.trim() || approved;
  // Only approved editorial text is eligible; never use this for factual values.
  const stepText = (value: string | null | undefined, approved: string) =>
    value?.trim() || `${approved} (غير متوفر حالياً)`;
  return {
    eyebrow: text(content?.eyebrow, approvedHomeJourney.eyebrow),
    title: text(content?.title, approvedHomeJourney.title),
    description: text(content?.description, approvedHomeJourney.description),
    steps: ["01", "02", "03", "04"].map((number, index) => ({
      number,
      title: stepText(content?.steps?.[index]?.title, approvedHomeJourney.steps[index].title),
      description: stepText(content?.steps?.[index]?.description, approvedHomeJourney.steps[index].description),
    })),
  };
}
