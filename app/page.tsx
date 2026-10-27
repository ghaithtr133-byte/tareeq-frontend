/* eslint-disable @next/next/no-img-element -- public API content may provide remote image URLs. */
import Link from "next/link";
import NextImage from "next/image";
import {
  BookOpenText,
  CircleDollarSign,
  ClipboardList,
  Compass,
  FileText,
  GraduationCap,
  HandCoins,
  MapPinned,
} from "lucide-react";
import {
  getArticles,
  getCountries,
  getScholarships,
  getServices,
  getUniversities,
  type Article,
  type Country,
  type Scholarship,
  type Service,
  type University,
} from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { FeaturedUniversitiesCarousel } from "@/components/home/featured-universities-carousel";
import { HomeFaq } from "@/components/home/home-faq";
import { TrustExperience } from "@/components/home/trust-experience";
import { ApiUnavailable } from "@/components/public/public-content";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { createPageMetadata } from "@/lib/seo";
import { createWhatsappUrl } from "@/lib/whatsapp";
export const metadata = createPageMetadata(
  "طريق الأكاديمية",
  "استشارات تعليمية وتوجيه للدراسة في الخارج.",
  { pathname: "/" },
);
export const dynamic = "force-dynamic";
type Card = {
  id: string;
  slug?: string;
  title: string;
  href: string;
  body?: string;
  meta?: string;
  image?: string;
  alt?: string;
  date?: string;
  location?: string;
  countrySlug?: string;
};
const demoUniversityLogos: Record<string, string> = {
  "university-bucharest": "/images/universities/university-of-bucharest.svg",
};
const demoUniversityTypes: Record<string, string> = {
  "university-bucharest": "حكومية",
  "istanbul-university": "حكومية",
  "polytechnic-university-bucharest": "حكومية",
  "university-of-warsaw": "حكومية",
};
const journey = [
  ["01", "اختيار الوجهة", "حدّد ما يناسب خطتك الدراسية."],
  ["02", "اختيار الجامعة", "اقرأ الخيارات المنشورة بوضوح."],
  ["03", "تقديم الطلب", "رتّب وثائقك وخطوتك التالية."],
  ["04", "بدء الرحلة", "تابع مسارك بمعلومات موثوقة."],
] as const;
const serviceIcons: Record<string, typeof GraduationCap> = {
  "university-admissions": GraduationCap,
  "major-selection": Compass,
  "scholarship-guidance": HandCoins,
  "file-preparation": FileText,
  "admission-follow-up": ClipboardList,
  "destination-guidance": Compass,
  "university-guidance": GraduationCap,
  "application-preparation": ClipboardList,
  "visa-guidance": FileText,
};
const demoDestinationLines: Record<string, string> = {
  turkey: "استكشف الدراسة والجامعات في تركيا",
  malaysia: "تعرّف على خيارات الدراسة في ماليزيا",
  cyprus: "اطّلع على خيارات الدراسة في قبرص",
  "united-kingdom": "قارن خيارات الدراسة في بريطانيا",
};
function Image({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  return src ? (
    <img
      src={src}
      alt={alt ?? ""}
      className={`h-full w-full object-cover ${className}`}
      loading="lazy"
    />
  ) : (
    <div className={`bg-[#EAF0F6] ${className}`} aria-hidden="true" />
  );
}
function Eyebrow({
  children,
  light = false,
}: {
  children: string;
  light?: boolean;
}) {
  return (
    <p
      className={`text-sm font-extrabold tracking-[0.13em] ${light ? "text-[#F5D98E]" : "text-[#A47B2D]"}`}
    >
      {children}
    </p>
  );
}
function Heading({
  id,
  eyebrow,
  title,
  intro,
  light = false,
  center = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className={`mt-3 text-3xl font-bold leading-[1.3] tracking-[-0.03em] sm:text-4xl ${light ? "text-white" : "text-[#082B50]"}`}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={`mt-3 text-base leading-8 2xl:text-lg 2xl:leading-9 ${light ? "text-white/75" : "text-[#52647A]"}`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}
function MoreLink({
  href,
  children,
  light = false,
  blue = false,
}: {
  href: string;
  children: string;
  light?: boolean;
  blue?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-[0.9375rem] font-bold transition-colors hover:text-[#C8A253] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A253] ${light ? "text-white" : blue ? "text-[#17669C]" : "text-[#082B50]"}`}
    >
      {children}
      <ArrowLeftIcon className="size-4" />
    </Link>
  );
}
function DestinationFlag({ slug }: { slug?: string }) {
  const className =
    "h-[18px] w-[27px] shrink-0 overflow-hidden rounded-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.45)]";
  if (slug === "turkey")
    return (
      <svg aria-hidden="true" viewBox="0 0 30 20" className={className}>
        <path fill="#E30A17" d="M0 0h30v20H0z" />
        <circle fill="#fff" cx="12" cy="10" r="5.5" />
        <circle fill="#E30A17" cx="13.7" cy="10" r="4.4" />
        <path
          fill="#fff"
          d="m17.7 6.5.8 2.4H21l-2 1.5.8 2.4-2.1-1.5-2 1.5.8-2.4-2-1.5H17z"
        />
      </svg>
    );
  if (slug === "romania")
    return (
      <svg aria-hidden="true" viewBox="0 0 30 20" className={className}>
        <path fill="#002B7F" d="M0 0h10v20H0z" />
        <path fill="#FCD116" d="M10 0h10v20H10z" />
        <path fill="#CE1126" d="M20 0h10v20H20z" />
      </svg>
    );
  if (slug === "poland")
    return (
      <svg aria-hidden="true" viewBox="0 0 30 20" className={className}>
        <path fill="#fff" d="M0 0h30v10H0z" />
        <path fill="#DC143C" d="M0 10h30v10H0z" />
      </svg>
    );
  if (slug === "hungary")
    return (
      <svg aria-hidden="true" viewBox="0 0 30 20" className={className}>
        <path fill="#CE2939" d="M0 0h30v6.67H0z" />
        <path fill="#fff" d="M0 6.67h30v6.66H0z" />
        <path fill="#477050" d="M0 13.33h30V20H0z" />
      </svg>
    );
  if (slug === "malaysia")
    return (
      <svg aria-hidden="true" viewBox="0 0 28 18" className={className}>
        <path fill="#fff" d="M0 0h28v18H0z" />
        {[0, 2.58, 5.16, 7.74, 10.32, 12.9, 15.48].map((y) => (
          <rect key={y} y={y} width="28" height="1.29" fill="#CC0001" />
        ))}
        <path fill="#010066" d="M0 0h14v10.3H0z" />
        <circle fill="#FFCC00" cx="6" cy="5.2" r="3.1" />
        <circle fill="#010066" cx="7" cy="4.7" r="2.7" />
        <path
          fill="#FFCC00"
          d="m10.4 2.1.4 1.5 1.4-.5-.9 1.3 1.2.9-1.5.1-.1 1.5-.8-1.3-1.4.7.7-1.4-1.1-.9 1.5.1z"
        />
      </svg>
    );
  if (slug === "cyprus")
    return (
      <svg aria-hidden="true" viewBox="0 0 30 20" className={className}>
        <path fill="#fff" d="M0 0h30v20H0z" />
        <path
          fill="#D5782B"
          d="m6 9 5-3 5 .7 3-1.5 1.8 1.8 3.4-.1-2 2.2-4 .8-2.6 2.1-4.9-.2-2.2-1.5z"
        />
        <path
          fill="none"
          stroke="#457B42"
          strokeLinecap="round"
          strokeWidth="1.2"
          d="M8 14c4 3 10 3 14 0m-11 1-1-2m4 3-.4-2m3.5 2 .5-2m3.3 1 1-2"
        />
      </svg>
    );
  if (slug === "united-kingdom" || slug === "britain" || slug === "uk")
    return (
      <svg aria-hidden="true" viewBox="0 0 30 20" className={className}>
        <path fill="#012169" d="M0 0h30v20H0z" />
        <path stroke="#fff" strokeWidth="4" d="m0 0 30 20M30 0 0 20" />
        <path stroke="#C8102E" strokeWidth="1.5" d="m0 0 30 20M30 0 0 20" />
        <path fill="#fff" d="M0 7h30v6H0zM12 0h6v20h-6z" />
        <path fill="#C8102E" d="M0 8.5h30v3H0zM13.5 0h3v20h-3z" />
      </svg>
    );
  return (
    <span
      aria-hidden="true"
      className="grid h-[18px] w-[27px] shrink-0 place-items-center rounded-[2px] bg-white/90 text-[#082B50]"
    >
      <MapPinned className="size-3.5" />
    </span>
  );
}
export default async function Home() {
  const content = await Promise.allSettled([
    getCountries({ limit: 4, sort: "manual" }),
    getUniversities({ featured: "true", limit: 12, sort: "newest" }),
    getScholarships({ featured: "true", limit: 4, sort: "newest" }),
    getServices({ limit: 5, sort: "manual" }),
    getArticles({ limit: 6, sort: "newest" }),
  ]);
  const countries =
    content[0].status === "fulfilled"
      ? content[0].value.items.map(countryCard)
      : [];
  const universities =
    content[1].status === "fulfilled"
      ? content[1].value.items.map(universityCard)
      : [];
  const scholarships =
    content[2].status === "fulfilled"
      ? content[2].value.items.map(scholarshipCard)
      : [];
  const services =
    content[3].status === "fulfilled"
      ? content[3].value.items.map(serviceCard)
      : [];
  const articles =
    content[4].status === "fulfilled"
      ? content[4].value.items.map(articleCard)
      : [];
  const failed = content.some((entry) => entry.status === "rejected");
  const demoMode = isPublicDemoMode();
  const heroCards = [
    { label: "وجهات دراسية", count: countries.length, Icon: MapPinned },
    { label: "جامعات منشورة", count: universities.length, Icon: GraduationCap },
    { label: "منح وبرامج", count: scholarships.length, Icon: CircleDollarSign },
    { label: "خدمات تعليمية", count: services.length, Icon: FileText },
  ];
  return (
    <main className="overflow-x-clip bg-[#FAF9F6]">
      <section
        id="intro"
        aria-labelledby="hero-title"
        className="isolate bg-white"
      >
        <div className="relative">
          <div className="relative h-[17rem] min-w-0 overflow-hidden bg-[#17669C] sm:h-[23rem] lg:absolute lg:inset-0 lg:h-auto">
            <NextImage
              src="/images/hero/study-abroad-student-landmarks.png"
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
            <div className="row-start-1 min-w-0 pb-9 pt-8 text-right sm:pb-12 lg:col-start-1 lg:flex lg:items-center lg:py-10">
              <div className="min-w-0">
                <p className="text-base font-bold text-[#A47B2D]">
                  أكاديمية طريق
                </p>
                <h1
                  id="hero-title"
                  className="mt-3 max-w-[34rem] text-[2.2rem] font-extrabold leading-[1.16] tracking-[-0.04em] text-[#082B50] sm:text-5xl xl:max-w-[38rem] xl:text-[clamp(3.6rem,3.4vw,4rem)]"
                >
                  طريقك نحو جامعة أحلامك يبدأ من هنا
                </h1>
                <p className="mt-5 max-w-[32rem] text-base leading-8 text-[#435A73] sm:text-[1.0625rem] 2xl:max-w-[36rem] 2xl:text-lg 2xl:leading-9">
                  اكتشف فرص الدراسة في أفضل الجامعات حول العالم، مع دعم كامل من
                  اختيار التخصص وحتى الوصول إلى مقعدك الجامعي.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    type="button"
                    size="lg"
                    disabled
                    aria-disabled="true"
                    className="h-13 w-full rounded-lg bg-[#082B50] px-8 text-base font-bold text-white shadow-[0_12px_24px_-14px_rgba(8,43,80,0.75)] hover:bg-[#0D3E70] disabled:cursor-not-allowed disabled:opacity-100 sm:w-auto"
                  >
                    ابدأ رحلتك <ArrowLeftIcon className="size-4" />
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
                <p className="mt-4 text-[0.9375rem] font-semibold leading-7 text-[#52647A]">
                  محتوى منشور يساعدك على المقارنة واتخاذ قرار واعٍ.
                </p>
              </div>
            </div>
            <div className="row-start-2 grid min-w-0 grid-cols-1 gap-3 pb-7 min-[375px]:grid-cols-2 md:grid-cols-4 lg:col-span-2 lg:py-6 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:self-end xl:gap-4 xl:pb-5 xl:pt-0 2xl:gap-5 2xl:pb-7">
              {heroCards.map(({ label, count, Icon }) => (
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
                    {demoMode ? (
                      <strong
                        className="block text-right text-xl font-extrabold tabular-nums 2xl:text-2xl"
                        dir="ltr"
                      >
                        {count}
                      </strong>
                    ) : null}
                    <span className="block text-sm font-bold leading-6 2xl:text-[0.9375rem]">
                      {label}
                    </span>
                  </span>
                </div>
              ))}
              {demoMode ? (
                <span className="w-fit rounded bg-[#082B50]/90 px-2 py-1 text-xs font-semibold text-white min-[375px]:col-span-2 md:col-span-4">
                  أرقام للعرض التجريبي فقط
                </span>
              ) : null}
            </div>
          </Container>
        </div>
      </section>

      {countries.length ? (
        <section
          className="bg-white py-16 sm:py-20"
          aria-labelledby="destinations-title"
        >
          <Container>
            <div className="grid gap-x-5 gap-y-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:items-center xl:gap-x-8">
              <p className="text-sm font-bold text-[#8A6428] lg:col-start-1 lg:row-start-1 lg:self-end">
                اكتشف العالم
              </p>
              <h2
                id="destinations-title"
                className="min-w-0 text-3xl font-extrabold leading-[1.3] text-[#082B50] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:justify-self-center lg:text-center lg:text-[2rem] xl:text-4xl"
              >
                وجهات الدراسة الأكثر طلباً
              </h2>
              <p className="text-base leading-7 text-[#52647A] lg:col-start-1 lg:row-start-2 lg:self-start">
                وجهات مميزة لدراستك الجامعية
              </p>
              <div className="mt-2 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:justify-self-end">
                <MoreLink href="/study-abroad" blue>
                  عرض جميع الوجهات
                </MoreLink>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 2xl:gap-6">
              {countries.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group relative isolate block aspect-[8/5] min-h-[12rem] min-w-0 w-full overflow-hidden rounded-xl bg-[#123B61] text-white shadow-[0_14px_26px_-18px_rgba(8,43,80,0.65)] transition-shadow duration-300 hover:shadow-[0_18px_30px_-16px_rgba(8,43,80,0.7)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#A47B2D] motion-reduce:transition-none"
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none"
                  />
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-[#061B32]/95 via-[#061B32]/50 to-transparent"
                    aria-hidden="true"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-right sm:p-5">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <DestinationFlag slug={item.slug} />
                        <span className="text-xl font-extrabold leading-tight 2xl:text-2xl">
                          {item.title}
                        </span>
                      </span>
                      <span className="mt-1.5 line-clamp-2 text-sm font-medium leading-5 text-white/95">
                        {demoMode
                          ? (demoDestinationLines[item.slug ?? ""] ?? item.body)
                          : item.body}
                      </span>
                    </span>
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-[#C8A253] text-[#082B50] shadow-sm transition-colors group-hover:bg-[#E4C984] group-focus-visible:bg-[#E4C984] motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      <ArrowLeftIcon className="size-4" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
      {universities.length ? (
        <section
          className="border-y border-[#E2E8F0] bg-white py-16 sm:py-20"
          aria-labelledby="universities-title"
        >
          <Container>
            <div className="grid gap-x-4 gap-y-2 text-center lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:items-center">
              <h2
                id="universities-title"
                className="text-3xl font-bold leading-tight text-[#082B50] sm:text-4xl lg:col-start-2 lg:row-start-1"
              >
                جامعات مميزة
              </h2>
              <p className="text-base leading-7 text-[#52647A] lg:col-start-2 lg:row-start-2">
                تعرّف على خيارات الدراسة الجامعية المنشورة.
              </p>
              <div className="mt-2 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-center lg:justify-self-end">
                <MoreLink href="/universities" blue>
                  عرض جميع الجامعات
                </MoreLink>
              </div>
            </div>
            <FeaturedUniversitiesCarousel
              items={universities.map((item) => ({
                id: item.id,
                title: item.title,
                href: item.href,
                countryName: item.meta,
                countrySlug: item.countrySlug,
                city: item.location,
                universityType: demoMode
                  ? demoUniversityTypes[item.slug ?? ""]
                  : undefined,
                logo: demoMode
                  ? demoUniversityLogos[item.slug ?? ""]
                  : undefined,
              }))}
            />
          </Container>
        </section>
      ) : null}
      {services.length ? (
        <section
          className="bg-white py-16 sm:py-20"
          aria-labelledby="services-title"
        >
          <Container>
            <div className="text-center">
              <h2
                id="services-title"
                className="text-3xl font-bold leading-tight text-[#082B50] sm:text-4xl"
              >
                خدماتنا
              </h2>
              <p className="mt-2 text-base leading-7 text-[#52647A]">
                نرافقك في كل خطوة من رحلتك الدراسية.
              </p>
            </div>
            <div
              className={`mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${services.length >= 5 ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
            >
              {services.map((item) => {
                const Icon = serviceIcons[item.slug ?? ""] ?? BookOpenText;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group flex min-w-0 flex-col items-center rounded-xl border border-[#E2E8F0] bg-white px-5 py-6 text-center shadow-[0_10px_25px_-23px_rgba(8,43,80,0.48)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-19px_rgba(8,43,80,0.5)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#A47B2D] motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <span className="grid size-12 place-items-center text-[#B7852C] transition-colors duration-200 group-hover:text-[#C8A253] group-focus-visible:text-[#C8A253] motion-reduce:transition-none">
                      <Icon
                        className="size-10 stroke-[1.6]"
                        aria-hidden="true"
                      />
                    </span>
                    <h3 className="mt-3 text-lg font-bold leading-7 text-[#082B50]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#52647A] 2xl:text-[0.9375rem]">
                      {item.body}
                    </p>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}
      <section
        className="relative isolate overflow-hidden rounded-[1.5rem] bg-[#082B50] text-white"
        aria-labelledby="journey-title"
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[url('/images/journey/journey-background.png')] bg-cover bg-left sm:h-48 md:inset-0 md:h-auto"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-x-0 top-20 h-32 bg-gradient-to-b from-transparent to-[#082B50] md:inset-0 md:h-auto md:bg-gradient-to-l md:from-[#082B50]/95 md:via-[#082B50]/85 md:to-[#082B50]/40"
          aria-hidden="true"
        />
        <Container className="relative pt-48 pb-9 sm:pt-52 md:py-12">
          <div className="max-w-md text-right">
            <p className="text-sm font-bold text-[#F5D98E]">خطوات الرحلة</p>
            <h2
              id="journey-title"
              className="mt-2 text-3xl font-bold leading-[1.3] text-white lg:text-4xl"
            >
              رحلتك الدراسية
            </h2>
            <p className="mt-2 text-base leading-7 text-[#D8E3F0]">
              من الخطوة الأولى إلى بداية رحلتك، نرتّب الخيارات بوضوح.
            </p>
            <a
              href={createWhatsappUrl(
                "مرحبًا، أود الاستفسار عن خطوات بدء رحلتي الدراسية.",
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#F5D98E] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253] motion-reduce:transition-none"
            >
              ابدأ رحلتك <ArrowLeftIcon className="size-4" />
            </a>
          </div>
          <ol className="relative mt-8 grid gap-5 border-s border-[#C8A253]/65 ps-6 md:mt-9 md:grid-cols-2 md:gap-x-0 md:gap-y-8 md:border-s-0 md:ps-0 lg:mt-8 lg:grid-cols-4 lg:gap-y-0">
            {journey.map(([number, title, body]) => (
              <li
                key={number}
                className="group relative min-w-0 ps-10 md:border-t md:border-[#C8A253]/75 md:px-3 md:pt-8 md:text-center"
              >
                <span className="absolute -start-[1.125rem] top-0 grid size-9 place-items-center rounded-full border-2 border-[#082B50] bg-[#C8A253] text-sm font-extrabold text-[#082B50] transition-transform duration-300 group-hover:scale-105 md:start-1/2 md:-top-[1.125rem] md:translate-x-1/2 motion-reduce:transition-none">
                  {number}
                </span>
                <h3 className="text-lg font-bold leading-8 text-white">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#D8E3F0]">{body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <TrustExperience demoMode={demoMode} />
      {articles.length ? (
        <section
          className="bg-white py-20 sm:py-24"
          aria-labelledby="articles-title"
        >
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <Heading
                id="articles-title"
                eyebrow="أحدث المقالات"
                title="محتوى يساعدك على اتخاذ القرار"
                intro="قراءات تعليمية منظمة من المقالات المنشورة."
              />
              <MoreLink href="/articles" blue>عرض جميع المقالات</MoreLink>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              {articles[0] ? (
                <Link
                  href={articles[0].href}
                  className="group relative min-h-[25rem] overflow-hidden rounded-2xl bg-[#082B50] text-white shadow-[0_20px_40px_-30px_rgba(8,43,80,0.65)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253] lg:min-h-[29rem]"
                >
                  <Image
                    src={articles[0].image}
                    alt={articles[0].alt}
                    className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#082B50]/95 via-[#082B50]/40 to-[#082B50]/5" />
                  <span className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <span className="inline-block rounded bg-[#17669C] px-3 py-1 text-xs font-bold">
                      {articles[0].meta}
                    </span>
                    <h3 className="mt-3 max-w-xl text-2xl font-bold leading-9 sm:text-[1.75rem] sm:leading-10">
                      {articles[0].title}
                    </h3>
                    <p className="mt-3 max-w-xl line-clamp-2 text-base leading-8 text-white/85">
                      {articles[0].body}
                    </p>
                    {articles[0].date ? <time className="mt-2 block text-sm text-white/80">{articles[0].date}</time> : null}
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#F5D98E]">
                      اقرأ المقال <ArrowLeftIcon className="size-4" />
                    </span>
                  </span>
                </Link>
              ) : null}
              <div className="grid gap-5 lg:grid-rows-2">
                {articles.slice(1, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group grid min-h-44 grid-cols-[minmax(0,38%)_minmax(0,62%)] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_12px_28px_-24px_rgba(8,43,80,0.45)] transition-shadow hover:shadow-[0_18px_32px_-24px_rgba(8,43,80,0.55)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253] lg:min-h-0"
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                      />
                    </div>
                    <div className="min-w-0 p-4 sm:p-5">
                      <span className="text-xs font-bold text-[#A47B2D]">
                        {item.meta}
                      </span>
                      <h3 className="mt-2 line-clamp-3 text-lg font-bold leading-8 text-[#082B50]">
                        {item.title}
                      </h3>
                      {item.date ? (
                        <time className="mt-3 block text-xs text-[#52647A]">
                          {item.date}
                        </time>
                      ) : null}
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#17669C]">
                        اقرأ المقال <ArrowLeftIcon className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {articles.slice(3).map((item, index, supportingArticles) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group flex min-w-0 items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4 transition-colors hover:bg-[#F8FAFC] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253] ${
                    index === supportingArticles.length - 1 && supportingArticles.length % 2
                      ? "sm:col-span-2 xl:col-span-1"
                      : ""
                  }`}
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#EAF0F6]">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-[#A47B2D]">{item.meta}</span>
                    <span className="line-clamp-2 block font-bold leading-7 text-[#082B50]">
                      {item.title}
                    </span>
                    {item.date ? <time className="mt-1 block text-xs text-[#52647A]">{item.date}</time> : null}
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
      {scholarships.length ? (
        <section
          className="bg-[#F1F5F9] py-20 sm:py-24"
          aria-labelledby="scholarships-title"
        >
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <Heading
                id="scholarships-title"
                eyebrow="المنح الدراسية"
                title="المنح والبرامج المميزة"
                intro="تفاصيل التمويل والحالة تعتمد على السجلات المنشورة فقط."
              />
              <MoreLink href="/scholarships" blue>عرض جميع المنح</MoreLink>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {scholarships.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex min-h-[11.5rem] flex-col rounded-[10px] border border-[#E7ECF2] bg-white p-5 shadow-[0_14px_28px_-26px_rgba(8,43,80,0.42)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[#C8A253] hover:shadow-[0_18px_32px_-24px_rgba(8,43,80,0.45)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#A47B2D] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {item.location ? (
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-[#52647A]">
                      <DestinationFlag slug={item.countrySlug} />
                      {item.location}
                    </span>
                  ) : null}
                  <h3 className={`${item.location ? "mt-4" : ""} text-[1.0625rem] font-bold leading-7 text-[#082B50] sm:text-lg`}>
                    {item.title}
                  </h3>
                  {item.meta ? <span className="mt-2 text-sm text-[#52647A]">{item.meta}</span> : null}
                  {item.body ? (
                    <span className="mt-auto inline-flex w-fit rounded-md bg-[#F9E5B0] px-3 py-1.5 text-xs font-bold leading-5 text-[#082B50]">
                      {item.body}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
      {failed ? (
        <section className="bg-[#FFFDF9] pb-12 pt-8 sm:pb-16">
          <Container>
            <ApiUnavailable />
          </Container>
        </section>
      ) : null}
      <HomeFaq />
      <section
        className="bg-[#FFFDF9] pb-0 pt-4 sm:pt-6"
        aria-labelledby="consultation-title"
      >
        <Container>
          <div className="relative isolate overflow-hidden rounded-[1.5rem] border border-[#2E6591]/45 bg-[#082B50] px-6 py-9 text-white shadow-[0_24px_50px_-34px_rgba(8,43,80,0.8)] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <span
              className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-[center_40%] bg-no-repeat"
              style={{ backgroundImage: "url('/images/footer/footer-skyline.png')" }}
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,43,80,0.38),rgba(8,43,80,0.82)_56%,rgba(8,43,80,0.96))]"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <Eyebrow light>خطوتك التالية</Eyebrow>
                <h2
                  id="consultation-title"
                  className="mt-3 text-3xl font-bold leading-[1.3] sm:text-4xl"
                >
                  مستعد لبدء رحلتك الدراسية؟
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-8 text-white/85 2xl:text-lg 2xl:leading-9">
                  ابدأ رحلتك نحو الدراسة في الخارج، وتواصل معنا لنساعدك في اتخاذ الخطوة التالية.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="min-h-12 shrink-0 bg-[#C8A253] text-[#082B50] hover:bg-[#D8B96E]"
              >
                <a
                  href={createWhatsappUrl(
                    "مرحبًا، أود الاستفسار عن خيارات الدراسة المتاحة.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  تواصل معنا عبر واتساب
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
function countryCard(item: Country): Card {
  return {
    id: item.id,
    slug: item.slug,
    title: item.nameAr,
    href: `/study-abroad/${item.slug}`,
    body: item.introductionAr,
    image: item.imageUrl ?? undefined,
    alt: item.imageAltAr ?? undefined,
  };
}
function universityCard(item: University): Card {
  return {
    id: item.id,
    slug: item.slug,
    title: item.nameAr,
    href: `/universities/${item.slug}`,
    meta: item.country?.nameAr,
    countrySlug: item.country?.slug,
    location: item.cityAr,
  };
}
function scholarshipCard(item: Scholarship): Card {
  return {
    id: item.id,
    title: item.titleAr,
    href: `/scholarships/${item.slug}`,
    body: item.fundingType?.trim() || undefined,
    meta: item.studyLevel || undefined,
    location: item.country?.nameAr,
    countrySlug: item.country?.slug,
  };
}
function serviceCard(item: Service): Card {
  return {
    id: item.id,
    slug: item.slug,
    title: item.titleAr,
    href: `/services/${item.slug}`,
    body: item.summaryAr,
  };
}
function articleCard(item: Article): Card {
  return {
    id: item.id,
    title: item.titleAr,
    href: `/articles/${item.slug}`,
    body: item.summaryAr,
    meta: item.country?.nameAr ?? item.university?.nameAr ?? (item.featured ? "مقال مميز" : "مقال تعليمي"),
    image: item.coverImageUrl ?? undefined,
    alt: item.coverImageAltAr ?? undefined,
    date: item.publishedAt
      ? new Intl.DateTimeFormat("ar", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(item.publishedAt))
      : undefined,
  };
}
