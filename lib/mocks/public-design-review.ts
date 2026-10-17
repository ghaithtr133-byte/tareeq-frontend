/**
 * Temporary, opt-in content used only to review the homepage composition.
 * It is intentionally separate from public routes and Backend contracts.
 */
export { isDesignReviewMockEnabled } from "./design-review-mode";

const reviewImages = {
  students: {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=85",
    alt: "طلاب يتعاونون حول طاولة في بيئة تعليمية",
  },
  romania: {
    src: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=1200&q=85",
    alt: "مشهد عمراني في بوخارست، رومانيا",
  },
  turkey: {
    src: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85",
    alt: "إطلالة على إسطنبول، تركيا",
  },
  poland: {
    src: "https://images.unsplash.com/photo-1545289935-4ba21e98024b?auto=format&fit=crop&w=1200&q=85",
    alt: "مشهد حضري في وارسو، بولندا",
  },
} as const;

export const designReviewMock = {
  imageSources: [
    {
      purpose: "صور تعليمية ومدن عامة للمعاينة فقط",
      source: "https://unsplash.com/license",
      deliveryUrl: "images.unsplash.com",
      license: "Unsplash License",
    },
  ],
  destinations: [
    { slug: "romania", name: "رومانيا", note: "وجهة دراسية", image: reviewImages.romania },
    { slug: "turkey", name: "تركيا", note: "وجهة دراسية", image: reviewImages.turkey },
    { slug: "poland", name: "بولندا", note: "وجهة دراسية", image: reviewImages.poland },
  ],
  services: [
    { number: "01", title: "استشارة لاختيار الوجهة", description: "محادثة تعليمية تساعد الطالب على ترتيب الخيارات المتاحة للدراسة في الخارج." },
    { number: "02", title: "إرشاد لاختيار الجامعة", description: "توجيه معلوماتي يساعد على مقارنة الخيارات الجامعية بما يناسب الخطة الدراسية." },
    { number: "03", title: "مساعدة في القبول الجامعي", description: "مساندة تعليمية ضمن نطاق المعلومات والخطوات المعتمدة عند توفرها." },
  ],
  journey: [
    { number: "01", title: "استكشاف الخيارات", description: "ابدأ بفهم الوجهات والمسارات التي تستحق الدراسة." },
    { number: "02", title: "الحصول على توجيه", description: "رتّب أسئلتك التعليمية في محادثة واضحة ومركّزة." },
    { number: "03", title: "التواصل للخطوة التالية", description: "استخدم قناة التواصل المعتمدة للاستفسارات العامة." },
  ],
  universities: [
    { name: "جامعة بوخارست", place: "بوخارست، رومانيا", image: reviewImages.romania },
    { name: "بوليتكنيكا بوخارست", place: "بوخارست، رومانيا", image: reviewImages.students },
    { name: "جامعة إسطنبول التقنية", place: "إسطنبول، تركيا", image: reviewImages.turkey },
    { name: "جامعة الشرق الأوسط التقنية", place: "أنقرة، تركيا", image: reviewImages.students },
    { name: "جامعة وارسو", place: "وارسو، بولندا", image: reviewImages.poland },
    { name: "جامعة ياغيلونيا", place: "كراكوف، بولندا", image: reviewImages.students },
  ],
  scholarships: [
    { title: "تمويل الدراسة", country: "رومانيا", status: "مسار بحث" },
    { title: "تمويل الدراسة", country: "تركيا", status: "مسار بحث" },
    { title: "تمويل الدراسة", country: "بولندا", status: "مسار بحث" },
    { title: "الدعم الأكاديمي", country: "رومانيا", status: "مسار بحث" },
    { title: "الدعم الأكاديمي", country: "تركيا", status: "مسار بحث" },
    { title: "الدعم الأكاديمي", country: "بولندا", status: "مسار بحث" },
  ],
  articles: [
    { title: "كيف تبدأ مقارنة وجهات الدراسة؟", summary: "مدخل مبسّط لترتيب الأسئلة التي تساعد على استكشاف الوجهة التعليمية.", image: reviewImages.students },
    { title: "أسئلة مفيدة قبل اختيار جامعة", summary: "قائمة تساعد على تنظيم الأولويات قبل اتخاذ الخطوة التالية.", image: reviewImages.turkey },
    { title: "تنظيم محادثة الاستشارة التعليمية", summary: "أفكار هادئة لتحضير النقاط الأساسية عند التواصل للحصول على إرشاد.", image: reviewImages.students },
    { title: "فهم المسار الدراسي بوضوح", summary: "أفكار تساعدك على قراءة الخيارات التعليمية بصورة أوضح.", image: reviewImages.poland },
    { title: "اختيار وجهة تناسب خطتك", summary: "نقاط أساسية تساعدك على المقارنة بين الوجهات التعليمية.", image: reviewImages.students },
    { title: "خطوتك التالية في الدراسة بالخارج", summary: "خطوات أولية لتنظيم بحثك والاستعداد لمستقبلك الأكاديمي.", image: reviewImages.turkey },
  ],
  faqs: [
    "كيف أبدأ في استكشاف وجهة الدراسة؟",
    "ما المعلومات التي أحتاجها قبل التواصل؟",
    "كيف أرتب خيارات الجامعة؟",
    "ما الذي يمكن أن تتناوله الاستشارة التعليمية؟",
    "كيف أتواصل مع طريق الأكاديمية؟",
  ],
  videos: [
    { title: "Study in Romania", url: "https://www.youtube.com/watch?v=_aOSG_0iOko", thumbnail: reviewImages.romania },
    { title: "Study in Romania now", url: "https://www.youtube.com/watch?v=lqadzMJkTxw", thumbnail: reviewImages.students },
  ],
  heroImage: reviewImages.students,
} as const;
