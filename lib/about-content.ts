/** Presentation slots are mapped explicitly from the public About contract; values remain unsupported. */
export type AboutCopy = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string | null;
  heroImageAltAr?: string | null;
  introductionTitle?: string;
  introduction?: string;
  introImageUrl?: string | null;
  introImageAltAr?: string | null;
  visionTitle?: string;
  vision?: string;
  missionTitle?: string;
  mission?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonLabel?: string;
  values?: { title: string; description: string }[];
};
export type AboutProfileState = { status: "ready"; content: AboutCopy } | { status: "unsupported" | "unpublished" | "empty" | "error" };

// Proposed editorial placeholders only: not official policies, business facts or Demo records.
export const aboutTemporaryContent = {
  introduction: "نبذة تعريفية بالأكاديمية ودورها في الرحلة الدراسية (غير متوفر حالياً)",
  story: "تفاصيل نشأة الأكاديمية وخلفيتها وأهدافها (غير متوفر حالياً)",
  vision: "الوجهة التي تطمح الأكاديمية إلى تحقيقها (غير متوفر حالياً)",
  mission: "الدور الذي تسعى الأكاديمية إلى تقديمه للطلاب (غير متوفر حالياً)",
  valueTitle: "عنوان القيمة (غير متوفر حالياً)",
  valueDescription: "وصف القيمة (غير متوفر حالياً)",
  serviceSummary: "ملخص الخدمة (غير متوفر حالياً)",
  values: [
    { title: "الشفافية (غير متوفر حالياً)", description: "عرض المعلومات بوضوح قبل اتخاذ القرار (غير متوفر حالياً)" },
    { title: "الاهتمام بالطالب (غير متوفر حالياً)", description: "فهم احتياجات الطالب وأسئلته الدراسية (غير متوفر حالياً)" },
    { title: "الالتزام بالجودة (غير متوفر حالياً)", description: "العناية بالتفاصيل وتنظيم المعلومات (غير متوفر حالياً)" },
    { title: "الإرشاد المسؤول (غير متوفر حالياً)", description: "دعم الاختيار الواعي دون وعود بالنتائج (غير متوفر حالياً)" },
  ],
} as const;

export function aboutText(value: string | undefined, slot: "introduction" | "story" | "vision" | "mission") {
  return value?.trim() || aboutTemporaryContent[slot];
}
