import Image from "next/image";
import { ArrowLeft, GraduationCap, MapPinned, MessageCircle, Trophy, UsersRound } from "lucide-react";

import { HomeContainer as Container, HomeLink as Link } from "@/components/home/home-primitives";
import { createWhatsappUrl } from "@/lib/whatsapp";
import { homeEditorial } from "@/lib/homepage-content";
import { homeCardText } from "@/lib/homepage-card-content";

// Presentation slots only: the public API currently has no verified statistics contract.
// Wire confirmed Backend values here when that contract exists; never use Demo figures.
export type TrustStatistics = { experience?: string; universities?: string; destinations?: string; students?: string };

export function TrustExperience({ statistics = {} }: { statistics?: TrustStatistics }) {
  const metrics = [
    { key: "experience", label: "سنوات من الخبرة", valueLabel: "عدد سنوات الخبرة", Icon: Trophy },
    { key: "universities", label: "جامعة في عدة دول", valueLabel: "عدد الجامعات", Icon: GraduationCap },
    { key: "destinations", label: "وجهات دراسية", valueLabel: "عدد الوجهات", Icon: MapPinned },
    { key: "students", label: "طالب وطالبة سجلوا معنا", valueLabel: "عدد الطلاب", Icon: UsersRound },
  ] as const;
  return (
    <section className="bg-[#FAF9F6] py-12 sm:py-14" aria-labelledby="trust-experience-title">
      <Container>
        <div className="grid gap-5 xl:grid-cols-2 xl:gap-6">
          <div className="flex min-w-0 flex-col justify-center rounded-[20px] border border-[#E2E8F0] bg-white px-6 py-5 text-right shadow-[0_16px_40px_-32px_rgba(8,43,80,0.35)] sm:px-7 sm:py-5 xl:px-8">
            <ul className="grid grid-cols-2 sm:grid-cols-4" aria-label="مؤشرات الأكاديمية">
              {metrics.map(({ key, label, valueLabel, Icon }, index) => (
                <li key={key} className={`flex min-w-0 flex-col items-center justify-center gap-1.5 px-2 py-2 text-center ${index % 2 ? "border-s border-[#E2E8F0]" : ""} ${index === 2 ? "sm:border-s sm:border-[#E2E8F0]" : ""} ${index >= 2 ? "border-t border-[#E2E8F0] sm:border-t-0" : ""}`}>
                  <Icon className="size-8 shrink-0 text-[#C8A253] sm:size-9" strokeWidth={1.8} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className={`block text-[#082B50] ${statistics[key]?.trim() ? "text-[1.75rem] font-extrabold leading-tight sm:text-[2rem]" : "text-sm font-normal leading-6"}`} data-trust-value={key}>{homeCardText(statistics[key], valueLabel)}</span>
                    <span className="block text-sm leading-6 text-[#52647A] sm:text-[0.9375rem]">{label}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="my-3 border-t border-[#E2E8F0]" aria-hidden="true" />
            <h2 id="trust-experience-title" className="text-[1.625rem] font-bold leading-[1.4] text-[#082B50] sm:text-[2rem]">
              {homeEditorial.trustTitle}
            </h2>
            <p className="mt-2 text-base leading-8 text-[#52647A] sm:text-lg sm:leading-9">
              {homeEditorial.trustDescription}
            </p>
          </div>

          <div className="relative isolate flex min-w-0 flex-col justify-center overflow-hidden rounded-[20px] bg-[#082B50] p-6 text-right text-white shadow-[0_20px_45px_-30px_rgba(8,43,80,0.55)] sm:p-7 xl:p-8">
            <Image
              src="/images/trust/library-globe.jpg"
              draggable={false}
              alt=""
              fill
              sizes="(min-width: 1280px) 50vw, 100vw"
              className="-z-20 object-cover object-center"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-l from-[#082B50]/95 via-[#082B50]/82 to-[#082B50]/50" aria-hidden="true" />
            <div className="max-w-xl">
              <h3 className="text-[1.625rem] font-bold leading-[1.4] sm:text-[2rem]">{homeEditorial.discoveryTitle}</h3>
              <p className="mt-2 text-base leading-8 text-white/90 sm:text-lg sm:leading-9">
                {homeEditorial.discoveryDescription}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/universities"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C8A253] px-6 py-3 text-base font-bold text-[#082B50] transition-colors hover:bg-[#E1BF77] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white motion-reduce:transition-none"
                >
                  استكشف الجامعات <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
                <a
                  draggable={false}
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
