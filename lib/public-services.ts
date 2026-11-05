export type PublicService = {
  slug: string;
  title: string;
  homepageSummary: string;
  description: string;
  icon: "admissions" | "major" | "scholarships" | "documents" | "follow-up" | "general";
  image: { src: string; alt: string } | null;
  detailAvailable: boolean;
};

/**
 * Approved informational copy. Homepage currently consumes Backend service records,
 * not a shared constant; keep this scoped rather than refactoring its data source.
 * Planned detail pages stay unavailable until implemented and publicly reachable.
 * The generic /services/[slug] renderer alone does not confirm a published route.
 */
export const publicServices: readonly PublicService[] = [
  {
    slug: "university-admission", title: "القبول الجامعي", homepageSummary: "مساعدتك في القبول والتسجيل",
    description: "نساعدك في اختيار الجامعات المناسبة وتجهيز ملف القبول ومتابعة إجراءات التقديم حتى صدور قرار القبول.",
    icon: "admissions", image: { src: "/images/universities/university-guide-illustration.png", alt: "معالم أكاديمية وقبعة تخرج — رسم توضيحي لخدمة القبول الجامعي" }, detailAvailable: false,
  },
  {
    slug: "major-selection", title: "اختيار التخصص", homepageSummary: "مساعدتك في اختيار التخصص الأنسب",
    description: "نساعدك في اختيار التخصص الأكاديمي الأنسب لاهتماماتك وقدراتك وأهدافك المستقبلية.",
    icon: "major", image: null, detailAvailable: false,
  },
  {
    slug: "scholarship-assistance", title: "المنح الدراسية", homepageSummary: "البحث والتقديم على المنح",
    description: "نرشدك إلى المنح الدراسية المناسبة ونساعدك في فهم المتطلبات وتجهيز طلب التقديم.",
    icon: "scholarships", image: { src: "/images/services/services-hero.png", alt: "قبعة تخرج وكتب وكرة أرضية — صورة توضيحية للإرشاد حول المنح" }, detailAvailable: false,
  },
  {
    slug: "document-preparation", title: "تجهيز الملف", homepageSummary: "مراجعة وتجهيز جميع المستندات",
    description: "نساعدك في مراجعة وتنظيم المستندات المطلوبة للتقديم على الجامعات والمنح الدراسية.",
    icon: "documents", image: null, detailAvailable: false,
  },
  {
    slug: "admission-follow-up", title: "متابعة القبول", homepageSummary: "متابعة مستمرة حتى صدور القبول",
    description: "نتابع معك مراحل التقديم والردود والإجراءات اللازمة حتى صدور قرار القبول.",
    icon: "follow-up", image: null, detailAvailable: false,
  },
];

export function plannedServiceHref(service: Pick<PublicService, "slug">) {
  return `/services/${service.slug}`;
}

export function availableServiceHref(service: PublicService) {
  return service.detailAvailable ? plannedServiceHref(service) : null;
}

export const serviceProcess = [
  { title: "تواصل معنا", description: "نبدأ بفهم أهدافك الدراسية واهتماماتك." },
  { title: "استشارة مخصصة", description: "نقدم لك خطة مناسبة لاحتياجاتك." },
  { title: "تجهيز وتقديم", description: "نساعدك في إعداد ملفك والتقديم." },
  { title: "القبول والانطلاق", description: "نرافقك حتى صدور قرار القبول، ونساعدك في ترتيب خطوتك التالية." },
] as const;
