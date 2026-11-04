import NextImage from "next/image";
import { CircleDollarSign, FileText, GraduationCap, MapPinned, type LucideIcon } from "lucide-react";
import { HomeContainer as Container, HomeLink as Link } from "@/components/home/home-primitives";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { homeEditorial } from "@/lib/homepage-content";
import { homeCardText } from "@/lib/homepage-card-content";

const loadingCards = [
  { label: "وجهات دراسية", Icon: MapPinned },
  { label: "جامعات منشورة", Icon: GraduationCap },
  { label: "منح وبرامج", Icon: CircleDollarSign },
  { label: "خدمات تعليمية", Icon: FileText },
];

/** Keep the approved value slots mounted even when verified totals are unavailable. */
export function HomeHero({ admissionHref = "/services", heroCards = loadingCards, pending = false }: {
  admissionHref?: string;
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
          <div className="relative h-[17rem] min-w-0 overflow-hidden bg-[#17669C] sm:h-[23rem] lg:absolute lg:inset-0 lg:h-auto">
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
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-[47%] bg-gradient-to-r from-transparent via-white/85 to-white lg:block"
              aria-hidden="true"
            />
          </div>
          <Container className="relative z-10 grid min-w-0 grid-cols-1 lg:min-h-[29rem] lg:grid-cols-[minmax(0,43%)_minmax(0,57%)] xl:min-h-[31rem] 2xl:min-h-[34rem]">
            <div className="row-start-1 min-w-0 pb-6 pt-6 text-right sm:pb-8 lg:col-start-1 lg:flex lg:items-center lg:py-8">
              <div className="min-w-0">
                <p className="text-base font-bold text-[#A47B2D]">
                  أكاديمية طريق
                </p>
                <h1
                  id="hero-title"
                  className="mt-3 max-w-[34rem] text-[2.2rem] font-extrabold leading-[1.16] tracking-[-0.04em] text-[#082B50] sm:text-5xl xl:max-w-[38rem] xl:text-[clamp(3.6rem,3.4vw,4rem)]"
                >
                  {homeEditorial.heroTitle}
                </h1>
                <p className="mt-4 max-w-[32rem] text-base leading-8 text-[#435A73] sm:text-[1.0625rem] 2xl:max-w-[36rem] 2xl:text-lg 2xl:leading-9">
                  {homeEditorial.heroDescription}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    asChild
                    size="lg"
                    className="h-13 w-full cursor-pointer rounded-lg bg-[#082B50] px-8 text-base font-bold text-white shadow-[0_12px_24px_-14px_rgba(8,43,80,0.75)] hover:bg-[#0D3E70] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#C8A253] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:w-auto"
                  >
                    <Link href={admissionHref}>ابدأ رحلتك <ArrowLeftIcon className="size-4" /></Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-13 w-full rounded-lg border-2 border-[#17669C] bg-white/95 px-7 text-base font-bold text-[#082B50] hover:bg-[#F1F5F9] sm:w-auto"
                  >
                    <Link href="/study-abroad">استكشف الوجهات</Link>
                  </Button>
                </div>
                <p className="mt-3 text-[0.9375rem] font-normal leading-7 text-[#52647A]">
                  {homeEditorial.heroNote}
                </p>
              </div>
            </div>
            <div className="row-start-2 grid min-w-0 grid-cols-2 gap-3 pb-7 md:grid-cols-4 lg:col-span-2 lg:py-6 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:self-end xl:gap-4 xl:pb-5 xl:pt-0 2xl:gap-5 2xl:pb-7">
              {heroCards.map(({ label, Icon, count }) => (
                <div
                  key={label}
                  className="flex min-h-[5.25rem] min-w-0 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-3 text-[#082B50] shadow-[0_12px_30px_-15px_rgba(8,43,80,0.45)] sm:gap-3 sm:px-4 2xl:min-h-[6rem] 2xl:px-5"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FAF4E7] 2xl:size-11">
                    <Icon
                      className="size-5 text-[#A47B2D] 2xl:size-7"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="min-w-0 leading-6">
                    {pending ? <span aria-hidden="true" className="mb-1 block h-6 w-8 rounded-md bg-[#E5EBF2] motion-safe:animate-pulse motion-reduce:animate-none" /> : <strong className="block text-right text-xl font-extrabold tabular-nums 2xl:text-2xl">{count !== undefined ? count : <span className="text-sm font-normal leading-6">{homeCardText(undefined, "العدد")}</span>}</strong>}
                    <span className="block text-sm font-bold leading-6 2xl:text-[0.9375rem]">
                      {label}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Container>
        </div>
      </section>
  );
}

