import NextImage from "next/image";
import { CircleDollarSign, GraduationCap, MapPinned, type LucideIcon } from "lucide-react";
import { HomeContainer as Container, HomeLink as Link } from "@/components/home/home-primitives";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { homeEditorial } from "@/lib/homepage-content";
import { homeCardText } from "@/lib/homepage-card-content";

const loadingCards = [
  { label: "وجهات دراسية", Icon: MapPinned },
  { label: "جامعات منشورة", Icon: GraduationCap },
  { label: "منح وبرامج", Icon: CircleDollarSign },
];

/** Keep the approved value slots mounted even when verified totals are unavailable. */
export function HomeHero({ heroCards = loadingCards, pending = false }: {
  heroCards?: { label: string; Icon: LucideIcon; count?: number }[];
  pending?: boolean;
}) {
  return (
      <section
        id="intro"
        aria-labelledby="hero-title"
        className="isolate bg-white"
      >
        <div className="relative">
          <div className="relative h-[17rem] min-w-0 overflow-hidden bg-[#17669C] sm:h-[23rem] md:h-[30rem] lg:absolute lg:inset-0 lg:h-auto">
            <NextImage
              src="/images/hero/study-abroad-student-landmarks.png"
              draggable={false}
              alt="طالب يحمل حاسوبًا أمام معالم عالمية للدراسة في الخارج"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-[left_22%] lg:object-[left_18%]"
            />
            <span
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] bg-gradient-to-l from-white/95 via-white/72 to-transparent sm:block md:w-[58%] lg:hidden"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-[47%] bg-gradient-to-r from-transparent via-white/85 to-white lg:block"
              aria-hidden="true"
            />
          </div>
          <Container className="relative z-10 grid min-w-0 grid-cols-1 sm:-mt-[23rem] md:-mt-[30rem] lg:mt-0 lg:min-h-[29rem] lg:grid-cols-[minmax(0,43%)_minmax(0,57%)] xl:min-h-[31rem] 2xl:min-h-[34rem]">
            <div className="row-start-1 min-w-0 pb-6 pt-6 text-right sm:pb-8 sm:pt-0 lg:col-start-1 lg:py-8">
              <div className="min-w-0 sm:grid sm:grid-rows-[23rem_auto] md:flex md:min-h-[30rem] md:flex-col md:justify-center lg:h-full lg:min-h-0">
                <div className="min-w-0 sm:row-start-1 sm:flex sm:w-[46%] sm:flex-col sm:justify-center sm:justify-self-start md:w-[48%] lg:w-auto">
                  <p className="text-base font-bold text-[#A47B2D]">
                    أكاديمية طريق
                  </p>
                  <h1
                    id="hero-title"
                    className="mt-3 max-w-[34rem] text-[2.2rem] font-extrabold leading-[1.4] tracking-[-0.04em] text-[#082B50] sm:text-[2.5rem] md:text-5xl xl:max-w-[38rem] xl:text-[clamp(3.6rem,3.4vw,4rem)]"
                  >
                    {homeEditorial.heroTitle}
                  </h1>
                </div>
                <div className="min-w-0 sm:row-start-2 sm:pt-6 md:w-[48%] md:self-start md:pt-0 lg:w-auto lg:self-auto">
                  <p className="mt-4 max-w-[32rem] text-base leading-8 text-[#435A73] sm:text-[1.0625rem] 2xl:max-w-[36rem] 2xl:text-lg 2xl:leading-9">
                    {homeEditorial.heroDescription}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3 lg:flex lg:flex-row lg:flex-wrap">
                    <Button
                      asChild
                      size="lg"
                      className="h-12 w-full cursor-pointer rounded-lg bg-[#082B50] px-3 text-sm font-bold text-white shadow-[0_12px_24px_-14px_rgba(8,43,80,0.75)] hover:bg-[#0D3E70] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#C8A253] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:h-13 sm:px-4 sm:text-base lg:w-auto lg:px-8"
                    >
                      <Link href="/scholarships">ابدأ رحلتك <ArrowLeftIcon className="size-4" /></Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-12 w-full rounded-lg border-2 border-[#17669C] bg-white/95 px-3 text-sm font-bold text-[#082B50] hover:bg-[#F1F5F9] sm:h-13 sm:px-4 sm:text-base lg:w-auto lg:px-7"
                    >
                      <Link href="/study-abroad">استكشف الوجهات</Link>
                    </Button>
                  </div>
                  <p className="mt-5 text-[0.9375rem] font-normal leading-7 text-[#52647A] md:hidden lg:block">
                    {homeEditorial.heroNote}
                  </p>
                </div>
              </div>
            </div>
            <p className="row-start-2  hidden text-right text-[0.9375rem] font-normal leading-7 text-[#52647A] md:block lg:hidden">
              {homeEditorial.heroNote}
            </p>
            <div className="row-start-2 grid w-full min-w-0 grid-cols-1 justify-center gap-3 pb-7 min-[24rem]:grid-cols-2 sm:grid-cols-3 sm:gap-4 md:row-start-3 md:mt-5 lg:col-span-2 lg:row-start-2 lg:mt-0 lg:py-6 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:max-w-[54rem] xl:self-end xl:gap-4 xl:pb-5 xl:pt-0 2xl:pb-7">
              {heroCards.map(({ label, Icon, count }) => (
                <div
                  key={label}
                  className="flex min-h-[4.5rem] min-w-0 w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-2 py-2 text-[#082B50] shadow-[0_12px_30px_-15px_rgba(8,43,80,0.45)] min-[24rem]:last:col-span-2 min-[24rem]:last:w-[calc((100%_-_0.75rem)/2)] min-[24rem]:last:justify-self-center sm:gap-2.5 sm:px-3 sm:last:col-auto sm:last:w-full md:px-3.5 2xl:min-h-[5rem] 2xl:px-4"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FAF4E7] 2xl:size-10">
                    <Icon
                      className="size-4 text-[#A47B2D] 2xl:size-6"
                      aria-hidden="true"
                    />
                  </span>
                  {pending ? <span aria-hidden="true" className="h-6 w-8 shrink-0 rounded-md bg-[#E5EBF2] motion-safe:animate-pulse motion-reduce:animate-none" /> : <strong className="shrink-0 text-lg font-extrabold tabular-nums 2xl:text-xl">{count !== undefined ? count : <span className="text-sm font-normal leading-6">{homeCardText(undefined, "العدد")}</span>}</strong>}
                  <span className="min-w-0 text-sm font-bold leading-6 2xl:text-[0.9375rem]">{label}</span>
                </div>
              ))}
            </div>
          </Container>
        </div>
      </section>
  );
}

