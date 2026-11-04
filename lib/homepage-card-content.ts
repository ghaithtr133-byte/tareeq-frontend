// Presentation-only, approved same-record copy recovered from aac4b85:app/page.tsx
// and lib/mocks/public-demo-content.ts. Never substitute a different record or
// infer identity from a list position, translated name alone or approximate slug.
type ApprovedCopy = { name: string; description?: string; universityType?: string; city?: string; country?: string };
const approved: Record<"countries" | "universities" | "services", Record<string, ApprovedCopy>> = {
  countries: {
    turkey: { name: "تركيا", description: "استكشف الدراسة والجامعات في تركيا" },
    malaysia: { name: "ماليزيا", description: "تعرّف على خيارات الدراسة في ماليزيا" },
    cyprus: { name: "قبرص", description: "اطّلع على خيارات الدراسة في قبرص" },
    "united-kingdom": { name: "بريطانيا", description: "قارن خيارات الدراسة في بريطانيا" },
  },
  universities: {
    "university-bucharest": { name: "جامعة بوخارست", universityType: "حكومية", city: "بوخارست", country: "رومانيا" },
    "polytechnic-university-bucharest": { name: "جامعة بوليتكنيكا بوخارست", universityType: "حكومية", city: "بوخارست", country: "رومانيا" },
    "istanbul-university": { name: "جامعة إسطنبول", universityType: "حكومية", city: "إسطنبول", country: "تركيا" },
    "university-of-warsaw": { name: "جامعة وارسو", universityType: "حكومية", city: "وارسو", country: "بولندا" },
  },
  services: {
    "university-admissions": { name: "القبول الجامعي", description: "مساعدتك في القبول والتسجيل" },
    "major-selection": { name: "اختيار التخصص", description: "مساعدتك في اختيار التخصص الأنسب" },
    "scholarship-guidance": { name: "المنح الدراسية", description: "البحث والتقديم على المنح" },
    "file-preparation": { name: "تجهيز الملف", description: "مراجعة وتجهيز جميع المستندات" },
    "admission-follow-up": { name: "متابعة القبول", description: "متابعة مستمرة حتى صدور القبول" },
  },
};

export function approvedHomeCardCopy(section: keyof typeof approved, slug: string, name: string) {
  const entry = Object.hasOwn(approved[section], slug) ? approved[section][slug] : undefined;
  return entry?.name === name.trim() ? entry : undefined;
}

/** Real text always wins; approved text or the field label is explicitly temporary. */
export function homeCardText(value: string | null | undefined, fieldLabel: string, original?: string) {
  return value?.trim() || `${original?.trim() || fieldLabel} (غير متوفر حالياً)`;
}
