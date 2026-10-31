// Isolated, fictional detail content. Never merged into Live records or shared lists.
export type DemoScholarshipDetails = {
  descriptionAr: string;
  requirementsAr: string;
  benefits: string[];
  requirements: string[];
  steps: string[];
  applicationUrl?: string;
};

export function getDemoScholarshipDetails(slug: string): DemoScholarshipDetails | undefined {
  if (!["romania-academic-scholarship", "demo-global-discovery", "demo-research-fellowship"].includes(slug)) return undefined;
  return {
    descriptionAr: "هذه منحة خيالية ضمن العرض التجريبي لأكاديمية طريق، وليست إعلاناً عن فرصة رسمية. يوضح هذا المثال كيف يمكن عرض المعلومات الأكاديمية ومساعدة الطالب على قراءة تفاصيل الفرصة بصورة منظمة.\n\nتجمع الصفحة المعلومات الأساسية، والشروط، والمزايا التوضيحية في مكان واحد. جميع المزايا والخطوات أدناه أمثلة لاختبار التصميم فقط، ولا تثبت أي تمويل أو أهلية أو قبول. ينبغي الرجوع دائماً إلى المصدر الرسمي عند نشر فرصة حقيقية.",
    requirementsAr: "الشروط التالية أمثلة خيالية لاختبار وضوح المحتوى، وليست متطلبات لجهة مانحة. تختلف الشروط الفعلية بحسب البرنامج والجهة، ولا تعني الاستعانة بالأكاديمية ضمان القبول.\n\nفي هذا السيناريو التوضيحي يراجع الطالب ملفه الأكاديمي ويفهم متطلبات البرنامج قبل طلب المساعدة. لا يُرسل أي طلب رسمي إلى جهة مانحة من هذه الصفحة.",
    benefits: ["مثال توضيحي: دعم رسوم دراسية", "مثال توضيحي: موارد تعليمية", "مثال توضيحي: أنشطة أكاديمية", "مثال توضيحي: إرشاد دراسي"],
    requirements: ["مثال: قراءة متطلبات البرنامج بعناية", "مثال: تجهيز سجل أكاديمي للمراجعة", "مثال: مراجعة المستندات المطلوبة", "مثال: التحقق من شروط اللغة لدى الجهة"],
    steps: ["قراءة المعلومات التوضيحية", "مراجعة متطلبات المثال", "تجهيز أسئلة للاستفسار", "طلب مساعدة تجريبية"],
  };
}
