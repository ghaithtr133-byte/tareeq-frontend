import { createServer } from "node:http";

if (process.env.NODE_ENV === "production") {
  throw new Error(
    "The public API fixture server is development-only and must not run in production.",
  );
}

const now = "2026-10-20T00:00:00.000Z";
const country = {
  id: "country-1",
  slug: "romania",
  featured: true,
  publishedAt: now,
  seoTitleAr: "الدراسة في رومانيا",
  seoDescriptionAr: "وصف SEO",
  nameAr: "رومانيا",
  nameEn: "Romania",
  introductionAr: "مقدمة رومانيا",
  introductionEn: null,
  detailsAr: "تفاصيل رومانيا",
  detailsEn: null,
  imageUrl:
    "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=1200&q=80",
  imageAltAr: "مشهد في رومانيا",
  imageAltEn: null,
  displayOrder: 1,
  status: "PUBLISHED",
  createdAt: now,
  updatedAt: now,
};
const university = {
  id: "university-1",
  slug: "university-bucharest",
  featured: true,
  publishedAt: now,
  seoTitleAr: null,
  seoDescriptionAr: null,
  nameAr: "جامعة بوخارست",
  nameEn: null,
  officialName: "University of Bucharest",
  countryId: country.id,
  cityAr: "بوخارست",
  cityEn: null,
  overviewAr: "نبذة الجامعة",
  overviewEn: null,
  officialWebsite: null,
  imageUrl:
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  imageAltAr: "حرم جامعي",
  imageAltEn: null,
  country: {
    id: country.id,
    slug: country.slug,
    nameAr: country.nameAr,
    nameEn: country.nameEn,
  },
  status: "PUBLISHED",
  createdAt: now,
  updatedAt: now,
};
const scholarship = {
  id: "scholarship-1",
  slug: "romania-scholarship",
  featured: true,
  publishedAt: now,
  seoTitleAr: null,
  seoDescriptionAr: null,
  titleAr: "منحة رومانيا",
  titleEn: null,
  countryId: country.id,
  universityId: university.id,
  studyLevel: "بكالوريوس",
  fundingType: "تمويل كامل",
  requirementsAr: "متطلبات المنحة",
  requirementsEn: null,
  descriptionAr: "وصف المنحة",
  descriptionEn: null,
  verifiedDeadline: "2026-12-31T00:00:00.000Z",
  officialSourceUrl: null,
  applicationStatus: "OPEN",
  effectiveApplicationStatus: "OPEN",
  country: { id: country.id, slug: country.slug, nameAr: country.nameAr },
  university: {
    id: university.id,
    slug: university.slug,
    nameAr: university.nameAr,
  },
  status: "PUBLISHED",
  createdAt: now,
  updatedAt: now,
};
const service = {
  id: "service-1",
  slug: "admission-guidance",
  featured: true,
  publishedAt: now,
  seoTitleAr: null,
  seoDescriptionAr: null,
  titleAr: "إرشاد القبول",
  titleEn: null,
  summaryAr: "ملخص الخدمة",
  summaryEn: null,
  descriptionAr: "تفاصيل الخدمة",
  descriptionEn: null,
  imageUrl: null,
  imageAltAr: null,
  imageAltEn: null,
  displayOrder: 1,
  status: "PUBLISHED",
  createdAt: now,
  updatedAt: now,
};
const article = {
  id: "article-1",
  slug: "study-guide",
  featured: true,
  publishedAt: now,
  seoTitleAr: "دليل تجهيز ملف الدراسة في الخارج",
  seoDescriptionAr:
    "دليل عملي لتنظيم ملف الدراسة والوثائق الأساسية قبل التقديم.",
  titleAr:
    "دليل تجهيز ملف الدراسة في الخارج: من اختيار التخصص إلى مراجعة الوثائق",
  titleEn: null,
  summaryAr:
    "خطوات عملية تساعدك على تنظيم ملفك الدراسي بهدوء قبل بدء طلبات القبول.",
  summaryEn: null,
  bodyAr: [
    {
      type: "paragraph",
      text: "يبدأ الملف الجيد بفهم واضح لما تحتاجه الجامعة والبرنامج، ثم تنظيم الوثائق في قائمة يمكن مراجعتها على مراحل.",
    },
    { type: "heading2", text: "ابدأ من هدفك الدراسي" },
    {
      type: "paragraph",
      text: "اكتب التخصص والدرجة والبلد التي تفكر بها، ثم قارِن بين المتطلبات المنشورة بدل الاعتماد على معلومات غير موثقة.",
    },
    { type: "heading3", text: "رتّب أولوياتك" },
    { type: "bulleted-list", text: "لغة الدراسة ومتطلبات القبول الأكاديمي." },
    {
      type: "bulleted-list",
      text: "الميزانية وخيارات التمويل التي تقرأ شروطها من المصدر الرسمي.",
    },
    { type: "heading2", text: "تجهيز الوثائق" },
    {
      type: "paragraph",
      text: "اجمع النسخ الأصلية والترجمات المطلوبة مبكرًا، واترك وقتًا كافيًا لمراجعة أسماء الملفات وتواريخها.",
    },
    { type: "heading3", text: "كشف الدرجات" },
    {
      type: "paragraph",
      text: "راجع الاسم والدرجات واللغة المطلوبة، وتأكد من الاحتفاظ بنسخة قابلة للقراءة.",
    },
    { type: "heading3", text: "خطاب الدافع" },
    {
      type: "paragraph",
      text: "اكتب مسودة مرتبطة بالبرنامج، واطلب مراجعة لغوية لا تغيّر صوتك أو تجربتك.",
    },
    { type: "heading2", text: "تجهيز الوثائق" },
    {
      type: "paragraph",
      text: "قبل الإرسال، استخدم قائمة تحقق نهائية حتى لا تتكرر الملفات أو تفوتك خانة إلزامية.",
    },
    {
      type: "numbered-list",
      text: "سمِّ الملفات بوضوح وبصيغة تقبلها البوابة.",
    },
    { type: "numbered-list", text: "احتفظ بسجل لتواريخ الإرسال والردود." },
    {
      type: "quote",
      text: "التخطيط الهادئ لا يضمن القبول، لكنه يجعل قرارك وملفك أكثر وضوحًا.",
    },
  ],
  bodyEn: null,
  coverImageUrl:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
  coverImageAltAr: "طالبة تراجع موادها",
  coverImageAltEn: null,
  countryId: country.id,
  universityId: university.id,
  scholarshipId: scholarship.id,
  country: { id: country.id, slug: country.slug, nameAr: country.nameAr },
  university: {
    id: university.id,
    slug: university.slug,
    nameAr: university.nameAr,
  },
  scholarship: {
    id: scholarship.id,
    slug: scholarship.slug,
    titleAr: scholarship.titleAr,
  },
  status: "PUBLISHED",
  createdAt: now,
  updatedAt: now,
};
const country2 = {
  ...country,
  id: "country-2",
  slug: "turkey",
  featured: false,
  nameAr: "تركيا",
  nameEn: "Turkey",
  introductionAr: "مقدمة تركيا",
  displayOrder: 2,
  publishedAt: "2026-10-19T00:00:00.000Z",
};
const country3 = {
  ...country,
  id: "country-3",
  slug: "poland",
  nameAr: "بولندا",
  nameEn: "Poland",
  introductionAr: "مقدمة بولندا",
  displayOrder: 3,
  publishedAt: "2026-10-18T00:00:00.000Z",
};
const university2 = {
  ...university,
  id: "university-2",
  slug: "istanbul-university",
  nameAr: "جامعة إسطنبول",
  countryId: country2.id,
  country: {
    id: country2.id,
    slug: country2.slug,
    nameAr: country2.nameAr,
    nameEn: country2.nameEn,
  },
  cityAr: "إسطنبول",
  featured: false,
};
const scholarship2 = {
  ...scholarship,
  id: "scholarship-2",
  slug: "turkey-masters",
  titleAr: "منحة تركيا",
  countryId: country2.id,
  universityId: university2.id,
  country: { id: country2.id, slug: country2.slug, nameAr: country2.nameAr },
  university: {
    id: university2.id,
    slug: university2.slug,
    nameAr: university2.nameAr,
  },
  studyLevel: "MASTERS",
  fundingType: "FULL",
  applicationStatus: "CLOSED",
  effectiveApplicationStatus: "CLOSED",
  featured: false,
  verifiedDeadline: null,
};
const scholarship3 = {
  ...scholarship,
  id: "scholarship-3",
  slug: "bucharest-excellence",
  titleAr: "منحة التميز الأكاديمي في بوخارست",
  universityId: university.id,
  studyLevel: "ماجستير",
  fundingType: "تمويل جزئي",
  featured: false,
  verifiedDeadline: null,
};
const service2 = {
  ...service,
  id: "service-2",
  slug: "visa-guidance",
  titleAr: "إرشاد التأشيرة",
  featured: false,
  displayOrder: 2,
};
const article2 = {
  ...article,
  id: "article-2",
  slug: "turkey-guide",
  titleAr: "دليل تركيا",
  summaryAr: "ملخص تركيا",
  countryId: country2.id,
  universityId: null,
  scholarshipId: null,
  country: { id: country2.id, slug: country2.slug, nameAr: country2.nameAr },
  university: null,
  scholarship: null,
  featured: false,
  bodyAr: [{ type: "paragraph", text: "محتوى تركيا" }],
};
const article3 = {
  ...article,
  id: "article-3",
  slug: "compare-study-destinations",
  titleAr: "كيف تقارن بين وجهات الدراسة قبل اتخاذ القرار؟",
  summaryAr: "أسئلة مختصرة تساعدك على مقارنة الخيارات الأكاديمية بواقعية.",
  publishedAt: "2026-10-18T00:00:00.000Z",
  countryId: country3.id,
  universityId: null,
  scholarshipId: null,
  country: { id: country3.id, slug: country3.slug, nameAr: country3.nameAr },
  university: null,
  scholarship: null,
  featured: false,
  bodyAr: [
    { type: "heading2", text: "ما الذي تقارنه؟" },
    {
      type: "paragraph",
      text: "ابدأ بالبرنامج واللغة والتكلفة كما تظهر في المصادر الرسمية.",
    },
    { type: "heading2", text: "احتفظ بقائمة قصيرة" },
    {
      type: "numbered-list",
      text: "سجل النقاط التي تحتاج إلى سؤال عنها قبل الحسم.",
    },
  ],
};
const article4 = {
  ...article,
  id: "article-4",
  slug: "ielts-and-admission-plan",
  titleAr: "كيف تنظّم خطة IELTS وملف القبول الجامعي في وقت واحد؟",
  summaryAr: "طريقة عملية لموازنة التحضير للغة مع قائمة متطلبات القبول.",
  publishedAt: "2026-10-16T00:00:00.000Z",
  countryId: country.id,
  universityId: university.id,
  scholarshipId: scholarship3.id,
  scholarship: {
    id: scholarship3.id,
    slug: scholarship3.slug,
    titleAr: scholarship3.titleAr,
  },
  featured: true,
  bodyAr: [
    { type: "heading2", text: "خطة أسبوعية بسيطة" },
    {
      type: "paragraph",
      text: "قسّم وقتك بين مهارات IELTS ومراجعة متطلبات البرنامج دون افتراض موعد قبول أو درجة مضمونة.",
    },
    { type: "heading3", text: "القراءة والكتابة" },
    {
      type: "paragraph",
      text: "اجعل التدريب مرتبطًا بالأمثلة التعليمية الموثوقة التي تراجعها.",
    },
    { type: "heading2", text: "مراجعة الطلب" },
    {
      type: "paragraph",
      text: "أنشئ قائمة منفصلة لكل برنامج حتى لا تختلط النماذج والوثائق.",
    },
  ],
};
const article5 = {
  ...article,
  id: "article-5",
  slug: "quiet-study-note",
  titleAr: "رسالة قصيرة قبل بدء البحث عن جامعة",
  summaryAr: "ملاحظة هادئة لتذكيرك بأن وضوح الأولويات يسبق كثرة الخيارات.",
  publishedAt: "2026-10-14T00:00:00.000Z",
  countryId: null,
  universityId: null,
  scholarshipId: null,
  country: null,
  university: null,
  scholarship: null,
  coverImageUrl: null,
  coverImageAltAr: null,
  featured: false,
  bodyAr: [
    {
      type: "paragraph",
      text: "لا تحتاج إلى حسم كل التفاصيل اليوم. ابدأ بسؤال واضح، واقرأ المعلومات المنشورة، ثم دوّن ما ينقصك قبل طلب الإرشاد.",
    },
  ],
};
const article6 = {
  ...article,
  id: "article-6",
  slug: "romania-living-costs",
  titleAr:
    "ما الذي تسأل عنه عند تقدير تكاليف المعيشة أثناء الدراسة في رومانيا؟",
  summaryAr:
    "إطار أسئلة يسهّل مقارنة بنود الميزانية دون تقديم أرقام أو وعود غير موثقة.",
  publishedAt: "2026-10-12T00:00:00.000Z",
  countryId: country.id,
  universityId: null,
  scholarshipId: null,
  country: { id: country.id, slug: country.slug, nameAr: country.nameAr },
  university: null,
  scholarship: null,
  featured: false,
  bodyAr: [
    { type: "heading2", text: "بنود تحتاج إلى توثيق" },
    {
      type: "bulleted-list",
      text: "السكن والمواصلات كما تعرضها الجهات ذات الصلة.",
    },
    {
      type: "bulleted-list",
      text: "تكاليف الخدمات والنفقات الشخصية حسب نمطك.",
    },
    { type: "heading3", text: "لا تبنِ قرارك على تقدير واحد" },
    {
      type: "paragraph",
      text: "قارن مصادر موثوقة متعددة، وتذكر أن ظروف الطالب تختلف من حالة إلى أخرى.",
    },
  ],
};
const article7 = {
  ...article,
  id: "article-7",
  slug: "documents-before-application",
  titleAr: "خمسة أسئلة لمراجعة مستنداتك قبل إرسال طلب الدراسة",
  summaryAr: "قائمة مراجعة موجزة للوثائق الأساسية وترتيبها.",
  publishedAt: "2026-10-10T00:00:00.000Z",
  countryId: country2.id,
  universityId: university2.id,
  scholarshipId: scholarship2.id,
  country: { id: country2.id, slug: country2.slug, nameAr: country2.nameAr },
  university: {
    id: university2.id,
    slug: university2.slug,
    nameAr: university2.nameAr,
  },
  scholarship: {
    id: scholarship2.id,
    slug: scholarship2.slug,
    titleAr: scholarship2.titleAr,
  },
  featured: false,
  bodyAr: [
    { type: "heading2", text: "المراجعة الأخيرة" },
    { type: "numbered-list", text: "هل كل ملف مقروء ومسمّى بوضوح؟" },
    { type: "numbered-list", text: "هل راجعت لغة كل نموذج قبل الإرسال؟" },
    { type: "heading3", text: "بعد الإرسال" },
    {
      type: "paragraph",
      text: "احتفظ بنسخة من الملفات وتاريخ الإرسال في سجل خاص بك.",
    },
  ],
};
const article8 = {
  ...article,
  id: "article-8",
  slug: "university-questions",
  titleAr: "أسئلة مفيدة قبل اختيار الجامعة المناسبة",
  summaryAr: "مدخل مختصر لقراءة البرنامج والجامعة قبل إرسال أي طلب.",
  publishedAt: "2026-10-08T00:00:00.000Z",
  countryId: country3.id,
  universityId: null,
  scholarshipId: null,
  country: { id: country3.id, slug: country3.slug, nameAr: country3.nameAr },
  university: null,
  scholarship: null,
  featured: false,
  bodyAr: [
    { type: "heading2", text: "افهم البرنامج أولًا" },
    {
      type: "paragraph",
      text: "تحقق من الخطة الدراسية واللغة والمتطلبات المنشورة قبل أن تقارن الاسم أو الموقع فقط.",
    },
    { type: "heading2", text: "اسأل بوضوح" },
    { type: "quote", text: "السؤال المحدد يساعدك على طلب إرشاد أدق." },
  ],
};
const collections = {
  countries: [country, country2, country3],
  universities: [university, university2],
  scholarships: [scholarship, scholarship2, scholarship3],
  services: [service, service2],
  articles: [
    article,
    article2,
    article3,
    article4,
    article5,
    article6,
    article7,
    article8,
  ],
};

function matchesText(item, search) {
  if (!search) return true;
  return [
    item.nameAr,
    item.titleAr,
    item.summaryAr,
    item.introductionAr,
    item.overviewAr,
  ]
    .filter(Boolean)
    .join(" ")
    .includes(search);
}

function list(resource, query) {
  let items = [...collections[resource]];
  const search = query.get("search");
  if (search) items = items.filter((item) => matchesText(item, search));
  const featured = query.get("featured");
  if (featured === "true" || featured === "false")
    items = items.filter((item) => item.featured === (featured === "true"));
  for (const key of ["country", "university"])
    if (query.get(key))
      items = items.filter((item) => item[key]?.slug === query.get(key));
  for (const key of ["studyLevel", "fundingType", "applicationStatus"])
    if (query.get(key))
      items = items.filter((item) => item[key] === query.get(key));
  const sort = query.get("sort");
  if (sort === "name")
    items.sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
  else if (sort === "deadline")
    items.sort((a, b) =>
      String(a.verifiedDeadline ?? "9999").localeCompare(
        String(b.verifiedDeadline ?? "9999"),
      ),
    );
  else if (sort === "newest")
    items.sort((a, b) =>
      String(b.publishedAt).localeCompare(String(a.publishedAt)),
    );
  else if (sort === "manual")
    items.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const page = Math.max(1, Number(query.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(query.get("limit") ?? 12)));
  return {
    items: items.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  const [, api, version, resource, slug] = url.pathname.split("/");
  response.setHeader("content-type", "application/json");
  if (api !== "api" || version !== "v1" || !collections[resource]) {
    response.writeHead(404).end(JSON.stringify({ success: false }));
    return;
  }
  if (url.searchParams.get("search") === "serverError") {
    response.writeHead(500).end(JSON.stringify({ success: false }));
    return;
  }
  const items = collections[resource];
  if (slug) {
    const item = items.find((entry) => entry.slug === slug);
    if (!item) {
      response.writeHead(404).end(JSON.stringify({ success: false }));
      return;
    }
    response.end(JSON.stringify({ success: true, data: item }));
    return;
  }
  response.end(
    JSON.stringify({ success: true, data: list(resource, url.searchParams) }),
  );
}).listen(4010, "127.0.0.1", () =>
  console.log("Fixture API (development-only): http://127.0.0.1:4010"),
);
