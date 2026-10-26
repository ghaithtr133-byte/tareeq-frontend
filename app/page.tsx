/* eslint-disable @next/next/no-img-element -- public API content may provide remote image URLs. */
import Link from "next/link";
import NextImage from "next/image";
import {
  CircleDollarSign,
  FileText,
  GraduationCap,
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
};
const journey = [
  ["01", "اختيار الوجهة", "حدّد ما يناسب خطتك الدراسية."],
  ["02", "اختيار الجامعة", "اقرأ الخيارات المنشورة بوضوح."],
  ["03", "تجهيز ملف التقديم", "رتّب وثائقك وخطوتك التالية."],
  ["04", "بدء الرحلة", "تابع مسارك بمعلومات موثوقة."],
] as const;
const serviceIcons = [GraduationCap, MapPinned, CircleDollarSign, FileText];
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
}: {
  href: string;
  children: string;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-[0.9375rem] font-bold transition-colors hover:text-[#C8A253] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A253] ${light ? "text-white" : "text-[#082B50]"}`}
    >
      {children}
      <ArrowLeftIcon className="size-4" />
    </Link>
  );
}
function UniversityMark({ title }: { title: string }) {
  return (
    <div className="grid aspect-[16/7] place-items-center border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 text-center">
      <span className="max-w-48 text-base font-extrabold leading-6 text-[#082B50]">
        {title}
      </span>
    </div>
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
    getUniversities({ featured: "true", limit: 4, sort: "newest" }),
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
                <MoreLink href="/study-abroad">عرض جميع الوجهات</MoreLink>
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
          className="border-y border-[#E2E8F0] bg-white py-20 sm:py-24"
          aria-labelledby="universities-title"
        >
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <Heading
                id="universities-title"
                eyebrow="جامعات مميزة"
                title="اكتشف الجامعات المناسبة لخطة دراستك"
                intro="السجلات المعروضة تعتمد على المحتوى المنشور فقط."
              />
              <MoreLink href="/universities">عرض جميع الجامعات</MoreLink>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {universities.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_16px_30px_-28px_rgba(8,43,80,0.65)] transition-shadow hover:shadow-[0_22px_36px_-26px_rgba(8,43,80,0.5)]"
                >
                  <UniversityMark title={item.title} />
                  <div className="p-5">
                    <span className="text-xs font-bold text-[#A47B2D]">
                      {item.meta ?? "جامعة منشورة"}
                    </span>
                    <h3 className="mt-2 text-lg font-bold leading-8 text-[#082B50]">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-7 text-[#52647A] 2xl:text-base">
                      {item.body}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#17669C]">
                      التفاصيل <ArrowLeftIcon className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
      {services.length ? (
        <section
          className="bg-[#F1F5F9] py-20 sm:py-24"
          aria-labelledby="services-title"
        >
          <Container>
            <Heading
              id="services-title"
              eyebrow="خدماتنا"
              title="دعم عملي لكل خطوة في رحلتك الدراسية"
              intro="خدمات منشورة تساعدك على ترتيب الأسئلة والاستعداد للخطوة التالية."
              center
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {services.map((item, index) => {
                const Icon = serviceIcons[index % serviceIcons.length];
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group min-h-52 rounded-xl border border-[#E2E8F0] bg-white p-5 text-center shadow-[0_12px_25px_-25px_rgba(8,43,80,0.65)]"
                  >
                    <span className="mx-auto grid size-10 place-items-center text-[#C8A253]">
                      <Icon className="size-7" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-[#082B50] group-hover:text-[#17669C]">
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-7 text-[#52647A] 2xl:text-base">
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
        className="relative overflow-hidden bg-[#082B50] py-18 text-white sm:py-20"
        aria-labelledby="journey-title"
      >
        <span
          className="pointer-events-none absolute bottom-0 start-0 h-20 w-56 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,162,83,0.28),transparent_65%)]"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Heading
              id="journey-title"
              eyebrow="رحلتك الدراسية"
              title="رحلتك تبدأ بخطوة واضحة"
              intro="من اختيار الوجهة إلى تجهيز المسار الدراسي، نرتّب المعلومات المنشورة أمامك."
              light
            />
            <a
              href={createWhatsappUrl(
                "مرحبًا، أود الاستفسار عن خطوات بدء رحلتي الدراسية.",
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-[#C8A253] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A253]"
            >
              ابدأ رحلتك
              <ArrowLeftIcon className="size-4" />
            </a>
          </div>
          <ol className="relative mt-12 grid gap-9 md:grid-cols-2 xl:grid-cols-4 xl:gap-0 xl:before:absolute xl:before:inset-x-0 xl:before:top-3 xl:before:h-px xl:before:bg-[#C8A253]/75">
            {journey.map(([number, title, body]) => (
              <li
                key={number}
                className="relative pt-8 xl:px-5 first:xl:pe-0 last:xl:ps-0"
              >
                <span className="absolute top-0 grid size-7 place-items-center rounded-full bg-[#C8A253] text-xs font-extrabold text-[#082B50]">
                  {number}
                </span>
                <h3 className="mt-2 text-lg font-bold">{title}</h3>
                <p className="mt-3 max-w-64 text-base leading-8 text-white/75">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
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
              <MoreLink href="/articles">عرض جميع المقالات</MoreLink>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-[1.28fr_0.72fr]">
              {articles[0] ? (
                <Link
                  href={articles[0].href}
                  className="group relative min-h-[29rem] overflow-hidden rounded-2xl bg-[#082B50] text-white"
                >
                  <Image
                    src={articles[0].image}
                    alt={articles[0].alt}
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#082B50]/95 via-[#082B50]/35 to-[#082B50]/5" />
                  <span className="absolute inset-x-0 bottom-0 p-7">
                    <span className="inline-block rounded bg-[#17669C] px-3 py-1 text-xs font-bold">
                      مقال مميز
                    </span>
                    <h3 className="mt-4 max-w-xl text-2xl font-bold leading-10">
                      {articles[0].title}
                    </h3>
                    <p className="mt-3 max-w-xl line-clamp-2 text-base leading-8 text-white/85">
                      {articles[0].body}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#F5D98E]">
                      اقرأ المقال <ArrowLeftIcon className="size-4" />
                    </span>
                  </span>
                </Link>
              ) : null}
              <div className="grid gap-5">
                {articles.slice(1, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group grid min-h-52 grid-cols-[0.8fr_1.2fr] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white"
                  >
                    <div className="overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-bold text-[#A47B2D]">
                        مقال تعليمي
                      </span>
                      <h3 className="mt-2 line-clamp-3 text-lg font-bold leading-8 text-[#082B50]">
                        {item.title}
                      </h3>
                      {item.date ? (
                        <time className="mt-3 block text-xs text-[#52647A]">
                          {item.date}
                        </time>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {articles.slice(3).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-xl border border-[#E2E8F0] p-4 transition-colors hover:bg-[#F8FAFC]"
                >
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-[#EAF0F6]">
                    <Image src={item.image} alt={item.alt} />
                  </div>
                  <span>
                    <span className="line-clamp-2 block font-bold leading-7 text-[#082B50]">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs text-[#52647A]">
                      {item.date ?? "مقال منشور"}
                    </span>
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
              <MoreLink href="/scholarships">عرض جميع المنح</MoreLink>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {scholarships.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-xl border border-[#E2E8F0] border-t-4 border-t-[#C8A253] bg-white p-6 shadow-[0_16px_30px_-28px_rgba(8,43,80,0.65)]"
                >
                  <span className="text-xs font-bold text-[#A47B2D]">
                    {item.meta ?? "منحة دراسية"}
                  </span>
                  <h3 className="mt-3 text-xl font-bold leading-8 text-[#082B50]">
                    {item.title}
                  </h3>
                  <p className="mt-4 border-t border-[#E2E8F0] pt-4 text-base leading-7 text-[#52647A]">
                    {item.body ?? "تفاصيل التمويل المنشورة"}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#17669C]">
                    عرض التفاصيل <ArrowLeftIcon className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
      {failed ? (
        <section className="bg-white">
          <Container>
            <ApiUnavailable />
          </Container>
        </section>
      ) : null}
      <section
        className="relative overflow-hidden bg-[#082B50] py-16 text-white sm:py-20"
        aria-labelledby="consultation-title"
      >
        <span
          className="pointer-events-none absolute inset-y-0 start-0 w-1/3 bg-[linear-gradient(110deg,rgba(23,102,156,0.45),transparent)]"
          aria-hidden="true"
        />
        <Container className="relative flex flex-wrap items-center justify-between gap-8">
          <div>
            <Eyebrow light>خطوتك التالية</Eyebrow>
            <h2
              id="consultation-title"
              className="mt-3 text-3xl font-bold leading-[1.3] sm:text-4xl"
            >
              مستعد لبدء رحلتك الدراسية؟
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-white/75 2xl:text-lg 2xl:leading-9">
              تواصل عبر واتساب للتعرّف على الخيارات المنشورة وكيفية ترتيب خطوتك
              التالية.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-[#C8A253] text-[#082B50] hover:bg-[#D8B96E]"
          >
            <a
              href={createWhatsappUrl(
                "مرحبًا، أود الاستفسار عن خيارات الدراسة المتاحة.",
              )}
              target="_blank"
              rel="noreferrer"
            >
              تواصل عبر واتساب
            </a>
          </Button>
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
    title: item.nameAr,
    href: `/universities/${item.slug}`,
    body: item.overviewAr,
    meta: item.country?.nameAr ?? item.cityAr,
  };
}
function scholarshipCard(item: Scholarship): Card {
  return {
    id: item.id,
    title: item.titleAr,
    href: `/scholarships/${item.slug}`,
    body: item.fundingType,
    meta: item.country?.nameAr ?? item.studyLevel,
  };
}
function serviceCard(item: Service): Card {
  return {
    id: item.id,
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
