import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getUniversity } from "@/api/public-content";
import { loadUniversityScholarships } from "@/api/university-detail-actions";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { ApiUnavailable } from "@/components/public/public-content";
import { UniversityDetails, UniversityHeroLogo } from "@/components/public/university-details";
import { UniversityDirectoryImage } from "@/components/public/university-directory-image";
import { ScholarshipCountryFlag } from "@/components/public/scholarship-country-flag";
import { demoUniversityDetails } from "@/lib/mocks/university-detail-fixtures";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { emptyUniversityContent } from "@/lib/university-details";
import { createPageMetadata } from "@/lib/seo";
import { innerPageHero } from "@/lib/inner-page-hero";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const university = await getUniversity(slug);
    return createPageMetadata(university.seoTitleAr ?? university.nameAr, university.seoDescriptionAr ?? university.overviewAr, {
      index: true, pathname: `/universities/${university.slug}`, imageUrl: isPublicDemoMode() ? undefined : university.imageUrl, publishedAt: university.publishedAt,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return createPageMetadata("الجامعة", "معلومات الجامعة المنشورة لدى طريق الأكاديمية.");
  }
}

export default async function UniversityDetailPage({ params }: Props) {
  const { slug } = await params;
  let university;
  try { university = await getUniversity(slug); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); }
  if (!university) return <main><Container className="py-12"><ApiUnavailable /></Container></main>;
  const demo = isPublicDemoMode();
  // No inference from missing Backend fields and no automatic Live-to-Demo fallback.
  const content = demo ? demoUniversityDetails(university) : emptyUniversityContent();
  const related = await loadUniversityScholarships(university.slug, 1);
  return <main className="bg-[#F5F8FC] pb-10 sm:pb-14">
    <section aria-labelledby="university-title" className="border-b bg-gradient-to-l from-[#F5F8FC] to-[#EDF3F8]">
      <Container className={innerPageHero.content}>
        <nav aria-label="مسار التنقل" className={innerPageHero.breadcrumb}><ol className="flex flex-wrap items-center gap-x-2 gap-y-1"><li><Link href="/" className="rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-accent">الرئيسية</Link></li><li aria-hidden="true">/</li><li><Link href="/universities" className="rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-accent">الجامعات</Link></li><li aria-hidden="true">/</li><li aria-current="page">{university.nameAr}</li></ol></nav>
        <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-8">
          <div className="min-w-0">
            <div className="flex items-start gap-3 sm:gap-4"><UniversityHeroLogo src={content.logo} name={university.nameAr} /><div className="min-w-0"><h1 id="university-title" className={innerPageHero.title}>{university.nameAr}</h1>{university.nameEn ? <p dir="ltr" className="mt-1 text-right text-sm leading-6 text-primary/85 [overflow-wrap:anywhere] sm:text-base">{university.nameEn}</p> : null}</div></div>
            {university.overviewAr ? <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">{university.overviewAr}</p> : null}
            <dl className="mt-4 flex flex-wrap gap-3 text-sm">
              {university.country?.nameAr ? <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-white px-4 py-2.5"><ScholarshipCountryFlag slug={university.country.slug} name={university.country.nameAr} /><div><dt className="text-xs text-muted-foreground">الدولة</dt><dd className="mt-1 font-bold text-primary">{university.country.nameAr}</dd></div></div> : null}
              {university.cityAr ? <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-white px-4 py-2.5"><MapPin className="size-5 text-accent" aria-hidden="true" /><div><dt className="text-xs text-muted-foreground">المدينة</dt><dd className="mt-1 font-bold text-primary">{university.cityAr}</dd></div></div> : null}
            </dl>
          </div>
          <div className="hidden min-w-0 md:block">
            {demo || !university.imageUrl ? <figure><div className="relative aspect-[3/1] overflow-hidden rounded-2xl bg-white/60"><Image src="/images/universities/university-guide-illustration.png" alt="رسم أكاديمي توضيحي، وليس صورة للحرم الجامعي" fill sizes="(min-width: 768px) 42vw, 100vw" className="object-contain" priority /></div><figcaption className="mt-1 text-center text-xs leading-6 text-muted-foreground">رسم توضيحي — لا يمثل الحرم الجامعي</figcaption></figure> : <UniversityDirectoryImage src={university.imageUrl} alt={university.imageAltAr || university.nameAr} className="aspect-[3/1] rounded-2xl" />}
          </div>
        </div>
        {content.logo ? <p className="mt-2 text-xs leading-6 text-muted-foreground">شعار جامعة بوخارست: <a href="https://commons.wikimedia.org/wiki/File:Logo_Universitatea_din_Bucure%C8%99ti.svg" target="_blank" rel="noreferrer" className="underline">جامعة بوخارست</a>، بدون تعديل، <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer" className="underline">CC BY 3.0</a>.</p> : null}
      </Container>
    </section>
    <Container className="pt-5"><UniversityDetails key={`${demo}-${university.id}`} university={university} content={content} demo={demo} initialScholarships={related.ok ? related.data : null} /></Container>
  </main>;
}
