import type { Article, Scholarship } from "@/api/public-content";
import { publicDemoContent } from "@/lib/mocks/public-demo-content";

/** Explicit Demo-only editorial/relationship examples, never pending Live response fields. */
export function demoArticleDetails(source: Article): { article: Article; scholarships: Scholarship[] } {
  let article = source;
  if (source.slug === "study-guide") article = { ...source, bodyAr: [...source.bodyAr,
    { type: "heading2", text: "تجهيز الوثائق" },
    { type: "paragraph", text: "هذا محتوى توضيحي للعرض التجريبي. خصّص وقتاً لقراءة صفحة البرنامج الرسمية، وسجّل الأسئلة التي تحتاج إلى توضيح قبل إرسال أي مستندات. احتفظ بروابط المصادر وتاريخ مراجعتها، فقد تختلف متطلبات الجامعات والبرامج من عام إلى آخر." },
    { type: "heading3", text: "مراجعة التفاصيل" },
    { type: "paragraph", text: "قارن بين أسماء الوثائق المطلوبة وما هو متاح لديك بالفعل. لا تعتبر أمثلة هذا المقال قائمة إلزامية لأي جامعة أو منحة؛ المرجع هو الجهة الرسمية. يساعد ترتيب الأسئلة على جعل الاستشارة أكثر وضوحاً، لكنه لا يضمن القبول أو الحصول على تمويل." },
    { type: "heading2", text: "خطتك قبل التواصل" },
    { type: "numbered-list", text: "دوّن اسم البرنامج والروابط التي راجعتها." },
    { type: "numbered-list", text: "حدّد الأسئلة التي لم تجد إجابة منشورة عنها." },
    { type: "numbered-list", text: "جهّز ملخصاً واضحاً لهدفك الدراسي للاستفسار." },
    { type: "quote", text: "المحتوى التجريبي إرشادي، ولا يحل محل شروط الجهات الرسمية." },
  ], coverImageAltAr: "طالب ومعالم أكاديمية — رسم توضيحي تجريبي" };
  if (source.slug === "quiet-study-note") article = { ...source, coverImageUrl: null, coverImageAltAr: null };
  const ids = source.slug === "study-guide" ? ["demo-scholarship-romania", "demo-scholarship-turkey", "demo-directory-scholarship-1"] : source.scholarshipId ? [source.scholarshipId] : [];
  const scholarships = ids.flatMap((id) => {
    const record = publicDemoContent.scholarships.find((item) => item.id === id && item.status === "PUBLISHED");
    return record ? [record] : [];
  }).slice(0, 3);
  return { article, scholarships };
}
