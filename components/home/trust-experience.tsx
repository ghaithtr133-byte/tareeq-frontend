import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, GraduationCap, MapPinned, MessageCircle, Trophy, UsersRound } from "lucide-react";

import { Container } from "@/components/layout/container";
import { demoTrustMetrics } from "@/lib/mocks/home-trust-metrics";
import { createWhatsappUrl } from "@/lib/whatsapp";

const metricIcons = {
  experience: Trophy,
  students: UsersRound,
  universities: GraduationCap,
  destinations: MapPinned,
};

export function TrustExperience({ demoMode }: { demoMode: boolean }) {
  return (
    <section className="bg-[#FAF9F6] py-16 sm:py-20" aria-labelledby="trust-experience-title">
      <Container>
        <div className="grid gap-5 xl:grid-cols-2 xl:gap-6">
          <div className="flex min-w-0 flex-col justify-center rounded-[20px] border border-[#E2E8F0] bg-white px-6 py-7 text-right shadow-[0_16px_40px_-32px_rgba(8,43,80,0.35)] sm:px-9 sm:py-8 xl:px-10">
            {demoMode ? (
              <div>
                <p className="text-sm font-bold text-[#8A6428]">أرقام توضيحية</p>
                <ul className="mt-3 grid grid-cols-2 md:grid-cols-4" aria-label="مؤشرات توضيحية غير مؤكدة">
                  {demoTrustMetrics.map((metric, index) => {
                    const Icon = metricIcons[metric.icon];
                    return (
                      <li
                        key={metric.icon}
                        className={`flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-3 text-center sm:px-3 ${index >= 2 ? "border-t border-[#E2E8F0] md:border-t-0" : ""} ${index % 2 === 1 || index === 2 ? "border-s border-[#E2E8F0]" : ""} ${index === 2 ? "max-md:border-s-0" : ""}`}
                      >
                        <Icon className="size-8 shrink-0 text-[#C8A253] sm:size-9" strokeWidth={1.8} aria-hidden="true" />
                        <span className="flex min-w-0 flex-col items-center">
                          <span dir="ltr" className="text-[1.75rem] font-extrabold leading-tight text-[#082B50] sm:text-[2rem]">
                            {metric.value}
                          </span>
                          <span className="text-sm leading-6 text-[#52647A] sm:text-[0.9375rem]">{metric.label}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="my-5 border-t border-[#E2E8F0] sm:my-6" aria-hidden="true" />
              </div>
            ) : null}
            <h2 id="trust-experience-title" className="text-[1.625rem] font-bold leading-[1.4] text-[#082B50] sm:text-[2rem]">
              طريقك نحو مستقبل أكاديمي أفضل
            </h2>
            <p className="mt-3 text-base leading-8 text-[#52647A] sm:text-lg sm:leading-9">
              نرافقك في اختيار الجامعة والتخصص المناسب، ونساعدك في خطوات التقديم والاستعداد لرحلتك الدراسية.
            </p>
          </div>

          <div className="relative isolate flex min-h-[26rem] min-w-0 flex-col justify-center overflow-hidden rounded-[20px] bg-[#082B50] p-6 text-right text-white shadow-[0_20px_45px_-30px_rgba(8,43,80,0.55)] sm:min-h-[29rem] sm:p-9 xl:p-10">
            <Image
              src="/images/trust/library-globe.jpg"
              alt=""
              fill
              sizes="(min-width: 1280px) 50vw, 100vw"
              className="-z-20 object-cover object-center"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-l from-[#082B50]/95 via-[#082B50]/82 to-[#082B50]/50" aria-hidden="true" />
            <div className="max-w-xl">
              <h3 className="text-[1.625rem] font-bold leading-[1.4] sm:text-[2rem]">اكتشف عالماً من الفرص الدراسية</h3>
              <p className="mt-3 text-base leading-8 text-white/90 sm:text-lg sm:leading-9">
                تعرّف على الجامعات والتخصصات وابدأ رحلتك الأكاديمية بخطوات واضحة.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/universities"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C8A253] px-6 py-3 text-base font-bold text-[#082B50] transition-colors hover:bg-[#E1BF77] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white motion-reduce:transition-none"
                >
                  استكشف الجامعات <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
                <a
                  href={createWhatsappUrl("مرحبًا، أود المساعدة في اختيار الجامعة المناسبة لي.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white bg-transparent px-6 py-3 text-base font-bold text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#C8A253] motion-reduce:transition-none"
                >
                  تواصل معنا <MessageCircle className="size-5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
