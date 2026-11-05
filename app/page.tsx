import { HomeHero } from "@/components/home/home-hero";
import { HomeImage as Image } from "@/components/home/home-image";
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
  type Article,
  type Country,
  type Scholarship,
  type Service,
} from "@/api/public-content";
import { HomeContainer as Container, HomeLink as Link } from "@/components/home/home-primitives";
import { FeaturedUniversitiesCarousel } from "@/components/home/featured-universities-carousel";
import { HomeFaq } from "@/components/home/home-faq";
import { TrustExperience } from "@/components/home/trust-experience";
import { loadHomeSection } from "@/api/homepage";
import { HomeSectionError } from "@/components/home/home-section-error";
import { EmptyState } from "@/components/ui/content-state";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { getHomeJourney } from "@/lib/homepage-journey";
import { approvedHomeCardCopy, homeCardText } from "@/lib/homepage-card-content";
import { homeMetadataLabel, type HomeResult, type HomeUniversity } from "@/lib/homepage-data";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { createPageMetadata } from "@/lib/seo";
import { createWhatsappUrl } from "@/lib/whatsapp";
import { publishedServiceHref } from "@/lib/service-details";
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
  universityType?: string;
  applicationStatus?: string;
};
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
  const demoMode = isPublicDemoMode();
  const journey = getHomeJourney(demoMode);
  const [countryResult, universityResult, scholarshipResult, serviceResult, articleResult, faqResult] = await Promise.all([
    loadHomeSection("countries", demoMode), loadHomeSection("universities", demoMode),
    loadHomeSection("scholarships", demoMode), loadHomeSection("services", demoMode),
    loadHomeSection("articles", demoMode), loadHomeSection("faqs", demoMode),
  ]);
  // Collection projections expose countryId, not joined country metadata. Reuse only
  // the bounded destination response; never fetch every country or infer a relation.
  const withCountry = <T extends { countryId?: string | null }>(item: T) => ({ ...item, country: countryResult.items.find((country) => country.id === item.countryId) });
  const countries = countryResult.items.map(countryCard);
  const universities = universityResult.items.map((item) => universityCard(item.country ? item : withCountry(item)));
  const scholarships = scholarshipResult.items.map((item) => scholarshipCard(item.country ? item : withCountry(item)));
  const services = serviceResult.items.map(serviceCard);
  const articles = articleResult.items.map((item) => articleCard(item.country ? item : withCountry(item)));
  // The public /services contract returns only published entries but omits status.
  const admissionHref = serviceResult.kind === "partial" ? "/services" : publishedServiceHref("القبول الجامعي", serviceResult.items.map((item) => ({ ...item, status: "PUBLISHED" as const }))) ?? "/services";
  const heroCards = [
    // Only this query is unfiltered. Featured university/scholarship totals are
    // subset counts, not published catalogue totals; keep those slots unavailable.
    { label: "وجهات دراسية", Icon: MapPinned, count: !demoMode && (countryResult.kind === "success" || countryResult.kind === "empty") ? countryResult.total : undefined },
    { label: "جامعات منشورة", Icon: GraduationCap },
    { label: "منح وبرامج", Icon: CircleDollarSign },
  ];
  return (
    <main className="overflow-x-clip bg-[#FAF9F6]">
      <HomeHero admissionHref={admissionHref} heroCards={heroCards} />

      {(
        <section
          className="bg-white py-12 sm:py-14"
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
                الوجهات الدراسية
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
            {countries.length ? (<>
            <BalancedCardGrid className="mt-8" columns={{ sm: 2, xl: 4 }} gap={5}>
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
                      <span className="mt-1.5 line-clamp-2 text-sm font-normal leading-5 text-white/95">
                        {homeCardText(item.body, "وصف الوجهة")}
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
            </BalancedCardGrid>
          
            </>) : <HomeCollectionState result={countryResult} section="countries" />}
          </Container>
        </section>
      )}
      {(
        <section
          className="border-y border-[#E2E8F0] bg-white py-12 sm:py-14"
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
              <div   className="mt-2 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-center lg:justify-self-end">
                <MoreLink href="/universities" blue>
                  عرض جميع الجامعات
                </MoreLink>
              </div>
            </div>
            {universities.length ? (<>
            <FeaturedUniversitiesCarousel
              items={universities.map((item) => ({
                id: item.id,
                title: item.title,
                href: item.href,
                countryName: item.meta,
                countrySlug: item.countrySlug,
                city: item.location,
                universityType: item.universityType,
              }))}
            />
          
            </>) : <HomeCollectionState result={universityResult} section="universities" />}
          </Container>
        </section>
      )}
      {(
        <section
          className="bg-white py-12 sm:py-14"
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
            {services.length ? (<>
            <BalancedCardGrid className="mt-8" columns={{ sm: 2, lg: 3, xl: 5 }} gap={4}>
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
                      {homeCardText(item.body, "وصف الخدمة")}
                    </p>
                  </Link>
                );
              })}
            </BalancedCardGrid>
          
            </>) : <HomeCollectionState result={serviceResult} section="services" />}
          </Container>
        </section>
      )}
      <section
        className="relative isolate overflow-hidden rounded-[1.5rem] bg-[#082B50] text-white"
        aria-labelledby="journey-title"
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[url('/images/journey/journey-background.png')] bg-cover bg-left sm:h-36 md:inset-0 md:h-auto"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-x-0 top-16 h-32 bg-gradient-to-b from-transparent to-[#082B50] md:inset-0 md:h-auto md:bg-gradient-to-l md:from-[#082B50]/95 md:via-[#082B50]/85 md:to-[#082B50]/40"
          aria-hidden="true"
        />
        <Container className="relative pb-7 pt-36 sm:pt-40 md:py-8">
          <div className="max-w-md text-right">
            <p className="text-sm font-bold text-[#F5D98E]">{journey.eyebrow}</p>
            <h2
              id="journey-title"
              className="mt-2 text-3xl font-bold leading-[1.3] text-white lg:text-4xl"
            >
              {journey.title}
            </h2>
            <p className="mt-2 text-base leading-7 text-[#D8E3F0]">
              {journey.description}
            </p>
          </div>
          <ol className="relative mt-6 grid gap-4 border-s border-[#C8A253]/65 ps-6 md:grid-cols-2 md:gap-x-0 md:gap-y-7 md:border-s-0 md:ps-0 lg:grid-cols-4 lg:gap-y-0">
            {journey.steps.map(({ number, title, description }) => (
              <li
                key={number}
                className="group relative min-w-0 ps-10 md:border-t md:border-[#C8A253]/75 md:px-3 md:pt-6 md:text-center"
              >
                <span className="absolute -start-[1.125rem] top-0 grid size-9 place-items-center rounded-full border-2 border-[#082B50] bg-[#C8A253] text-sm font-extrabold text-[#082B50] transition-transform duration-300 group-hover:scale-105 md:start-1/2 md:-top-[1.125rem] md:translate-x-1/2 motion-reduce:transition-none">
                  {number}
                </span>
                <h3 className="text-lg font-bold leading-8 text-white">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#D8E3F0]">{description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <TrustExperience />
      {(
        <section
          className="bg-white py-12 sm:py-16"
          aria-labelledby="articles-title"
        >
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5 sm:items-center">
              <Heading
                id="articles-title"
                eyebrow="أحدث المقالات"
                title="محتوى يساعدك على اتخاذ القرار"
                intro="قراءات تعليمية منظمة من المقالات المنشورة."
              />
              <MoreLink href="/articles" blue>عرض جميع المقالات</MoreLink>
            </div>
            {articles.length ? (<>
            <div className={`mt-8 grid gap-5 ${articles.length === 1 ? "mx-auto max-w-2xl" : "lg:grid-cols-[1.3fr_0.7fr]"}`}>
              {articles[0] ? (
                <Link
                  href={articles[0].href}
                  className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl bg-[#082B50] text-white shadow-[0_20px_40px_-30px_rgba(8,43,80,0.65)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253] lg:min-h-[25.5rem] 2xl:min-h-[27rem]"
                >
                  <Image
                    src={articles[0].image}
                    alt={articles[0].alt}
                    className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#082B50]/95 via-[#082B50]/40 to-[#082B50]/5" />
                  <span className="relative p-6 sm:p-7">
                    <span className="inline-block rounded bg-[#17669C] px-3 py-1 text-xs font-bold">
                      {homeCardText(articles[0].meta, "تصنيف المقال")}
                    </span>
                    <h3 className="mt-3 max-w-xl text-2xl font-bold leading-9 sm:text-[1.75rem] sm:leading-10">
                      {articles[0].title}
                    </h3>
                    <p className="mt-3 max-w-xl line-clamp-2 text-base leading-8 text-white/85">
                      {homeCardText(articles[0].body, "ملخص المقال")}
                    </p>
                    <span className="mt-2 block text-sm text-white/80">{articles[0].date ? <time>{articles[0].date}</time> : homeCardText(undefined, "تاريخ النشر")}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#F5D98E]">
                      اقرأ المقال <ArrowLeftIcon className="size-4" />
                    </span>
                  </span>
                </Link>
              ) : null}
              {articles.length > 1 ? <div className={`grid gap-5 ${articles.length >= 3 ? "lg:grid-rows-2" : "lg:content-center"}`}>
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
                    <div className="min-w-0 p-3 sm:p-4">
                      <span className="text-xs font-bold text-[#A47B2D]">
                        {homeCardText(item.meta, "تصنيف المقال")}
                      </span>
                      <h3 className="mt-1.5 line-clamp-3 text-lg font-bold leading-7 text-[#082B50]">
                        {item.title}
                      </h3>
                      <span className="mt-2 block text-xs text-[#52647A]">{item.date ? <time>{item.date}</time> : homeCardText(undefined, "تاريخ النشر")}</span>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#17669C]">
                        اقرأ المقال <ArrowLeftIcon className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div> : null}
            </div>
            {articles.length > 3 ? <BalancedCardGrid className="mt-5" columns={{ sm: 2, xl: 3 }} gap={4}>
              {articles.slice(3).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group flex min-w-0 items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4 transition-colors hover:bg-[#F8FAFC] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253]`}
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#EAF0F6]">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-[#A47B2D]">{homeCardText(item.meta, "تصنيف المقال")}</span>
                    <span className="line-clamp-2 block font-bold leading-7 text-[#082B50]">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs text-[#52647A]">{item.date ? <time>{item.date}</time> : homeCardText(undefined, "تاريخ النشر")}</span>
                  </span>
                </Link>
              ))}
            </BalancedCardGrid> : null}
          
            </>) : <HomeCollectionState result={articleResult} section="articles" />}
          </Container>
        </section>
      )}
      {(
        <section
          className="bg-[#F1F5F9] py-12 sm:py-16"
          aria-labelledby="scholarships-title"
        >
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5 sm:items-center">
              <Heading
                id="scholarships-title"
                eyebrow="المنح الدراسية"
                title="المنح والبرامج المميزة"
                intro="تفاصيل التمويل والحالة تعتمد على السجلات المنشورة فقط."
              />
              <MoreLink href="/scholarships" blue>عرض جميع المنح</MoreLink>
            </div>
            {scholarships.length ? (<>
            <BalancedCardGrid className="mt-8" columns={{ sm: 2, xl: 4 }}>
              {scholarships.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex min-h-[11.5rem] flex-col rounded-[10px] border border-[#E7ECF2] bg-white p-5 shadow-[0_14px_28px_-26px_rgba(8,43,80,0.42)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[#C8A253] hover:shadow-[0_18px_32px_-24px_rgba(8,43,80,0.45)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#A47B2D] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#52647A]">
                      <DestinationFlag slug={item.countrySlug} />
                      {homeCardText(item.location, "دولة المنحة")}
                  </span>
                  <h3 className="mt-4 text-[1.0625rem] font-bold leading-7 text-[#082B50] sm:text-lg">
                    {item.title}
                  </h3>
                  <span className="mt-2 text-xs font-bold text-[#52647A]">{homeCardText(item.applicationStatus, "حالة التقديم")}</span>
                  <span className="mt-2 text-sm text-[#52647A]">{homeCardText(item.meta, "المرحلة الدراسية")}</span>
                  <span className="mt-auto inline-flex w-fit rounded-md bg-[#F9E5B0] px-3 py-1.5 text-xs font-bold leading-5 text-[#082B50]">
                    {homeCardText(item.body, "نوع التمويل")}
                  </span>
                </Link>
              ))}
            </BalancedCardGrid>
          
            </>) : <HomeCollectionState result={scholarshipResult} section="scholarships" />}
          </Container>
        </section>
      )}
      <HomeFaq questions={faqResult.items.map((item) => ({ question: item.questionAr, answer: item.answerAr }))} state={!faqResult.items.length ? <HomeCollectionState result={faqResult} section="faqs" /> : undefined} />
      <div className="bg-[#FFFDF9] pb-0 pt-4 sm:pt-6">
        <Container>
          <ConsultationCta titleId="consultation-title" eyebrow="خطوتك التالية" title="مستعد لبدء رحلتك الدراسية؟" description="ابدأ رحلتك نحو الدراسة في الخارج، وتواصل معنا لنساعدك في اتخاذ الخطوة التالية." backgroundImage="/images/footer/footer-skyline.png" action={
                <a
                  draggable={false}
                  href={createWhatsappUrl(
                    "مرحبًا، أود الاستفسار عن خيارات الدراسة المتاحة.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className={consultationActionClass}
                >
                  تواصل معنا عبر واتساب
                </a>
          } />
        </Container>
      </div>
    </main>
  );
}
function countryCard(item: Country): Card {
  const original = approvedHomeCardCopy("countries", item.slug, item.nameAr);
  return {
    id: item.id,
    slug: item.slug,
    title: item.nameAr,
    href: `/study-abroad/${item.slug}`,
    body: homeCardText(item.introductionAr, "وصف الوجهة", original?.description),
    image: item.imageUrl ?? undefined,
    alt: item.imageAltAr ?? undefined,
  };
}
function universityCard(item: HomeUniversity): Card {
  const original = approvedHomeCardCopy("universities", item.slug, item.nameAr);
  return {
    id: item.id,
    slug: item.slug,
    title: item.nameAr,
    href: `/universities/${item.slug}`,
    meta: homeCardText(item.country?.nameAr, "الدولة", original?.country),
    countrySlug: item.country?.slug,
    location: homeCardText(item.city?.nameAr || item.cityAr, "المدينة", original?.city),
    universityType: homeCardText(item.universityType === "PUBLIC" ? "حكومية" : item.universityType === "PRIVATE" ? "خاصة" : undefined, "نوع الجامعة", original?.universityType),
  };
}
function scholarshipCard(item: Scholarship): Card {
  return {
    id: item.id,
    title: item.titleAr,
    href: `/scholarships/${item.slug}`,
    body: homeMetadataLabel(item.fundingType),
    meta: homeMetadataLabel(item.studyLevel),
    location: item.country?.nameAr,
    countrySlug: item.country?.slug,
    applicationStatus: (item.effectiveApplicationStatus ?? item.applicationStatus) === "OPEN" ? "التقديم مفتوح" : (item.effectiveApplicationStatus ?? item.applicationStatus) === "CLOSED" ? "التقديم مغلق" : undefined,
  };
}
function serviceCard(item: Service): Card {
  const original = approvedHomeCardCopy("services", item.slug, item.titleAr);
  return {
    id: item.id,
    slug: item.slug,
    title: item.titleAr,
    href: `/services/${item.slug}`,
    body: homeCardText(item.summaryAr, "وصف الخدمة", original?.description),
  };
}
function articleCard(item: Article): Card {
  return {
    id: item.id,
    title: item.titleAr,
    href: `/articles/${item.slug}`,
    body: item.summaryAr,
    meta: item.country?.nameAr ?? item.university?.nameAr ?? (item.featured ? "مقال مميز" : undefined),
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

const homeStates = {
  countries: { name: "الوجهات الدراسية", empty: "لا توجد وجهات منشورة حالياً", description: "يمكنك استكشاف الجامعات المنشورة أو العودة لاحقاً للاطلاع على الوجهات الجديدة.", href: "/universities", action: "استكشف الجامعات" },
  universities: { name: "الجامعات المميزة", empty: "لا توجد جامعات مميزة حالياً", description: "يمكنك تصفح دليل الجامعات للاطلاع على الخيارات المنشورة.", href: "/universities", action: "استكشف الجامعات" },
  scholarships: { name: "المنح المميزة", empty: "لا توجد منح مميزة حالياً", description: "يمكنك استكشاف الوجهات الدراسية أو مراجعة دليل المنح لمعرفة الفرص المنشورة.", href: "/scholarships", action: "استكشف المنح" },
  articles: { name: "المقالات", empty: "لا توجد مقالات منشورة حالياً", description: "يمكنك استكشاف الوجهات الدراسية والعودة لاحقاً لقراءة المقالات الجديدة.", href: "/study-abroad", action: "استكشف الوجهات الدراسية" },
  faqs: { name: "الأسئلة الشائعة", empty: "لا توجد أسئلة شائعة منشورة حالياً", description: "يمكنك التواصل مع فريق طريق لطرح سؤالك.", href: "/contact", action: "تواصل معنا" },
  services: { name: "الخدمات", empty: "لا توجد خدمات منشورة حالياً", description: "يمكنك التواصل مع فريق طريق للاستفسار عن الخطوة الدراسية المناسبة لك.", href: "/contact", action: "تواصل معنا" },
} as const;

function HomeCollectionState({ result, section }: { result: HomeResult<unknown>; section: keyof typeof homeStates }) {
  const config = homeStates[section];
  const failed = result.kind === "error" || (result.kind === "partial" && !result.items.length);
  return <div className="mt-6">
    {failed ? <HomeSectionError title={`تعذّر تحميل ${config.name}`} description="المعلومات غير متاحة حالياً. يرجى المحاولة مجدداً؛ بقية أقسام الصفحة ما زالت متاحة." /> : <EmptyState title={config.empty} description={config.description} icon={section === "countries" ? <MapPinned /> : <BookOpenText />} action={<Link href={config.href} className="focus-visible:outline-2 focus-visible:outline-accent">{config.action}</Link>} />}
  </div>;
}
