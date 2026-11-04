import Image from "next/image";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/content-state";
import { ArrowLeft, MessageCircle, MessageCircleQuestion } from "lucide-react";

import { HomeContainer as Container, HomeLink as Link } from "@/components/home/home-primitives";
import { createWhatsappUrl } from "@/lib/whatsapp";
import { FaqAccordion } from "@/components/public/faq-accordion";

export function HomeFaq({ questions, state }: { questions: readonly { question: string; answer: string }[]; state?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#FFFDF9] py-12 sm:py-14" aria-labelledby="home-faq-title">
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

        <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
          <aside className="order-2 flex min-w-0 flex-col items-center justify-center rounded-[20px] border border-[#F0E5D4] bg-white p-6 text-center shadow-[0_18px_40px_-32px_rgba(8,43,80,0.28)] sm:p-8 lg:order-1 lg:basis-[40%]">
            <Image
              src="/images/faq/faq-help.png"
              draggable={false}
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
                draggable={false}
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
            {questions.length ? <FaqAccordion items={questions} name="home-faq" /> : state ?? <EmptyState title="لا توجد أسئلة شائعة منشورة حالياً" description="يمكنك التواصل مع فريق طريق لطرح سؤالك." />}
          </div>
        </div>
      </Container>
    </section>
  );
}
