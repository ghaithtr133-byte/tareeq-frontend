import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Landmark, MessageCircle } from "lucide-react";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import type { Country } from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { CountryFaq } from "@/components/public/country-faq";
import { ScholarshipCountryFlag } from "@/components/public/scholarship-country-flag";
import { StudyAbroadImage } from "@/components/public/study-abroad-image";
import { createWhatsappUrl } from "@/lib/whatsapp";
import type { CountryOverviewImage } from "@/lib/country-overview-images";
import { innerPageHero } from "@/lib/inner-page-hero";
import type { DemoCountryDetails } from "@/lib/mocks/country-details-fixtures";
import { CountryStudyGuide } from "@/components/public/country-study-guide";
import { CountryInformation, CountryInformationFact, meaningfulCountryInformation, type CountryInformationItem } from "@/components/public/country-information";

const focus = "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#A47B2D]";

export function CountryDetails({ country, demoDetails, overviewImage, information }: { country: Country; demoDetails: DemoCountryDetails | null; overviewImage: CountryOverviewImage | null; information?: readonly CountryInformationItem[] }) {
  const overview = demoDetails?.overview ?? country.detailsAr.trim();
  const introduction = country.introductionAr.trim();
  const summary = introduction !== overview ? introduction : "";
  const countryQuery = new URLSearchParams({ country: country.slug }).toString();
  const facts = meaningfulCountryInformation(information ?? demoDetails?.facts ?? []);
  return <main className="bg-[#F8FAFC] text-[#082B50]">
    <section aria-labelledby="country-title" className="relative isolate overflow-hidden border-b border-[#E7ECF2] bg-[#F3F7FA]">
      <div className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-full bg-[#EAF0F6] opacity-20 md:w-[54%] md:opacity-100">
        <StudyAbroadImage key={country.imageUrl} src={country.imageUrl} alt={country.imageAltAr || `مشهد من ${country.nameAr}`} />
        <div className="absolute inset-0 bg-gradient-to-l from-[#F3F7FA] via-[#F3F7FA]/70 to-[#F3F7FA]/30 md:via-[#F3F7FA]/20 md:to-transparent" />
      </div>
      <Container className={innerPageHero.content}>
        <nav aria-label="مسار التنقل" className={innerPageHero.breadcrumb}>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li><Link href="/" className={focus}>الرئيسية</Link></li><li aria-hidden="true">/</li>
            <li><Link href="/study-abroad" className={focus}>الوجهات الدراسية</Link></li><li aria-hidden="true">/</li>
            <li aria-current="page" className="font-bold text-[#082B50]">{country.nameAr}</li>
          </ol>
        </nav>
        <div className="md:w-[60%]">
          <p className="text-sm font-bold leading-6 text-[#A47B2D]">الدراسة في</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 id="country-title" className={innerPageHero.title}>{country.nameAr}</h1>
            <span className="shrink-0 [&>svg]:h-6 [&>svg]:w-9"><ScholarshipCountryFlag slug={country.slug} name={country.nameAr} /></span>
          </div>
          {summary ? <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-7 text-[#294563]">{summary}</p> : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link href={`/universities?${countryQuery}`} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#082B50] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#163D66] motion-reduce:transition-none ${focus}`}><Landmark className="size-5 shrink-0" aria-hidden="true" />استكشف جامعات {country.nameAr}</Link>
            <Link href={`/scholarships?${countryQuery}`} style={{ borderColor: "#B58C3C" }} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border bg-white/80 px-4 py-3 text-sm font-bold text-[#8A6428] transition-colors hover:bg-[#FBF5E9] motion-reduce:transition-none ${focus}`}><GraduationCap className="size-5 shrink-0" aria-hidden="true" />استكشف منح {country.nameAr}</Link>
          </div>
        </div>
      </Container>
    </section>

    {overview || facts.length === 1 ? <section aria-labelledby="country-overview-title" className="py-6 sm:py-8">
      <Container className={overviewImage ? "grid items-center gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-8" : ""}><div className={overviewImage ? "min-w-0" : "max-w-4xl"}>
        <h2 id="country-overview-title" className="text-2xl font-bold leading-[1.5] sm:text-3xl">نظرة عامة عن الدراسة في {country.nameAr}</h2>
        <div className="mt-3 h-1 w-14 rounded-full bg-[#C8A253]" aria-hidden="true" />
        <div className="mt-3 space-y-3 text-base leading-8 text-[#52647A]">{overview.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph} className="whitespace-pre-line">{paragraph}</p>)}</div>
        {demoDetails ? <p className="mt-2 text-xs leading-6 text-[#52647A]">محتوى تجريبي توضيحي، وليس دليل قبول رسميًا.</p> : null}
        {facts.length === 1 ? <CountryInformationFact item={facts[0]} inline /> : null}
      </div>
      {overviewImage ? <figure className="min-w-0">
        <div className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-[#EAF0F6]">
          <Image src={overviewImage.src} alt={overviewImage.alt} fill sizes="(min-width: 1600px) 570px, (min-width: 768px) 36vw, 100vw" className="object-cover object-[center_25%]" />
        </div>
        <figcaption className="mt-2 text-xs leading-6 text-[#52647A]">
          الصورة: <a href={overviewImage.source} target="_blank" rel="noreferrer" className={`rounded-sm underline underline-offset-2 hover:text-[#082B50] ${focus}`}><bdi>{overviewImage.author}</bdi></a>
          {" · "}<a href={overviewImage.licenseUrl} target="_blank" rel="noreferrer" className={`rounded-sm underline underline-offset-2 hover:text-[#082B50] ${focus}`}><bdi>{overviewImage.license}</bdi></a>
          {" · تحويل واقتصاص للعرض"}
        </figcaption>
      </figure> : null}
      </Container>
    </section> : null}

    <CountryInformation items={facts} demo={!!demoDetails} />

    {demoDetails?.guide.length ? <CountryStudyGuide countryName={country.nameAr} panels={demoDetails.guide} /> : null}

    {demoDetails?.faqs.length ? <section aria-labelledby="country-faq-title" className="py-6 sm:py-8">
      <Container>
        <h2 id="country-faq-title" className="text-2xl font-bold leading-[1.5] sm:text-3xl">أسئلة شائعة حول الدراسة في {country.nameAr}</h2>
        <div className="mt-5 grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-8">
          <CountryFaq key={country.id} items={demoDetails.faqs} name={`country-${country.id}-faq`} />
          <Image src="/images/faq/faq-help.png" alt="" width={176} height={176} sizes="176px" className="mx-auto hidden h-auto w-full max-w-44 object-contain lg:block" />
        </div>
      </Container>
    </section> : null}

    <Container className="pb-8 pt-2">
      <ConsultationCta titleId="country-contact-title" title={<>هل تفكر بالدراسة في {country.nameAr}؟</>} description={<>تواصل مع فريق طريق للحصول على إرشاد حول الدراسة في {country.nameAr} والجامعات والتخصصات المناسبة لك.</>} backgroundImage="/images/study-abroad/destinations-cta.png" action={
        <a href={createWhatsappUrl(`مرحبًا، أفكر بالدراسة في ${country.nameAr} وأود الاستفسار عن الخيارات المناسبة لي.`)} target="_blank" rel="noreferrer" className={consultationActionClass}><MessageCircle className="size-5" aria-hidden="true" />استشر فريق طريق</a>
      } />
    </Container>
  </main>;
}
