/* eslint-disable @next/next/no-img-element -- Review media is externally hosted with provenance recorded in the isolated fixture. */
import Link from "next/link";

import { Container } from "@/components/layout/container";
import {
  ContentSection,
  EditorialLink,
  SectionTitle,
} from "@/components/public/page-components";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowUpLeftIcon } from "@/components/ui/icons";
import { shouldShowDesignReviewDisclosure } from "@/lib/mocks/design-review-mode";
import {
  designReviewMock,
  isDesignReviewMockEnabled,
} from "@/lib/mocks/public-design-review";
import { approvedDestinations } from "@/lib/public-destinations";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
  "طريق الأكاديمية",
  "استشارات تعليمية وتوجيه للدراسة في الخارج.",
  { index: !isDesignReviewMockEnabled, pathname: "/" },
);

function EditorialImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      loading={priority ? "eager" : "lazy"}
    />
  );
}

function DestinationFlag({
  country,
}: {
  country: "romania" | "turkey" | "poland";
}) {
  const sharedProps = {
    "aria-hidden": true,
    className:
      "h-[18px] w-[26px] shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]",
    focusable: false,
    viewBox: "0 0 26 18",
  };

  if (country === "romania") {
    return (
      <svg {...sharedProps}>
        <path fill="#002B7F" d="M0 0h8.67v18H0z" />
        <path fill="#FCD116" d="M8.67 0h8.66v18H8.67z" />
        <path fill="#CE1126" d="M17.33 0H26v18h-8.67z" />
      </svg>
    );
  }

  if (country === "turkey") {
    return (
      <svg {...sharedProps}>
        <path fill="#E30A17" d="M0 0h26v18H0z" />
        <circle cx="10" cy="9" r="5.1" fill="#fff" />
        <circle cx="11.7" cy="9" r="4.1" fill="#E30A17" />
        <path
          fill="#fff"
          d="m15.9 5.8.78 2.4h2.53l-2.04 1.48.78 2.4-2.05-1.48-2.05 1.48.78-2.4-2.04-1.48h2.53z"
        />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path fill="#fff" d="M0 0h26v9H0z" />
      <path fill="#DC143C" d="M0 9h26v9H0z" />
    </svg>
  );
}

export default function Home() {
  const review = isDesignReviewMockEnabled;
  const scholarships = designReviewMock.scholarships.slice(0, 3);
  const articles = designReviewMock.articles.slice(0, 3);

  return (
    <main className="overflow-x-clip">
      <section
        id="intro"
        className="relative isolate overflow-hidden bg-primary text-primary-foreground"
        aria-labelledby="hero-title"
      >
        <div
          className="absolute inset-y-0 start-0 hidden w-[48%] bg-[#245a9c] lg:block"
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 end-[38%] size-72 rounded-full border border-accent/35 lg:size-[29rem]"
          aria-hidden="true"
        />
        <Container className="relative grid gap-9 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-0 lg:py-0">
          <div className="flex max-w-2xl flex-col justify-center py-2 lg:py-[clamp(5rem,9vw,8.5rem)]">
            <p className="flex items-center gap-3 text-sm font-semibold tracking-[0.14em] text-[#D4B57A]">
              <span className="h-px w-10 bg-accent" aria-hidden="true" />
              استشارات تعليمية
            </p>
            <h1
              id="hero-title"
              className="mt-6 max-w-xl text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-primary-foreground md:text-5xl xl:text-6xl"
            >
              رحلتك للدراسة في الخارج تبدأ هنا
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-primary-foreground/80 sm:text-lg sm:leading-9">
              تساعد طريق الأكاديمية الطلاب على اختيار وجهات الدراسة والجامعات،
              وتقدّم توجيهاً واضحاً خلال إجراءات القبول الجامعي.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="bg-accent text-primary hover:bg-accent/90"
              >
                <Link href="/apply">ابدأ طلبك</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/45 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a
                  href="https://wa.me/963992277142"
                  target="_blank"
                  rel="noreferrer"
                >
                  تواصل عبر واتساب
                </a>
              </Button>
            </div>
            <p className="mt-6 text-xs leading-6 text-primary-foreground/65">
              للاستفسارات العامة: <span dir="ltr">+963 992 277 142</span>
            </p>
          </div>
          <div className="relative min-h-[17rem] overflow-hidden border border-primary-foreground/15 sm:min-h-[23rem] lg:-ms-4 lg:min-h-full lg:border-y-0">
            <EditorialImage
              {...designReviewMock.heroImage}
              priority
              className="object-[52%_center] opacity-90"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-5 bottom-5 border-s-2 border-accent bg-primary/85 p-4 backdrop-blur-sm sm:bottom-7 sm:end-7 sm:max-w-xs">
              <p className="text-lg font-bold leading-7 text-primary-foreground">
                ابدأ بخطوة مدروسة نحو مستقبلك الأكاديمي.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <ContentSection className="bg-background">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="وجهات الدراسة"
              title="اكتشف وجهتك الدراسية"
              intro="تعرّف على وجهات الدراسة التي تساعد أكاديمية طريق في استكشاف خياراتها."
              eyebrowClassName="text-sm font-semibold tracking-[0.14em] text-[#8A6428]"
            />
            <EditorialLink href="/study-abroad">استكشف الوجهات</EditorialLink>
          </div>
          {review ? (
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {designReviewMock.destinations.map((destination) => (
                <Link
                  key={destination.slug}
                  href={`/study-abroad/${destination.slug}`}
                  className="group relative isolate min-h-72 overflow-hidden rounded-xl border border-primary/15 bg-primary p-6 text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  <EditorialImage
                    {...destination.image}
                    className="absolute inset-0 scale-100 object-cover opacity-95 transition-transform duration-200 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
                  />
                  <span
                    className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-primary/5"
                    aria-hidden="true"
                  />
                  <span className="relative flex h-full flex-col justify-end">
                    {/* <span className="text-xs font-bold tracking-[0.14em] text-accent drop-shadow-sm">
                      {destination.note}
                    </span> */}
                    <span>
                      <span className="flex items-center gap-2">
                        <span className="text-3xl font-bold leading-none">
                          {destination.name}
                        </span>
                        <DestinationFlag country={destination.slug} />
                      </span>
                      <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary-foreground/90 transition-colors duration-200 group-hover:text-accent group-focus-visible:text-accent motion-reduce:transition-none">
                        عرض الوجهة <ArrowLeftIcon className="size-4" />
                      </span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-px bg-primary/15 md:grid-cols-3">
              {approvedDestinations.map((destination) => (
                <Link
                  key={destination.slug}
                  href={`/study-abroad/${destination.slug}`}
                  className="bg-card p-6 transition-colors hover:bg-secondary focus-visible:bg-secondary"
                >
                  <p className="text-xs font-bold tracking-[0.14em] text-accent">
                    وجهة معتمدة
                  </p>
                  <h3 className="mt-6 text-2xl font-bold text-primary">
                    {destination.name}
                  </h3>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    استكشف الوجهة <ArrowLeftIcon className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </ContentSection>

      {review ? (
        <>
          {shouldShowDesignReviewDisclosure ? (
            <div className="border-y border-accent/35 bg-secondary/65 py-3 text-center text-sm font-semibold text-primary">
              هذه معاينة تحتوي على محتوى إرشادي غير منشور.
            </div>
          ) : null}
          <ContentSection className="bg-secondary/65">
            <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
              <SectionTitle
                eyebrow="كيف نساعدك"
                title="كيف نساعدك في رحلتك الدراسية؟"
                intro="نقدّم إرشاداً تعليمياً يساعدك على فهم خيارات الدراسة واختيار المسار المناسب."
                eyebrowClassName="text-sm font-semibold tracking-[0.14em] text-[#8A6428]"
              />
              <div className="grid gap-px bg-primary/15 md:grid-cols-2 xl:grid-cols-3">
                {designReviewMock.services.map((service, index) => {
                  const isLastService = index === designReviewMock.services.length - 1;

                  return (
                  <article
                    key={service.number}
                    className={`bg-background p-6 sm:p-7 ${isLastService ? "md:col-span-2 xl:col-span-1 md:flex md:items-start md:gap-8 xl:block" : ""}`}
                  >
                    <p
                      className="text-xs font-bold tracking-[0.16em] text-accent md:shrink-0"
                      dir="ltr"
                    >
                      {service.number}
                    </p>
                    <div>
                      <h3 className="mt-8 text-xl font-bold leading-8 text-primary md:mt-0 xl:mt-8">
                        {service.title}
                      </h3>
                      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </article>
                  );
                })}
              </div>
            </Container>
          </ContentSection>
          <section
            className="bg-[#EDF3F8] py-14 text-[#162D50] sm:py-20 lg:py-24"
            aria-labelledby="journey-title"
          >
            <Container>
              <div className="max-w-2xl">
                <p className="text-sm font-semibold tracking-[0.14em] text-[#8A6428]">
                  رحلتك الدراسية
                </p>
                <h2
                  id="journey-title"
                  className="mt-4 text-3xl font-bold leading-[1.35] tracking-tight text-[#162D50] sm:text-4xl"
                >
                  رحلتك تبدأ بخطوة واضحة
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#51667D] sm:text-base">
                  من استكشاف الخيارات إلى الحصول على الإرشاد المناسب لخطوتك
                  القادمة.
                </p>
              </div>
              <ol className="mx-auto mt-10 grid max-w-[800px] gap-0 border-y border-[#C7D4E3] lg:max-w-none lg:grid-cols-3">
                {designReviewMock.journey.map((step) => (
                  <li
                    key={step.number}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 border-b border-[#C7D4E3] py-7 last:border-0 lg:block lg:border-b-0 lg:px-8 lg:first:pe-0 lg:last:ps-8 lg:not(:last-child):border-s"
                  >
                    <span
                      className="text-sm font-semibold tracking-[0.14em] text-[#162D50]"
                      dir="ltr"
                    >
                      {step.number}
                    </span>
                    <h3 className="text-xl font-bold text-[#162D50] lg:mt-5">{step.title}</h3>
                    <p className="col-start-2 mt-2 max-w-sm text-sm leading-7 text-[#51667D] lg:mt-3">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </Container>
          </section>
          <ContentSection className="bg-background py-10 sm:py-12 lg:py-14">
            <Container>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle
                  eyebrow="الجامعات"
                  title="استكشف الجامعات"
                  intro="استكشف مؤسسات تعليمية في وجهات دراسية مختلفة."
                  eyebrowClassName="text-sm font-semibold tracking-[0.14em] text-[#8A6428]"
                />
                <EditorialLink href="/universities">
                  استكشف جميع الجامعات
                </EditorialLink>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-2 min-[1200px]:!grid-cols-3">
                {designReviewMock.universities.map((university, index) => (
                  <article
                    key={university.name}
                    className={`group overflow-hidden border border-primary/15 bg-card ${index > 3 ? "hidden min-[1200px]:block" : ""}`}
                  >
                    <div className="relative aspect-[16/8] overflow-hidden">
                      <EditorialImage
                        {...university.image}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* <span className="absolute end-3 top-3 bg-primary/85 px-2 py-1 text-[0.625rem] font-bold text-primary-foreground">
                        صورة تعليمية إرشادية
                      </span> */}
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold leading-8 text-primary">
                        {university.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {university.place}
                      </p>
                      <EditorialLink href="/universities">
                        <span className="mt-5">استكشف الجامعات</span>
                      </EditorialLink>
                    </div>
                  </article>
                ))}
              </div>
            </Container>
          </ContentSection>
          <ContentSection className="bg-[#edf1f5] py-10 sm:py-12 lg:py-14">
            <Container>
              <SectionTitle
                eyebrow="المنح الدراسية"
                title="اكتشف المنح الدراسية"
                intro="نماذج إرشادية تساعدك على تنظيم البحث في أنواع التمويل الدراسي."
                eyebrowClassName="text-sm font-semibold tracking-[0.14em] text-[#8A6428]"
              />
              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {scholarships.map((scholarship, index) => {
                  const isOddFinalCard = scholarships.length % 2 === 1 && index === scholarships.length - 1;

                  return (
                    <article
                      key={`${scholarship.country}-${scholarship.level}`}
                      className={`overflow-hidden border-t-2 border-accent bg-card ${isOddFinalCard ? "md:col-span-2 md:grid md:grid-cols-[minmax(14rem,0.75fr)_minmax(0,1.25fr)] xl:block xl:col-span-1" : ""}`}
                    >
                      <div className={`aspect-[16/7] overflow-hidden ${isOddFinalCard ? "md:aspect-auto xl:aspect-[16/7]" : ""}`}>
                        <EditorialImage
                          {...scholarship.image}
                          className="transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className={`p-6 ${isOddFinalCard ? "md:flex md:flex-col md:justify-center xl:block" : ""}`}>
                        <p className="text-xs font-bold tracking-[0.15em] text-accent">
                          {scholarship.country}
                        </p>
                        <h3 className="mt-3 text-xl font-bold leading-8 text-primary">
                          {scholarship.title}
                        </h3>
                        <dl className={`mt-5 grid gap-2 border-t border-primary/10 pt-4 text-sm ${isOddFinalCard ? "md:max-w-md xl:max-w-none" : ""}`}>
                          <div className="flex justify-between gap-4">
                            <dt className="font-medium text-[#51667D]">المستوى</dt>
                            <dd className="font-semibold text-primary">
                              {scholarship.level}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="font-medium text-[#51667D]">
                              محور البحث
                            </dt>
                            <dd className="font-semibold text-primary">
                              {scholarship.category}
                            </dd>
                          </div>
                        </dl>
                        <EditorialLink href="/scholarships">
                          <span className="mt-5">اكتشف المنح الدراسية</span>
                        </EditorialLink>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Container>
          </ContentSection>
          <ContentSection className="bg-background py-10 sm:py-12 lg:py-14">
            <Container>
              <SectionTitle
                eyebrow="مقالات تعليمية"
                title="دليلك إلى الدراسة بالخارج"
                intro="مقالات تساعدك على فهم الخيارات والاستعداد لرحلتك التعليمية."
                eyebrowClassName="text-sm font-semibold tracking-[0.14em] text-[#8A6428]"
              />
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {articles.map((article, index) => {
                  const isOddFinalCard = articles.length % 2 === 1 && index === articles.length - 1;

                  return (
                  <article
                    key={article.title}
                    className={`group flex overflow-hidden rounded-xl border border-primary/15 bg-card ${isOddFinalCard ? "md:col-span-2 md:flex-row xl:col-span-1 xl:flex-col" : "flex-col"}`}
                  >
                    <div className={`aspect-[16/10] overflow-hidden bg-primary ${isOddFinalCard ? "md:w-[38%] md:shrink-0 md:aspect-auto xl:w-auto xl:aspect-[16/10]" : ""}`}>
                      <EditorialImage
                        {...article.image}
                        className="opacity-85 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[0.625rem] font-bold tracking-[0.15em] text-accent">
                        دليل إرشادي
                      </p>
                      <h3 className="mt-3 text-2xl font-bold leading-9 text-primary">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {article.summary}
                      </p>
                      <EditorialLink href="/articles">
                        <span className="mt-5">اقرأ المقالات</span>
                      </EditorialLink>
                    </div>
                  </article>
                  );
                })}
              </div>
            </Container>
          </ContentSection>
          <ContentSection className="bg-secondary/65 py-10 sm:py-12 lg:py-14">
            <Container>
              <SectionTitle
                eyebrow="فيديوهات تعليمية"
                title="فيديوهات عن الدراسة بالخارج"
                intro="مواد مرئية تساعدك على استكشاف الدراسة والحياة الجامعية."
                eyebrowClassName="text-sm font-semibold tracking-[0.14em] text-[#8A6428]"
              />
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {designReviewMock.videos.map((video) => (
                  <a
                    key={video.url}
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden border border-primary/15 bg-card focus-visible:outline-offset-4"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <EditorialImage
                        {...video.thumbnail}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 grid place-items-center bg-primary/25">
                        <span className="grid size-14 place-items-center rounded-full bg-background text-primary">
                          <ArrowUpLeftIcon className="size-5" />
                        </span>
                      </span>
                    </div>
                    <p className="p-5 text-lg font-bold text-primary">
                      {video.title}
                    </p>
                  </a>
                ))}
              </div>
            </Container>
          </ContentSection>
        </>
      ) : null}

      <section
        className="border-t border-[#C7D4E3] bg-[#F8F7F3] py-14 text-[#162D50] sm:py-20"
        aria-labelledby="consultation-title"
      >
        <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.14em] text-[#8A6428]">
              خطوتك التالية
            </p>
            <h2
              id="consultation-title"
              className="mt-4 text-3xl font-bold leading-[1.35] sm:text-4xl"
            >
              هل تحتاج مساعدة في اختيار وجهتك الدراسية؟
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#51667D] sm:text-base">
              تواصل مع طريق الأكاديمية عبر واتساب للاستفسارات العامة حول الدراسة
              في الخارج والقبول الجامعي.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button
              asChild
              size="lg"
              className="bg-accent text-primary hover:bg-accent/90"
            >
              <a
                href="https://wa.me/963992277142"
                target="_blank"
                rel="noreferrer"
              >
                تواصل عبر واتساب
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-[#162D50]/45 text-[#162D50] hover:bg-[#162D50]/10"
            >
              <Link href="/apply">معلومات طلب المساعدة</Link>
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
