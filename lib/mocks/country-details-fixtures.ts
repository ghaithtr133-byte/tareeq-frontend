import "server-only";
import type { Country } from "@/api/public-content";
import { getCountryOverviewImage } from "@/lib/country-overview-images";
import type { CountryStudyGuidePanel } from "@/components/public/country-study-guide";

export type DemoCountryDetails = NonNullable<ReturnType<typeof getDemoCountryDetails>>;

// Presentation-only Demo fixtures; these are not additions to the Country API contract.
const languages: Record<string, string> = {
  "demo-country-romania": "الرومانية أو الإنجليزية بحسب البرنامج التجريبي",
  "demo-country-turkey": "التركية أو الإنجليزية بحسب البرنامج التجريبي",
  "demo-country-poland": "البولندية أو الإنجليزية بحسب البرنامج التجريبي",
  "demo-country-hungary": "المجرية أو الإنجليزية بحسب البرنامج التجريبي",
  "demo-country-malaysia": "الماليزية أو الإنجليزية بحسب البرنامج التجريبي",
  "demo-country-cyprus": "تختلف اللغة بحسب البرنامج التجريبي",
  "demo-country-united-kingdom": "الإنجليزية في نموذج البرنامج التجريبي",
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
    overview: `في نموذج التخطيط للدراسة في ${name}، ابدأ بتحديد المرحلة والتخصص ثم قارن لغة التدريس ومحتوى البرنامج، بدل الاكتفاء باسم الجامعة. ${language}. هذه أمثلة للبحث وليست تأكيدًا لتوفر برنامج بعينه.\n\nاجمع روابط البرامج التي تهمك في ${name}، وسجّل الوثائق والرسوم والمواعيد من مصادرها الرسمية قبل اتخاذ قرارك. احتفظ بتاريخ مراجعة كل مصدر، وميّز بين شروط الجامعة وشروط أي منحة تفكر بها.`,
    facts: [
      { title: "لغة الدراسة", value: language },
      { title: "التكاليف الدراسية", value: `ميزانية برنامج افتراضي في ${name}: ${scenario.budget} لسنة نموذجية؛ ليست رسومًا فعلية.` },
      { title: "متطلبات القبول", value: `ملف افتراضي لبرنامج في ${name}: شهادة سابقة وكشف درجات للمراجعة، وليس قائمة قبول رسمية.` },
      { title: "مواعيد الدراسة", value: `خطة تجهيز افتراضية لوجهة ${name}: ${scenario.preparation}؛ ليست موعد تقديم أو بداية دراسة رسميًا.` },
    ],
    // All four examples stay inside this server-only, explicitly selected Demo fixture.
    guide: [
      { title: "نظام الدراسة والبرامج", introduction: `مثال بحث في ${name}: ${language}. استخدم هذا الاختلاف نقطة بداية للمقارنة، وليس وصفًا رسميًا لنظام التعليم.`, steps: ["أنشئ قائمة قصيرة بالبرامج، وسجّل المرحلة ولغة التدريس من صفحة كل برنامج.", "قارن محتوى المقررات وطريقة الدراسة، ثم احفظ رابط المصدر وتاريخ مراجعته."] },
      { title: "القبول والوثائق المطلوبة", introduction: `جهّز ملف متابعة للبرامج التي تهتم بها في ${name}، دون افتراض أن جميع الجامعات تطلب الوثائق نفسها.`, steps: ["انسخ قائمة الوثائق من صفحة القبول الخاصة بالبرنامج، وحدّد ما يحتاج إلى ترجمة أو مراجعة وفق المصدر نفسه.", "دوّن أسئلة إثبات اللغة وطريقة إرسال الملف، وتحقق من الإجابات لدى الجامعة قبل تقديم أي مستند."] },
      { title: "التكاليف والحياة الطلابية", introduction: `ابنِ نموذج ميزانية لوجهتك في ${name} بعد اختيار المدينة والبرنامج. لا يتضمن العرض أرقامًا مالية معتمدة.`, steps: ["افصل رسوم البرنامج عن السكن والنقل والمعيشة، وسجّل العملة والفترة والسنة لكل سعر موثّق.", "راجع ما تغطيه المنحة إن وجدت، وما يبقى على الطالب، قبل مقارنة الميزانيات أو دفع أي رسوم."] },
    ] satisfies CountryStudyGuidePanel[],
    faqs: [
      { question: `كيف أبدأ البحث عن جامعة في ${name}؟`, answer: `في هذا العرض التجريبي، يمكنك استخدام زر «استكشف جامعات ${name}» لعرض الجامعات المرتبطة بهذه الوجهة، ثم مقارنة البرامج من مصادرها الرسمية.` },
      { question: `كيف أتحقق من لغة الدراسة في ${name}؟`, answer: `نموذج اللغة التجريبي: ${language}. لا يمثل ذلك تأكيدًا للغة برنامج محدد؛ تحقّق من صفحة البرنامج ومتطلبات إثبات اللغة.` },
      { question: `كيف أقارن تكاليف الدراسة في ${name}؟`, answer: "اجمع رسوم البرنامج والسكن وبنود الميزانية من المصادر الرسمية. لا يقدم هذا العرض التجريبي أسعارًا أو تقديرات مالية معتمدة." },
      { question: `ما الوثائق التي أراجعها قبل التقديم في ${name}؟`, answer: "ابدأ بقائمة الجامعة المنشورة للبرنامج والمرحلة التي تختارها. تختلف الوثائق والترجمات المطلوبة، ولا تمثل هذه الإجابة قائمة قبول رسمية." },
      { question: `أين أجد المنح المرتبطة بوجهة ${name}؟`, answer: `استخدم زر «استكشف منح ${name}» لفتح دليل المنح مع فلتر الدولة. راجع حالة التقديم والشروط والمصدر الرسمي لكل منحة.` },
      { question: `كيف أرتب أسئلتي حول الدراسة في ${name}؟`, answer: `دوّن التخصص والمرحلة ولغة الدراسة التي تبحث عنها، ثم تواصل مع فريق طريق واذكر ${name} كوجهة اهتمامك. لا يتضمن الإرشاد ضمانًا للقبول أو التمويل.` },
    ],
  };
}
