// Intentionally approved static site copy, independent of Backend records.
// Never use this module to fill missing entity descriptions, relations or metrics.
// Journey section copy is static in both modes. Only its approved step copy may
// be used as explicitly marked temporary editorial content in Live mode.
export const approvedHomeJourney = {
  eyebrow: "خطوات الرحلة",
  title: "رحلتك الدراسية",
  description: "من الخطوة الأولى إلى بداية رحلتك، نرتّب الخيارات بوضوح.",
  steps: [
    { title: "اختيار الوجهة", description: "حدّد ما يناسب خطتك الدراسية." },
    { title: "اختيار الجامعة", description: "اقرأ الخيارات المنشورة بوضوح." },
    { title: "تقديم الطلب", description: "رتّب وثائقك وخطوتك التالية." },
    { title: "بدء الرحلة", description: "تابع مسارك بمعلومات موثوقة." },
  ],
} as const;

export const homeEditorial = {
  heroTitle: "طريقك نحو جامعة أحلامك يبدأ من هنا",
  heroDescription: "اكتشف فرص الدراسة في أفضل الجامعات حول العالم، مع دعم كامل من اختيار التخصص وحتى الوصول إلى مقعدك الجامعي.",
  heroNote: "محتوى منشور يساعدك على المقارنة واتخاذ قرار واعٍ.",
  trustTitle: "طريقك نحو مستقبل أكاديمي أفضل",
  trustDescription: "نرافقك في اختيار الجامعة والتخصص المناسب، ونساعدك في خطوات التقديم والاستعداد لرحلتك الدراسية.",
  discoveryTitle: "اكتشف عالماً من الفرص الدراسية",
  discoveryDescription: "تعرّف على الجامعات والتخصصات وابدأ رحلتك الأكاديمية بخطوات واضحة.",
} as const;
