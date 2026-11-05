import type { CountryInformationItem } from "@/components/public/country-information";
import type { CountryStudyGuidePanel } from "@/components/public/country-study-guide";
import { homeCardText } from "@/lib/homepage-card-content";

export const countryFactTitles = ["لغة الدراسة", "التكاليف الدراسية", "متطلبات القبول", "مواعيد التقديم"] as const;

// Frontend presentation slots, not fields inferred from detailsAr or a future API.
export function completeCountryFacts(items: readonly CountryInformationItem[] = []) {
  return countryFactTitles.map((title) => ({ title, value: homeCardText(items.find((item) => item.title === title || (title === "مواعيد التقديم" && item.title === "مواعيد الدراسة"))?.value, title) }));
}

const approvedCountryNames: Record<string, string> = {
  romania: "رومانيا", turkey: "تركيا", poland: "بولندا", hungary: "المجر",
  malaysia: "ماليزيا", cyprus: "قبرص", "united-kingdom": "بريطانيا",
};

/** Existing approved preparation copy; no fees, dates, languages or eligibility claims. */
export function approvedCountryGuide(name: string): CountryStudyGuidePanel[] {
  return [
    { title: "نظام الدراسة والتخصصات", introduction: `في نموذج التخطيط للدراسة في ${name}، ابدأ بتحديد المرحلة والتخصص ثم قارن لغة التدريس والمقررات، بدل الاكتفاء باسم الجامعة.`, steps: ["أنشئ قائمة قصيرة بالتخصصات، وسجّل المرحلة ولغة التدريس من صفحة كل تخصص.", "قارن محتوى المقررات وطريقة الدراسة، ثم احفظ رابط المصدر وتاريخ مراجعته."] },
    { title: "القبول والوثائق المطلوبة", introduction: `جهّز ملف متابعة للتخصصات التي تهتم بها في ${name}، دون افتراض أن جميع الجامعات تطلب الوثائق نفسها.`, steps: ["انسخ قائمة الوثائق من صفحة القبول الخاصة بالتخصص والمرحلة الدراسية، وحدّد ما يحتاج إلى ترجمة أو مراجعة وفق المصدر نفسه.", "دوّن أسئلة إثبات اللغة وطريقة إرسال الملف، وتحقق من الإجابات لدى الجامعة قبل تقديم أي مستند."] },
    { title: "التكاليف والحياة الطلابية", introduction: `ابنِ نموذج ميزانية لوجهتك في ${name} بعد اختيار المدينة والتخصص. لا يتضمن العرض أرقامًا مالية معتمدة.`, steps: ["افصل الرسوم الدراسية للتخصص عن السكن والنقل والمعيشة، وسجّل العملة والفترة والسنة لكل سعر موثّق.", "راجع ما تغطيه المنحة إن وجدت، وما يبقى على الطالب، قبل مقارنة الميزانيات أو دفع أي رسوم."] },
  ];
}

export function unavailableCountryGuide(slug: string, name: string): CountryStudyGuidePanel[] {
  const identified = Object.hasOwn(approvedCountryNames, slug) && approvedCountryNames[slug] === name;
  return approvedCountryGuide(name).map((panel) => ({
    title: homeCardText(undefined, panel.title),
    introduction: homeCardText(undefined, "إرشادات الدراسة", identified ? panel.introduction : undefined),
    steps: identified ? panel.steps.map((step) => homeCardText(undefined, "خطوات التحضير", step)) : [homeCardText(undefined, "خطوات التحضير")],
  }));
}
