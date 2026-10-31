import type { Country, Scholarship } from "@/api/public-content";

// Fictional directory examples only. These slugs also keep Demo detail navigation valid.
export const directoryDemoScholarshipSlugs = [
  "demo-global-discovery", "demo-language-pathways", "demo-research-fellowship", "demo-creative-studies",
  "demo-academic-bridge", "demo-science-exchange", "demo-graduate-path", "demo-open-learning",
] as const;

export function createDirectoryDemoScholarships(countries: readonly Country[]): Scholarship[] {
  const titles = [
    "منحة آفاق للتعلم الدولي — مثال تجريبي", "منحة مسارات لدراسة اللغات — مثال تجريبي",
    "منحة البحث الأكاديمي والتعاون بين التخصصات للطلاب الدوليين — مثال تجريبي", "منحة الإبداع للدراسات الجامعية — مثال تجريبي",
    "منحة الجسر الأكاديمي — مثال تجريبي", "منحة تبادل العلوم — مثال تجريبي",
    "منحة مسار الدراسات العليا — مثال تجريبي", "منحة التعلم المفتوح — مثال تجريبي",
  ];
  return directoryDemoScholarshipSlugs.map((slug, index) => {
    const country = index === 7 ? null : countries[index % countries.length];
    return {
      id: `demo-directory-scholarship-${index + 1}`, slug, featured: index % 3 === 0,
      publishedAt: `2026-10-${String(14 - index).padStart(2, "0")}T09:00:00.000Z`,
      seoTitleAr: null, seoDescriptionAr: null, titleAr: titles[index],
      titleEn: index === 7 ? null : `Fictional Academic Opportunity ${index + 1}`,
      countryId: country?.id ?? null, universityId: null,
      studyLevel: index === 7 ? "" : ["بكالوريوس", "ماجستير", "دكتوراه"][index % 3],
      fundingType: index === 7 ? "" : ["تمويل جزئي", "دعم رسوم", "تمويل كامل"][index % 3],
      requirementsAr: "بيانات خيالية للعرض التجريبي فقط، ولا تمثل فرصة متاحة للتقديم.", requirementsEn: null,
      descriptionAr: "سجل خيالي لاختبار تصميم الدليل والتصفية والتنقل. التواريخ توضيحية وليست مواعيد رسمية.", descriptionEn: null,
      verifiedDeadline: index % 3 === 0 ? null : `2027-0${index + 1}-15T00:00:00.000Z`,
      officialSourceUrl: null, applicationStatus: index % 3 === 1 ? "CLOSED" : "OPEN",
      effectiveApplicationStatus: index % 3 === 1 ? "CLOSED" : "OPEN",
      country: country ? { id: country.id, slug: country.slug, nameAr: country.nameAr } : null,
      university: null, status: "PUBLISHED", createdAt: "2026-10-01T09:00:00.000Z", updatedAt: "2026-10-01T09:00:00.000Z",
    };
  });
}

// Local academic illustrations are illustrative, never photographs of an advertised institution.
export const demoScholarshipMedia: Record<string, { src: string; alt: string; position?: string }> = {
  "romania-academic-scholarship": { src: "/images/hero/study-abroad-student-landmarks.png", alt: "طالب ومعالم دراسية — رسم توضيحي للعرض التجريبي", position: "center 32%" },
  "bucharest-excellence-scholarship": { src: "/images/hero/study-abroad-student-landmarks.png", alt: "رحلة أكاديمية — رسم توضيحي للعرض التجريبي", position: "center 55%" },
  "turkey-masters-scholarship": { src: "/images/trust/library-globe.jpg", alt: "مكتبة — صورة توضيحية للعرض التجريبي" },
  "ankara-study-grant": { src: "/images/hero/study-abroad-student-landmarks.png", alt: "طالب ومعالم دراسية — رسم توضيحي للعرض التجريبي", position: "center 40%" },
  "poland-research-scholarship": { src: "/images/trust/library-globe.jpg", alt: "كتب أكاديمية — صورة توضيحية للعرض التجريبي" },
  "demo-global-discovery": { src: "/images/journey/journey-background.png", alt: "استكشاف الوجهات — صورة توضيحية للعرض التجريبي" },
  "demo-language-pathways": { src: "/images/hero/study-abroad-student-landmarks.png", alt: "رحلة الدراسة — رسم توضيحي للعرض التجريبي", position: "center 35%" },
};
