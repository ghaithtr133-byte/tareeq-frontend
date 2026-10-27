import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, MessageCircle, MessageCircleQuestion } from "lucide-react";

import { Container } from "@/components/layout/container";
import { createWhatsappUrl } from "@/lib/whatsapp";

const questions = [
  {
    question: "كيف أختار الجامعة المناسبة؟",
    answer: "ابدأ بمقارنة التخصص ولغة الدراسة والمتطلبات المنشورة من الجامعة، ثم رتّب الخيارات وفق أهدافك وميزانيتك.",
  },
  {
    question: "ما الأوراق المطلوبة للتقديم؟",
    answer: "تختلف الوثائق بحسب الجامعة والبرنامج. راجع صفحة القبول الرسمية، ثم جهّز المستندات التي تطلبها الجهة قبل إرسال الطلب.",
  },
  {
    question: "هل توجد منح دراسية متاحة؟",
    answer: "يمكنك تصفح المنح المنشورة، مع التحقق من حالة كل منحة وشروطها ومواعيدها من مصدرها الرسمي قبل التقديم.",
  },
  {
    question: "كم تستغرق إجراءات القبول؟",
    answer: "تختلف المدة بحسب الجامعة والبرنامج واكتمال الملف. راجع الجدول المعلن من الجهة التعليمية واترك وقتًا لاستكمال أي نواقص.",
  },
  {
    question: "هل يمكنني التقديم على أكثر من جامعة؟",
    answer: "قد تسمح بعض الجامعات بذلك وفق سياساتها. تحقّق من شروط ورسوم كل طلب قبل التقديم إلى أكثر من جهة.",
  },
  {
    question: "كيف أتواصل مع أكاديمية طريق؟",
    answer: "يمكنك مراسلتنا عبر واتساب وذكر الوجهة والتخصص والمرحلة الدراسية التي تفكر بها، لنساعدك في ترتيب أسئلتك.",
  },
] as const;

export function HomeFaq() {
  return (
    <section className="relative isolate overflow-hidden bg-[#FFFDF9] py-16 sm:py-20" aria-labelledby="home-faq-title">
      <div className="pointer-events-none absolute -start-32 -top-52 size-[34rem] rounded-full border-[3rem] border-[#C8A253]/5" aria-hidden="true" />
      <Container className="relative">
        <div className="text-right">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#FBF5E9] px-4 py-2 text-sm font-bold text-[#A47B2D]">
            <MessageCircleQuestion className="size-5" aria-hidden="true" />
            الأسئلة الشائعة
          </p>
          <h2 id="home-faq-title" className="mt-4 text-[clamp(1.875rem,3vw,2.5rem)] font-bold leading-[1.35] text-[#082B50]">
            إجابات على أكثر أسئلتك شيوعاً
          </h2>
        </div>

        <div className="mt-9 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
          <aside className="order-2 flex min-w-0 flex-col items-center justify-center rounded-[20px] border border-[#F0E5D4] bg-white p-6 text-center shadow-[0_18px_40px_-32px_rgba(8,43,80,0.28)] sm:p-8 lg:order-1 lg:basis-[40%]">
            <Image
              src="/images/faq/faq-help.png"
              alt=""
              width={210}
              height={210}
              sizes="210px"
              className="size-40 object-contain sm:size-48"
            />
            <h3 className="mt-2 text-2xl font-bold leading-[1.4] text-[#082B50] sm:text-[1.75rem]">ما زال لديك سؤال؟</h3>
            <p className="mt-3 max-w-sm text-base leading-8 text-[#52647A]">
              تواصل معنا عبر واتساب وسنساعدك في ترتيب خطواتك التالية.
            </p>
            <div className="mt-6 grid w-full max-w-sm gap-3">
              <a
                href={createWhatsappUrl("مرحبًا، لدي سؤال عن خيارات الدراسة والخطوات المناسبة لي.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C8A253] px-5 py-3 font-bold text-[#082B50] transition-colors hover:bg-[#D8B96E] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#082B50] motion-reduce:transition-none"
              >
                <MessageCircle className="size-5" aria-hidden="true" /> تواصل عبر واتساب
              </a>
              <Link
                href="/services"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#C8A253] px-5 py-3 font-bold text-[#082B50] transition-colors hover:bg-[#FBF5E9] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#082B50] motion-reduce:transition-none"
              >
                عرض الخدمات <ArrowLeft className="size-5" aria-hidden="true" />
              </Link>
            </div>
          </aside>

          <div className="order-1 min-w-0 space-y-3 lg:order-2 lg:flex-1">
            {questions.map(({ question, answer }, index) => (
              <details
                key={question}
                name="home-faq"
                open={index === 0}
                className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_12px_30px_-26px_rgba(8,43,80,0.3)]"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-right text-base font-bold leading-7 text-[#082B50] transition-colors hover:bg-[#FAFBFD] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#A47B2D] motion-reduce:transition-none sm:px-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                  <span>{question}</span>
                  <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr] motion-reduce:transition-none">
                  <div className="overflow-hidden">
                    <div className="border-t border-[#E2E8F0] px-5 py-4 text-right text-base leading-8 text-[#52647A] sm:px-6">
                      {answer}
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
