import "server-only";
import { createDirectoryDemoScholarships } from "@/lib/mocks/scholarship-directory-fixtures";

import { ApiError } from "@/api/error";
import type {
  Article,
  ArticleListParams,
  Country,
  CountryListParams,
  Pagination,
  PublicList,
  Scholarship,
  ScholarshipListParams,
  Service,
  ServiceListParams,
  University,
  UniversityListParams,
} from "@/api/public-content";

const timestamp = "2026-10-01T09:00:00.000Z";
const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
const articleImages = [
  {
    src: "/images/hero/study-abroad-student-landmarks.png",
    alt: "طالبة تستعد للدراسة في الخارج",
  },
  { src: "/images/trust/library-globe.jpg", alt: "كرة أرضية وكتب في مكتبة" },
  {
    src: "/images/journey/journey-background.png",
    alt: "مسار الدراسة في الخارج",
  },
] as const;

const countries: Country[] = [
  {
    id: "demo-country-romania",
    slug: "romania",
    featured: true,
    publishedAt: "2026-10-20T09:00:00.000Z",
    seoTitleAr: "الدراسة في رومانيا | عرض تجريبي",
    seoDescriptionAr: "محتوى تجريبي عن الدراسة في رومانيا.",
    nameAr: "رومانيا",
    nameEn: "Romania",
    introductionAr:
      "وجهة أوروبية تجمع بين برامج جامعية متنوعة وتكاليف معيشة يمكن مقارنتها بهدوء.",
    introductionEn: null,
    detailsAr:
      "تساعدك هذه الصفحة التجريبية على ترتيب أسئلتك عن البرامج واللغة والوثائق قبل اتخاذ الخطوة التالية.",
    detailsEn: null,
    imageUrl: image("photo-1584646098378-0874589d76b1"),
    imageAltAr: "مشهد من رومانيا",
    imageAltEn: null,
    displayOrder: 5,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-country-turkey",
    slug: "turkey",
    featured: true,
    publishedAt: "2026-10-19T09:00:00.000Z",
    seoTitleAr: "الدراسة في تركيا | عرض تجريبي",
    seoDescriptionAr: "محتوى تجريبي عن الدراسة في تركيا.",
    nameAr: "تركيا",
    nameEn: "Turkey",
    introductionAr:
      "استكشف البرامج والجامعات المنشورة هنا كنموذج لبحث منظم عن وجهة الدراسة.",
    introductionEn: null,
    detailsAr:
      "اقرأ متطلبات كل برنامج من مصادره الرسمية، ثم دوّن الأسئلة التي تحتاج إلى إجابة قبل التقديم.",
    detailsEn: null,
    imageUrl: image("photo-1524231757912-21f4fe3a7200"),
    imageAltAr: "إطلالة على إسطنبول",
    imageAltEn: null,
    displayOrder: 1,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-country-poland",
    slug: "poland",
    featured: true,
    publishedAt: "2026-10-18T09:00:00.000Z",
    seoTitleAr: "الدراسة في بولندا | عرض تجريبي",
    seoDescriptionAr: "محتوى تجريبي عن الدراسة في بولندا.",
    nameAr: "بولندا",
    nameEn: "Poland",
    introductionAr:
      "وجهة تجريبية تساعد على مقارنة لغة الدراسة والتخصص والميزانية دون افتراضات غير موثقة.",
    introductionEn: null,
    detailsAr:
      "استخدم القوائم المنشورة من المؤسسات التعليمية للتحقق من الخطة الدراسية ومتطلبات القبول.",
    detailsEn: null,
    imageUrl: image("photo-1545289935-4ba21e98024b"),
    imageAltAr: "مشهد حضري في بولندا",
    imageAltEn: null,
    displayOrder: 6,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-country-hungary",
    slug: "hungary",
    featured: false,
    publishedAt: "2026-10-17T09:00:00.000Z",
    seoTitleAr: "الدراسة في المجر | عرض تجريبي",
    seoDescriptionAr: "محتوى تجريبي عن الدراسة في المجر.",
    nameAr: "المجر",
    nameEn: "Hungary",
    introductionAr:
      "مثال إضافي لوجهة دراسة يختبر التصفية والبحث والعلاقات بين المحتوى.",
    introductionEn: null,
    detailsAr:
      "قارن بين البرامج والوثائق المطلوبة من المصادر الرسمية، واحتفظ بسجل واضح لما تحتاجه.",
    detailsEn: null,
    imageUrl: image("photo-1551867633-194f125bddfa"),
    imageAltAr: "مبنى تاريخي في المجر",
    imageAltEn: null,
    displayOrder: 7,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  // Demo-only photos: Unsplash Malaysia vH9z9d6Mbd8, Cyprus HFlWsc4JH-s, and Britain MdJq0zFUwrw.
  {
    id: "demo-country-malaysia",
    slug: "malaysia",
    featured: true,
    publishedAt: "2026-10-18T09:00:00.000Z",
    seoTitleAr: "الدراسة في ماليزيا | عرض تجريبي",
    seoDescriptionAr: "محتوى تجريبي عن الدراسة في ماليزيا.",
    nameAr: "ماليزيا",
    nameEn: "Malaysia",
    introductionAr: "تعرّف على خيارات الدراسة في ماليزيا ضمن العرض التجريبي.",
    introductionEn: null,
    detailsAr:
      "هذه صفحة تجريبية لتنظيم الأسئلة حول الوجهة والبرامج ومتطلبات التقديم قبل الرجوع إلى المصادر الرسمية.",
    detailsEn: null,
    imageUrl: image("photo-1738681172857-4fb5dfe22f14"),
    imageAltAr: "أفق كوالالمبور في ماليزيا",
    imageAltEn: null,
    displayOrder: 2,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-country-cyprus",
    slug: "cyprus",
    featured: true,
    publishedAt: "2026-10-17T09:00:00.000Z",
    seoTitleAr: "الدراسة في قبرص | عرض تجريبي",
    seoDescriptionAr: "محتوى تجريبي عن الدراسة في قبرص.",
    nameAr: "قبرص",
    nameEn: "Cyprus",
    introductionAr: "اطّلع على خيارات الدراسة في قبرص ضمن العرض التجريبي.",
    introductionEn: null,
    detailsAr:
      "هذه صفحة تجريبية تساعد على ترتيب المقارنة بين الوجهات دون تقديم معلومات قبول غير موثقة.",
    detailsEn: null,
    imageUrl: image("photo-1631607608345-598c70e0410b"),
    imageAltAr: "ساحل البحر المتوسط في قبرص",
    imageAltEn: null,
    displayOrder: 3,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-country-united-kingdom",
    slug: "united-kingdom",
    featured: true,
    publishedAt: "2026-10-16T09:00:00.000Z",
    seoTitleAr: "الدراسة في بريطانيا | عرض تجريبي",
    seoDescriptionAr: "محتوى تجريبي عن الدراسة في بريطانيا.",
    nameAr: "بريطانيا",
    nameEn: "United Kingdom",
    introductionAr: "قارن خيارات الدراسة في بريطانيا ضمن العرض التجريبي.",
    introductionEn: null,
    detailsAr:
      "هذه صفحة تجريبية لعرض وجهة الدراسة وترتيب الأسئلة حول البرامج والوثائق من المصادر الرسمية.",
    detailsEn: null,
    imageUrl: image("photo-1454793147212-9e7e57e89a4f"),
    imageAltAr: "برج بيغ بن في لندن",
    imageAltEn: null,
    displayOrder: 4,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

const countryRef = (country: Country) => ({
  id: country.id,
  slug: country.slug,
  nameAr: country.nameAr,
  nameEn: country.nameEn,
});
const countryShortRef = (country: Country) => ({
  id: country.id,
  slug: country.slug,
  nameAr: country.nameAr,
});

const universities: University[] = [
  {
    id: "demo-university-bucharest",
    slug: "university-bucharest",
    featured: true,
    publishedAt: "2026-10-20T09:00:00.000Z",
    seoTitleAr: "جامعة بوخارست | عرض تجريبي",
    seoDescriptionAr: "محتوى تجريبي لجامعة بوخارست.",
    nameAr: "جامعة بوخارست",
    nameEn: "University of Bucharest",
    officialName: "University of Bucharest",
    countryId: countries[0].id,
    cityAr: "بوخارست",
    cityEn: "Bucharest",
    overviewAr:
      "بطاقة جامعة تجريبية مرتبطة برومانيا ومنح ومقالات للتصفح أثناء العرض.",
    overviewEn: null,
    officialWebsite: null,
    imageUrl: image("photo-1562774053-701939374585"),
    imageAltAr: "حرم جامعي",
    imageAltEn: null,
    country: countryRef(countries[0]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-university-polytechnic-bucharest",
    slug: "polytechnic-university-bucharest",
    featured: true,
    publishedAt: "2026-10-18T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    nameAr: "جامعة بوليتكنيكا بوخارست",
    nameEn: "POLITEHNICA Bucharest",
    officialName: "POLITEHNICA Bucharest",
    countryId: countries[0].id,
    cityAr: "بوخارست",
    cityEn: "Bucharest",
    overviewAr: "نموذج لمؤسسة تقنية ضمن وجهة رومانيا التجريبية.",
    overviewEn: null,
    officialWebsite: null,
    imageUrl: image("photo-1541339907198-e08756dedf3f"),
    imageAltAr: "مبنى جامعي",
    imageAltEn: null,
    country: countryRef(countries[0]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-university-istanbul",
    slug: "istanbul-university",
    featured: true,
    publishedAt: "2026-10-19T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    nameAr: "جامعة إسطنبول",
    nameEn: "Istanbul University",
    officialName: "Istanbul University",
    countryId: countries[1].id,
    cityAr: "إسطنبول",
    cityEn: "Istanbul",
    overviewAr:
      "بطاقة جامعة تجريبية لاختبار العلاقات مع المنح والمقالات في تركيا.",
    overviewEn: null,
    officialWebsite: null,
    imageUrl: image("photo-1523240795612-9a054b0db644"),
    imageAltAr: "طلاب في حرم جامعي",
    imageAltEn: null,
    country: countryRef(countries[1]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-university-middle-east-technical",
    slug: "middle-east-technical-university",
    featured: false,
    publishedAt: "2026-10-16T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    nameAr: "جامعة الشرق الأوسط التقنية",
    nameEn: "Middle East Technical University",
    officialName: "Middle East Technical University",
    countryId: countries[1].id,
    cityAr: "أنقرة",
    cityEn: "Ankara",
    overviewAr: "سجل تجريبي إضافي لاختبار البحث والفرز حسب الاسم.",
    overviewEn: null,
    officialWebsite: null,
    imageUrl: image("photo-1503676260728-1c00da094a0"),
    imageAltAr: "مساحة دراسة",
    imageAltEn: null,
    country: countryRef(countries[1]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-university-warsaw",
    slug: "university-of-warsaw",
    featured: true,
    publishedAt: "2026-10-17T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    nameAr: "جامعة وارسو",
    nameEn: "University of Warsaw",
    officialName: "University of Warsaw",
    countryId: countries[2].id,
    cityAr: "وارسو",
    cityEn: "Warsaw",
    overviewAr:
      "جامعة تجريبية مرتبطة ببولندا ومقالات المقارنة بين وجهات الدراسة.",
    overviewEn: null,
    officialWebsite: null,
    imageUrl: image("photo-1507842217343-583bb7270b66"),
    imageAltAr: "مكتبة جامعية",
    imageAltEn: null,
    country: countryRef(countries[2]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-university-budapest",
    slug: "eotvos-lorand-university",
    featured: false,
    publishedAt: "2026-10-15T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    nameAr: "جامعة إيتفوش لوراند",
    nameEn: "Eötvös Loránd University",
    officialName: "Eötvös Loránd University",
    countryId: countries[3].id,
    cityAr: "بودابست",
    cityEn: "Budapest",
    overviewAr: "نموذج لجامعة مرتبطة بالمجر في بيانات العرض فقط.",
    overviewEn: null,
    officialWebsite: null,
    imageUrl: image("photo-1523050854058-8df90110c9f1"),
    imageAltAr: "طلاب في الحرم الجامعي",
    imageAltEn: null,
    country: countryRef(countries[3]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

const universityShortRef = (university: University) => ({
  id: university.id,
  slug: university.slug,
  nameAr: university.nameAr,
});

const scholarships: Scholarship[] = [
  {
    id: "demo-scholarship-romania",
    slug: "romania-academic-scholarship",
    featured: true,
    publishedAt: "2026-10-20T09:00:00.000Z",
    seoTitleAr: "منحة رومانيا الأكاديمية | عرض تجريبي",
    seoDescriptionAr: "نموذج منحة تجريبي.",
    titleAr: "منحة رومانيا الأكاديمية",
    titleEn: null,
    countryId: countries[0].id,
    universityId: universities[0].id,
    studyLevel: "بكالوريوس",
    fundingType: "تمويل كامل",
    requirementsAr:
      "تحقق من متطلبات الجهة الرسمية قبل التقديم. هذه بيانات للعرض فقط.",
    requirementsEn: null,
    descriptionAr: "نموذج لمنحة مرتبطة برومانيا وجامعة بوخارست.",
    descriptionEn: null,
    verifiedDeadline: null,
    officialSourceUrl: null,
    applicationStatus: "OPEN",
    effectiveApplicationStatus: "OPEN",
    country: countryShortRef(countries[0]),
    university: universityShortRef(universities[0]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-scholarship-bucharest",
    slug: "bucharest-excellence-scholarship",
    featured: true,
    publishedAt: "2026-10-18T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "منحة التميز الأكاديمي في بوخارست",
    titleEn: null,
    countryId: countries[0].id,
    universityId: universities[1].id,
    studyLevel: "ماجستير",
    fundingType: "تمويل جزئي",
    requirementsAr:
      "اطلع على المعلومات الرسمية قبل الاعتماد عليها. هذا المثال للعرض فقط.",
    requirementsEn: null,
    descriptionAr: "منحة تجريبية ثانية لاختبار الفرز والعلاقات.",
    descriptionEn: null,
    verifiedDeadline: null,
    officialSourceUrl: null,
    applicationStatus: "OPEN",
    effectiveApplicationStatus: "OPEN",
    country: countryShortRef(countries[0]),
    university: universityShortRef(universities[1]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-scholarship-turkey",
    slug: "turkey-masters-scholarship",
    featured: true,
    publishedAt: "2026-10-19T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "منحة تركيا للدراسات العليا",
    titleEn: null,
    countryId: countries[1].id,
    universityId: universities[2].id,
    studyLevel: "ماجستير",
    fundingType: "تمويل كامل",
    requirementsAr:
      "هذه بيانات تجريبية ولا تمثل إعلانًا رسميًا أو موعدًا معتمدًا.",
    requirementsEn: null,
    descriptionAr: "منحة مغلقة تبقى مرئية لاختبار تمييز حالة التقديم.",
    descriptionEn: null,
    verifiedDeadline: null,
    officialSourceUrl: null,
    applicationStatus: "CLOSED",
    effectiveApplicationStatus: "CLOSED",
    country: countryShortRef(countries[1]),
    university: universityShortRef(universities[2]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-scholarship-ankara",
    slug: "ankara-study-grant",
    featured: false,
    publishedAt: "2026-10-16T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "دعم الدراسة في أنقرة",
    titleEn: null,
    countryId: countries[1].id,
    universityId: universities[3].id,
    studyLevel: "بكالوريوس",
    fundingType: "دعم رسوم",
    requirementsAr: "نموذج متطلبات للعرض فقط.",
    requirementsEn: null,
    descriptionAr: "مثال إضافي لنتائج التصفية حسب البلد والجامعة.",
    descriptionEn: null,
    verifiedDeadline: null,
    officialSourceUrl: null,
    applicationStatus: "OPEN",
    effectiveApplicationStatus: "OPEN",
    country: countryShortRef(countries[1]),
    university: universityShortRef(universities[3]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-scholarship-poland",
    slug: "poland-research-scholarship",
    featured: true,
    publishedAt: "2026-10-17T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "منحة البحث في بولندا",
    titleEn: null,
    countryId: countries[2].id,
    universityId: universities[4].id,
    studyLevel: "دكتوراه",
    fundingType: "تمويل كامل",
    requirementsAr:
      "نموذج معلومات عرض، يرجى الرجوع إلى المصدر الرسمي عند النشر الفعلي.",
    requirementsEn: null,
    descriptionAr: "منحة مرتبطة بجامعة وارسو في بيانات العرض.",
    descriptionEn: null,
    verifiedDeadline: null,
    officialSourceUrl: null,
    applicationStatus: "OPEN",
    effectiveApplicationStatus: "OPEN",
    country: countryShortRef(countries[2]),
    university: universityShortRef(universities[4]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-scholarship-hungary",
    slug: "hungary-language-preparation",
    featured: false,
    publishedAt: "2026-10-15T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "دعم التحضير اللغوي في المجر",
    titleEn: null,
    countryId: countries[3].id,
    universityId: universities[5].id,
    studyLevel: "بكالوريوس",
    fundingType: "دعم جزئي",
    requirementsAr: "نموذج تجريبي لا يشكل دعوة للتقديم.",
    requirementsEn: null,
    descriptionAr: "سجل مستقل لاختبار ظهور الخيارات غير المميزة.",
    descriptionEn: null,
    verifiedDeadline: null,
    officialSourceUrl: null,
    applicationStatus: "CLOSED",
    effectiveApplicationStatus: "CLOSED",
    country: countryShortRef(countries[3]),
    university: universityShortRef(universities[5]),
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

// Additional fictional records exercise directory pagination without changing existing university relationships.
scholarships.push(...createDirectoryDemoScholarships(countries));

const services: Service[] = [
  {
    id: "demo-service-destination",
    slug: "destination-guidance",
    featured: true,
    publishedAt: "2026-10-20T09:00:00.000Z",
    seoTitleAr: "استشارة اختيار الوجهة | عرض تجريبي",
    seoDescriptionAr: "خدمة تجريبية لأغراض العرض.",
    titleAr: "استشارة اختيار الوجهة",
    titleEn: null,
    summaryAr: "تنظيم أسئلة المقارنة بين وجهات الدراسة المتاحة.",
    summaryEn: null,
    descriptionAr:
      "خدمة تجريبية تعرض كيفية تقديم وصف الخدمة المنشورة ضمن الواجهة.",
    descriptionEn: null,
    imageUrl: null,
    imageAltAr: null,
    imageAltEn: null,
    displayOrder: 11,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-service-university",
    slug: "university-guidance",
    featured: true,
    publishedAt: "2026-10-19T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "إرشاد اختيار الجامعة",
    titleEn: null,
    summaryAr: "مساعدة تعليمية لترتيب أسئلة مقارنة البرامج الجامعية.",
    summaryEn: null,
    descriptionAr: "خدمة تجريبية مرتبطة بعرض المحتوى فقط.",
    descriptionEn: null,
    imageUrl: null,
    imageAltAr: null,
    imageAltEn: null,
    displayOrder: 12,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-service-application",
    slug: "application-preparation",
    featured: true,
    publishedAt: "2026-10-18T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "تنظيم ملف التقديم",
    titleEn: null,
    summaryAr: "قائمة هادئة لمراجعة الوثائق قبل إرسال طلب القبول.",
    summaryEn: null,
    descriptionAr:
      "مثال لخدمة عرض تساعد على التحقق من بطاقات القائمة والتفاصيل.",
    descriptionEn: null,
    imageUrl: null,
    imageAltAr: null,
    imageAltEn: null,
    displayOrder: 13,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-service-visa",
    slug: "visa-guidance",
    featured: false,
    publishedAt: "2026-10-16T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "إرشاد وثائق التأشيرة",
    titleEn: null,
    summaryAr: "تجهيز قائمة أسئلة حول الوثائق المنشورة من الجهات الرسمية.",
    summaryEn: null,
    descriptionAr: "خدمة تجريبية رابعة لاختبار الترتيب اليدوي والتصفية.",
    descriptionEn: null,
    imageUrl: null,
    imageAltAr: null,
    imageAltEn: null,
    displayOrder: 14,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-service-admissions",
    slug: "university-admissions",
    featured: true,
    publishedAt: "2026-10-21T09:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "القبول الجامعي",
    titleEn: null,
    summaryAr: "مساعدتك في القبول والتسجيل",
    summaryEn: null,
    descriptionAr:
      "مثال تجريبي لتنظيم الأسئلة حول متطلبات القبول والتسجيل المنشورة من الجامعة.",
    descriptionEn: null,
    imageUrl: null,
    imageAltAr: null,
    imageAltEn: null,
    displayOrder: 1,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-service-major",
    slug: "major-selection",
    featured: true,
    publishedAt: "2026-10-21T08:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "اختيار التخصص",
    titleEn: null,
    summaryAr: "مساعدتك في اختيار التخصص الأنسب",
    summaryEn: null,
    descriptionAr:
      "مثال تجريبي يساعد على ترتيب معايير مقارنة التخصصات والبرامج المنشورة.",
    descriptionEn: null,
    imageUrl: null,
    imageAltAr: null,
    imageAltEn: null,
    displayOrder: 2,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-service-scholarships",
    slug: "scholarship-guidance",
    featured: true,
    publishedAt: "2026-10-21T07:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "المنح الدراسية",
    titleEn: null,
    summaryAr: "البحث والتقديم على المنح",
    summaryEn: null,
    descriptionAr:
      "مثال تجريبي لمقارنة شروط المنح المنشورة والتحقق من مصادرها الرسمية قبل التقديم.",
    descriptionEn: null,
    imageUrl: null,
    imageAltAr: null,
    imageAltEn: null,
    displayOrder: 3,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-service-file",
    slug: "file-preparation",
    featured: true,
    publishedAt: "2026-10-21T06:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "تجهيز الملف",
    titleEn: null,
    summaryAr: "مراجعة وتجهيز جميع المستندات",
    summaryEn: null,
    descriptionAr:
      "مثال تجريبي لتنظيم قائمة المستندات ومراجعتها مقابل متطلبات الجهة الرسمية.",
    descriptionEn: null,
    imageUrl: null,
    imageAltAr: null,
    imageAltEn: null,
    displayOrder: 4,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "demo-service-follow-up",
    slug: "admission-follow-up",
    featured: true,
    publishedAt: "2026-10-21T05:00:00.000Z",
    seoTitleAr: null,
    seoDescriptionAr: null,
    titleAr: "متابعة القبول",
    titleEn: null,
    summaryAr: "متابعة مستمرة حتى صدور القبول",
    summaryEn: null,
    descriptionAr:
      "مثال تجريبي لتتبع أسئلة الطلب ومراحله دون تمثيل خدمة فعلية أو حالة قبول مؤكدة.",
    descriptionEn: null,
    imageUrl: null,
    imageAltAr: null,
    imageAltEn: null,
    displayOrder: 5,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

const articleBlocks: Article["bodyAr"] = [
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
    text: "الميزانية وخيارات التمويل من المصدر الرسمي.",
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
  { type: "heading2", text: "المراجعة الأخيرة" },
  { type: "numbered-list", text: "سمِّ الملفات بوضوح وبصيغة تقبلها البوابة." },
  { type: "numbered-list", text: "احتفظ بسجل لتواريخ الإرسال والردود." },
  {
    type: "quote",
    text: "التخطيط الهادئ لا يضمن القبول، لكنه يجعل قرارك وملفك أكثر وضوحًا.",
  },
];

function article(
  id: number,
  slug: string,
  titleAr: string,
  summaryAr: string,
  country: Country | null,
  university: University | null,
  scholarship: Scholarship | null,
  bodyAr: Article["bodyAr"] = articleBlocks,
  featured = false,
): Article {
  const coverImage = articleImages[(id - 1) % articleImages.length];
  return {
    id: `demo-article-${id}`,
    slug,
    featured,
    publishedAt: new Date(Date.UTC(2026, 9, 21 - id)).toISOString(),
    seoTitleAr:
      id === 1 ? "دليل تجهيز ملف الدراسة في الخارج | عرض تجريبي" : null,
    seoDescriptionAr:
      id === 1 ? "دليل تجريبي لتنظيم ملف الدراسة والوثائق الأساسية." : null,
    titleAr,
    titleEn: null,
    summaryAr,
    summaryEn: null,
    bodyAr,
    bodyEn: null,
    coverImageUrl: coverImage?.src ?? null,
    coverImageAltAr: coverImage?.alt ?? null,
    coverImageAltEn: null,
    countryId: country?.id ?? null,
    universityId: university?.id ?? null,
    scholarshipId: scholarship?.id ?? null,
    country: country ? countryShortRef(country) : null,
    university: university ? universityShortRef(university) : null,
    scholarship: scholarship
      ? {
          id: scholarship.id,
          slug: scholarship.slug,
          titleAr: scholarship.titleAr,
        }
      : null,
    status: "PUBLISHED",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

const shortBody: Article["bodyAr"] = [
  {
    type: "paragraph",
    text: "لا تحتاج إلى حسم كل التفاصيل اليوم. ابدأ بسؤال واضح، واقرأ المعلومات المنشورة، ثم دوّن ما ينقصك قبل طلب الإرشاد.",
  },
];
const articles: Article[] = [
  article(
    1,
    "study-guide",
    "دليل تجهيز ملف الدراسة في الخارج: من اختيار التخصص إلى مراجعة الوثائق",
    "خطوات عملية تساعدك على تنظيم ملفك الدراسي بهدوء قبل بدء طلبات القبول.",
    countries[0],
    universities[0],
    scholarships[0],
    articleBlocks,
    true,
  ),
  article(
    2,
    "turkey-guide",
    "دليل أولي للدراسة في تركيا",
    "أسئلة بداية تساعدك على قراءة المعلومات المنشورة بهدوء.",
    countries[1],
    universities[2],
    scholarships[2],
    shortBody,
  ),
  article(
    3,
    "compare-study-destinations",
    "كيف تقارن بين وجهات الدراسة قبل اتخاذ القرار؟",
    "أسئلة مختصرة تساعدك على مقارنة الخيارات الأكاديمية بواقعية.",
    countries[2],
    universities[4],
    scholarships[4],
  ),
  article(
    4,
    "ielts-and-admission-plan",
    "كيف تنظّم خطة IELTS وملف القبول الجامعي في وقت واحد؟",
    "طريقة عملية لموازنة التحضير للغة مع قائمة متطلبات القبول.",
    countries[0],
    universities[0],
    scholarships[1],
    articleBlocks,
    true,
  ),
  article(
    5,
    "quiet-study-note",
    "رسالة قصيرة قبل بدء البحث عن جامعة",
    "ملاحظة هادئة لتذكيرك بأن وضوح الأولويات يسبق كثرة الخيارات.",
    null,
    null,
    null,
    shortBody,
  ),
  article(
    6,
    "romania-living-costs",
    "ما الذي تسأل عنه عند تقدير تكاليف المعيشة أثناء الدراسة في رومانيا؟",
    "إطار أسئلة يسهّل مقارنة بنود الميزانية دون تقديم أرقام أو وعود غير موثقة.",
    countries[0],
    universities[1],
    scholarships[1],
  ),
  article(
    7,
    "documents-before-application",
    "خمسة أسئلة لمراجعة مستنداتك قبل إرسال طلب الدراسة",
    "قائمة مراجعة موجزة للوثائق الأساسية وترتيبها.",
    countries[1],
    universities[2],
    scholarships[2],
  ),
  article(
    8,
    "university-questions",
    "أسئلة مفيدة قبل اختيار الجامعة المناسبة",
    "مدخل مختصر لقراءة البرنامج والجامعة قبل إرسال أي طلب.",
    countries[2],
    universities[4],
    scholarships[4],
  ),
  article(
    9,
    "how-to-read-admission-requirements",
    "كيف تقرأ متطلبات القبول دون أن يفوتك تفصيل مهم؟",
    "خطوات قصيرة لتنظيم ما تقرأه في صفحة البرنامج.",
    countries[3],
    universities[5],
    scholarships[5],
  ),
  article(
    10,
    "budget-planning-notes",
    "ملاحظات بسيطة لبناء ميزانية دراسة واقعية",
    "طريقة لتجميع الأسئلة قبل مقارنة التكاليف المنشورة.",
    countries[0],
    null,
    null,
  ),
  article(
    11,
    "choosing-study-level",
    "كيف تختار المستوى الدراسي المناسب لخطة التقديم؟",
    "أفكار أولية للتمييز بين الأولويات الأكاديمية والوثائق المطلوبة.",
    countries[1],
    universities[3],
    scholarships[3],
  ),
  article(
    12,
    "research-before-contact",
    "ماذا تجمع قبل طلب استشارة تعليمية؟",
    "قائمة موجزة تجعل المحادثة التعليمية أكثر وضوحًا.",
    countries[2],
    null,
    null,
  ),
  article(
    13,
    "application-timeline",
    "كيف تنشئ جدولًا زمنيًا هادئًا لطلبات الدراسة؟",
    "توزيع مراحل التقديم دون وعد بنتيجة أو موعد رسمي.",
    countries[3],
    universities[5],
    scholarships[5],
  ),
];

type DemoResource = Country | University | Scholarship | Service | Article;
type ListParams =
  | CountryListParams
  | UniversityListParams
  | ScholarshipListParams
  | ServiceListParams
  | ArticleListParams;

export const publicDemoContent = {
  countries,
  universities,
  scholarships,
  services,
  articles,
} as const;

function normalizePage(value: number | undefined) {
  return value && Number.isInteger(value) && value > 0 ? value : 1;
}
function normalizeLimit(value: number | undefined) {
  return value && Number.isInteger(value) && value > 0
    ? Math.min(value, 50)
    : 12;
}

function includesSearch(item: DemoResource, search: string) {
  const text = [
    "nameAr" in item ? item.nameAr : undefined,
    "nameEn" in item ? item.nameEn : undefined,
    "titleAr" in item ? item.titleAr : undefined,
    "applicationStatus" in item ? item.titleEn : undefined,
    "summaryAr" in item ? item.summaryAr : undefined,
    "introductionAr" in item ? item.introductionAr : undefined,
    "overviewAr" in item ? item.overviewAr : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  return text.toLocaleLowerCase().includes(search.toLocaleLowerCase());
}

function listDemo<T extends DemoResource>(
  source: readonly T[],
  params: ListParams,
): PublicList<T> {
  let items = [...source];
  const search = "search" in params ? params.search : undefined;
  if (search) items = items.filter((item) => includesSearch(item, search));
  if (params.featured === "true" || params.featured === "false")
    items = items.filter(
      (item) => item.featured === (params.featured === "true"),
    );
  if ("country" in params && params.country)
    items = items.filter(
      (item) => "country" in item && item.country?.slug === params.country,
    );
  if ("university" in params && params.university)
    items = items.filter(
      (item) =>
        "university" in item && item.university?.slug === params.university,
    );
  if ("studyLevel" in params && params.studyLevel)
    items = items.filter(
      (item) => "studyLevel" in item && item.studyLevel === params.studyLevel,
    );
  if ("fundingType" in params && params.fundingType)
    items = items.filter(
      (item) =>
        "fundingType" in item && item.fundingType === params.fundingType,
    );
  if ("applicationStatus" in params && params.applicationStatus)
    items = items.filter(
      (item) =>
        "applicationStatus" in item &&
        (item.effectiveApplicationStatus ?? item.applicationStatus) === params.applicationStatus,
    );
  if (params.sort === "manual")
    items.sort(
      (a, b) =>
        ("displayOrder" in a ? a.displayOrder : 0) -
        ("displayOrder" in b ? b.displayOrder : 0),
    );
  if (params.sort === "newest")
    items.sort((a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
    );
  if (params.sort === "name")
    items.sort((a, b) =>
      ("nameAr" in a ? a.nameAr : "").localeCompare(
        "nameAr" in b ? b.nameAr : "",
        "ar",
      ),
    );
  if (params.sort === "deadline")
    items.sort((a, b) =>
      ("verifiedDeadline" in a
        ? (a.verifiedDeadline ?? "9999")
        : "9999"
      ).localeCompare(
        "verifiedDeadline" in b ? (b.verifiedDeadline ?? "9999") : "9999",
      ),
    );
  const page = normalizePage(params.page);
  const limit = normalizeLimit(params.limit);
  const pagination: Pagination = {
    page,
    limit,
    total: items.length,
    totalPages: Math.ceil(items.length / limit),
  };
  return { items: items.slice((page - 1) * limit, page * limit), pagination };
}

function detail<T extends { slug: string }>(
  source: readonly T[],
  slug: string,
  resource: string,
) {
  const item = source.find((entry) => entry.slug === slug);
  if (!item) throw new ApiError(404, `${resource} was not found.`);
  return item;
}

export const getDemoCountries = (params: CountryListParams = {}) =>
  Promise.resolve(listDemo(countries, params));
export const getDemoCountry = (slug: string) =>
  Promise.resolve(detail(countries, slug, "Country"));
export const getDemoUniversities = (params: UniversityListParams = {}) =>
  Promise.resolve(listDemo(universities, params));
export const getDemoUniversity = (slug: string) =>
  Promise.resolve(detail(universities, slug, "University"));
export const getDemoScholarships = (params: ScholarshipListParams = {}) =>
  Promise.resolve(listDemo(scholarships, params));
export const getDemoScholarship = (slug: string) =>
  Promise.resolve(detail(scholarships, slug, "Scholarship"));
export const getDemoServices = (params: ServiceListParams = {}) =>
  Promise.resolve(listDemo(services, params));
export const getDemoService = (slug: string) =>
  Promise.resolve(detail(services, slug, "Service"));
export const getDemoArticles = (params: ArticleListParams = {}) =>
  Promise.resolve(listDemo(articles, params));
export const getDemoArticle = (slug: string) =>
  Promise.resolve(detail(articles, slug, "Article"));
