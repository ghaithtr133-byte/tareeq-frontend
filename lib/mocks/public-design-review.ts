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
  campus: {
    src: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85",
    alt: "مبنى جامعي حديث للاستخدام الإرشادي",
  },
  library: {
    src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85",
    alt: "رفوف مكتبة ومصادر للدراسة والبحث",
  },
  study: {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85",
    alt: "طالبة تراجع موادها الدراسية",
  },
  architecture: {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=85",
    alt: "حرم جامعي للاستخدام الإرشادي",
  },
  classroom: {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85",
    alt: "طلاب في حرم جامعي للاستخدام الإرشادي",
  },
  research: {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
    alt: "مساحة دراسة وبحث للاستخدام الإرشادي",
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
    { slug: "romania", name: "رومانيا", image: reviewImages.romania },
    { slug: "turkey", name: "تركيا", image: reviewImages.turkey },
    { slug: "poland", name: "بولندا", image: reviewImages.poland },
  ],
  services: [
    { number: "01", title: "استشارة لاختيار الوجهة", description: "محادثة تعليمية تساعد الطالب على ترتيب الخيارات المتاحة للدراسة في الخارج." },
    { number: "02", title: "إرشاد لاختيار الجامعة", description: "توجيه معلوماتي يساعد على مقارنة الخيارات الجامعية بما يناسب الخطة الدراسية." },
    { number: "03", title: "مساعدة في القبول الجامعي", description: "مساندة تعليمية ضمن نطاق المعلومات والخطوات المعتمدة عند توفرها." },
  ],
  journey: [
    { number: "01", title: "أخبرنا عن خطتك الدراسية", description: "شاركنا ما تبحث عنه لنفهم أولوياتك التعليمية." },
    { number: "02", title: "نساعدك في اختيار وجهتك وجامعتك", description: "نرتّب معك أسئلة المقارنة بين الخيارات المتاحة." },
    { number: "03", title: "نرافقك خلال خطوات التقديم", description: "نقدّم توجيهاً واضحاً لفهم إجراءات القبول الجامعي." },
  ],
  universities: [
    { name: "جامعة بوخارست", place: "بوخارست، رومانيا", image: reviewImages.campus },
    { name: "بوليتكنيكا بوخارست", place: "بوخارست، رومانيا", image: reviewImages.library },
    { name: "جامعة إسطنبول التقنية", place: "إسطنبول، تركيا", image: reviewImages.architecture },
    { name: "جامعة الشرق الأوسط التقنية", place: "أنقرة، تركيا", image: reviewImages.study },
    { name: "جامعة وارسو", place: "وارسو، بولندا", image: reviewImages.classroom },
    { name: "جامعة ياغيلونيا", place: "كراكوف، بولندا", image: reviewImages.research },
  ],
  scholarships: [
    { title: "البحث في تكاليف البكالوريوس", country: "رومانيا", level: "مرحلة البكالوريوس", category: "الرسوم الدراسية", image: reviewImages.library },
    { title: "خيارات للدراسات العليا", country: "تركيا", level: "الدراسات العليا", category: "تكاليف المعيشة", image: reviewImages.study },
    { title: "التخطيط للبرامج المهنية", country: "بولندا", level: "البرامج المهنية", category: "الدعم الأكاديمي", image: reviewImages.students },
    { title: "البحث في تكاليف البكالوريوس", country: "رومانيا", level: "مرحلة البكالوريوس", category: "الرسوم الدراسية", image: reviewImages.campus },
    { title: "خيارات للدراسات العليا", country: "تركيا", level: "الدراسات العليا", category: "تكاليف المعيشة", image: reviewImages.architecture },
    { title: "التخطيط للبرامج المهنية", country: "بولندا", level: "البرامج المهنية", category: "الدعم الأكاديمي", image: reviewImages.poland },
  ],
  articles: [
    { title: "كيف تبدأ مقارنة وجهات الدراسة؟", summary: "مدخل مبسّط لترتيب الأسئلة التي تساعد على استكشاف الوجهة التعليمية.", image: reviewImages.study },
    { title: "أسئلة مفيدة قبل اختيار جامعة", summary: "قائمة تساعد على تنظيم الأولويات قبل اتخاذ الخطوة التالية.", image: reviewImages.campus },
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
    { title: "الدراسة في رومانيا", url: "https://www.youtube.com/watch?v=_aOSG_0iOko", thumbnail: reviewImages.romania },
    { title: "ادرس في رومانيا الآن", url: "https://www.youtube.com/watch?v=lqadzMJkTxw", thumbnail: reviewImages.students },
  ],
  heroImage: reviewImages.students,
} as const;
