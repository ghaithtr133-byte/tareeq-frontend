import "server-only";
import type { University } from "@/lib/api-client/public-content";
import { emptyUniversityContent, type UniversityDetailContent, type UniversityProgram } from "@/lib/university-details";

// Fictional complete, small datasets. These are UI labels, not invented API enum values.
// Keep the first program consistent with the existing Demo directory's filters.
const examples: Record<string, { name: string; faculty: string; language: string; level: string }> = {
  "university-bucharest": { name: "الطب", faculty: "الطب", language: "الإنجليزية", level: "بكالوريوس" },
  "polytechnic-university-bucharest": { name: "الهندسة", faculty: "الهندسة", language: "الرومانية", level: "بكالوريوس" },
  "istanbul-university": { name: "الطب", faculty: "الطب", language: "التركية", level: "بكالوريوس" },
  "middle-east-technical-university": { name: "الهندسة", faculty: "الهندسة", language: "الإنجليزية", level: "ماجستير" },
  "university-of-warsaw": { name: "إدارة الأعمال", faculty: "الإدارة", language: "الإنجليزية", level: "ماجستير" },
  "eotvos-lorand-university": { name: "الهندسة", faculty: "الهندسة", language: "الإنجليزية", level: "بكالوريوس" },
};
export function demoUniversityDetails(university: University): UniversityDetailContent {
  const example = examples[university.slug];
  if (!university.id.startsWith("demo-university-") || !example) return emptyUniversityContent();
  const programs: UniversityProgram[] = [
    { id: `${university.id}-1`, ...example, duration: "٤ سنوات — مثال", tuition: { amount: 4000, currency: "EUR", period: "سنوياً — مثال فقط", academicYear: "2026–2027" } },
    { id: `${university.id}-2`, name: "إدارة الأعمال", faculty: "الإدارة", level: university.slug === "university-bucharest" ? "ماجستير" : example.level,
      language: university.slug === "university-bucharest" ? "الرومانية" : example.language, duration: "سنتان — مثال", tuition: { amount: 2500, currency: "EUR" } },
    { id: `${university.id}-3`, name: "علوم الحاسوب", faculty: "العلوم", language: "الإنجليزية", level: example.level, duration: null, tuition: null },
    { id: `${university.id}-4`, name: "الاقتصاد", faculty: "الإدارة", language: example.language, level: example.level, duration: "٣ سنوات — مثال", tuition: { amount: 0, currency: "EUR", period: "مثال دون رسوم" } },
  ];
  return {
    programs,
    admissions: [
      `مثال تجريبي لملف تقديم إلى ${university.nameAr}: نسخة من المؤهل الدراسي وكشف الدرجات.`,
      "قد يتضمن نموذج العرض إثبات لغة الدراسة. هذه أمثلة وليست شروط قبول رسمية، ويجب مراجعة الجامعة قبل التقديم.",
    ],
    // No authentic campus collection is available; never relabel stock photos as this university.
    gallery: [],
    logo: university.id === "demo-university-bucharest" ? "/images/universities/university-of-bucharest.svg" : null,
    faqs: [
      { question: `هل الرسوم المعروضة تخص ${university.nameAr} فعلياً؟`, answer: "لا. التخصصات والأسعار في هذا العرض أمثلة خيالية لا تمثل رسوماً رسمية أو عرضاً للتقديم." },
      { question: `ما لغات التخصصات في نموذج ${university.nameAr}؟`, answer: `يتضمن هذا النموذج: ${[...new Set(programs.map((program) => program.language))].join("، ")}. هذه بيانات تجريبية وليست تأكيداً للغات التخصصات الفعلية.` },
      { question: `كيف أستفسر عن الدراسة في ${university.nameAr}؟`, answer: `استخدم زر الاستفسار عبر واتساب واذكر ${university.nameAr} والتخصص المطلوب. الاستفسار ليس طلب قبول رسمياً ولا يضمن القبول.` },
    ],
  };
}
