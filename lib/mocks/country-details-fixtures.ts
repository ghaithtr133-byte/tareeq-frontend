import "server-only";
import type { Country } from "@/lib/api-client/public-content";
import { getCountryOverviewImage } from "@/lib/country-overview-images";
import type { CountryStudyGuidePanel } from "@/components/public/country-study-guide";
import { approvedCountryGuide } from "@/lib/country-detail-content";

export type DemoCountryDetails = NonNullable<ReturnType<typeof getDemoCountryDetails>>;

// Presentation-only Demo fixtures; these are not additions to the Country API contract.
const languages: Record<string, string> = {
  "demo-country-romania": "الرومانية أو الإنجليزية بحسب التخصص التجريبي",
  "demo-country-turkey": "التركية أو الإنجليزية بحسب التخصص التجريبي",
  "demo-country-poland": "البولندية أو الإنجليزية بحسب التخصص التجريبي",
  "demo-country-hungary": "المجرية أو الإنجليزية بحسب التخصص التجريبي",
  "demo-country-malaysia": "الماليزية أو الإنجليزية بحسب التخصص التجريبي",
  "demo-country-cyprus": "تختلف اللغة بحسب التخصص التجريبي",
  "demo-country-united-kingdom": "الإنجليزية في نموذج التخصص التجريبي",
};

// Fictional scenario values, never official fees, intake calendars or admission policies.
const scenarios: Record<string, { budget: string; preparation: string }> = {
  "demo-country-romania": { budget: "٤٬٠٠٠ يورو", preparation: "مارس ٢٠٢٧" },
  "demo-country-turkey": { budget: "٣٬٠٠٠ دولار", preparation: "أبريل ٢٠٢٧" },
  "demo-country-poland": { budget: "٣٬٥٠٠ يورو", preparation: "فبراير ٢٠٢٧" },
  "demo-country-hungary": { budget: "٤٬٥٠٠ يورو", preparation: "مارس ٢٠٢٧" },
  "demo-country-malaysia": { budget: "٣٬٥٠٠ دولار", preparation: "مايو ٢٠٢٧" },
  "demo-country-cyprus": { budget: "٤٬٠٠٠ يورو", preparation: "أبريل ٢٠٢٧" },
  "demo-country-united-kingdom": { budget: "١٢٬٠٠٠ جنيه إسترليني", preparation: "يناير ٢٠٢٧" },
};

export function getDemoCountryDetails(country: Country) {
  const language = languages[country.id];
  if (!language) return null;
  const name = country.nameAr;
  const scenario = scenarios[country.id];
  return {
    overviewImage: getCountryOverviewImage(country.slug),
    overview: `في نموذج التخطيط للدراسة في ${name}، ابدأ بتحديد المرحلة والتخصص ثم قارن لغة التدريس ومقررات التخصص، بدل الاكتفاء باسم الجامعة. ${language}. هذه أمثلة للبحث وليست تأكيدًا لتوفر تخصص بعينه في مرحلة دراسية محددة.\n\nاجمع روابط التخصصات التي تهمك في ${name}، وسجّل الوثائق والرسوم والمواعيد من مصادرها الرسمية قبل اتخاذ قرارك. احتفظ بتاريخ مراجعة كل مصدر، وميّز بين شروط الجامعة وشروط أي منحة تفكر بها.`,
    facts: [
      { title: "لغة الدراسة", value: language },
      { title: "التكاليف الدراسية", value: `${scenario.budget} / سنة افتراضية؛ ليست رسومًا فعلية.` },
      { title: "متطلبات القبول", value: "شهادة سابقة وكشف درجات (مثال افتراضي)." },
      { title: "مواعيد التقديم", value: `${scenario.preparation} (خطة افتراضية، ليست موعد تقديم).` },
    ],
    // All four examples stay inside this server-only, explicitly selected Demo fixture.
    guide: approvedCountryGuide(name) satisfies CountryStudyGuidePanel[],
    faqs: [
      { question: `كيف أبدأ البحث عن جامعة في ${name}؟`, answer: `في هذا العرض التجريبي، يمكنك استخدام زر «استكشف جامعات ${name}» لعرض الجامعات المرتبطة بهذه الوجهة، ثم مقارنة التخصصات من مصادرها الرسمية.` },
      { question: `كيف أتحقق من لغة الدراسة في ${name}؟`, answer: `نموذج اللغة التجريبي: ${language}. لا يمثل ذلك تأكيدًا للغة تخصص في مرحلة دراسية محددة؛ تحقّق من صفحة التخصص ومتطلبات إثبات اللغة.` },
      { question: `كيف أقارن تكاليف الدراسة في ${name}؟`, answer: "اجمع الرسوم الدراسية للتخصص والسكن وبنود الميزانية من المصادر الرسمية. لا يقدم هذا العرض التجريبي أسعارًا أو تقديرات مالية معتمدة." },
      { question: `ما الوثائق التي أراجعها قبل التقديم في ${name}؟`, answer: "ابدأ بقائمة الجامعة المنشورة للتخصص والمرحلة التي تختارها. تختلف الوثائق والترجمات المطلوبة، ولا تمثل هذه الإجابة قائمة قبول رسمية." },
      { question: `أين أجد المنح المرتبطة بوجهة ${name}؟`, answer: `استخدم زر «استكشف منح ${name}» لفتح دليل المنح مع فلتر الدولة. راجع حالة التقديم والشروط والمصدر الرسمي لكل منحة.` },
      { question: `كيف أرتب أسئلتي حول الدراسة في ${name}؟`, answer: `دوّن التخصص والمرحلة ولغة الدراسة التي تبحث عنها، ثم تواصل مع فريق طريق واذكر ${name} كوجهة اهتمامك. لا يتضمن الإرشاد ضمانًا للقبول أو التمويل.` },
    ],
  };
}
