import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCountry, getScholarships, getUniversities } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { Breadcrumbs, ContentSection, PageIntro } from "@/components/public/page-components";
import { ApiUnavailable, ScholarshipCards, UniversityCards } from "@/components/public/public-content";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const country = await getCountry(slug);
    return createPageMetadata(country.seoTitleAr ?? `الدراسة في ${country.nameAr}`, country.seoDescriptionAr ?? country.introductionAr, { index: true, pathname: `/study-abroad/${country.slug}`, imageUrl: country.imageUrl, publishedAt: country.publishedAt });
  } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); return createPageMetadata("وجهة الدراسة", "معلومات وجهة الدراسة المنشورة لدى طريق الأكاديمية."); }
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  let country;
  let unavailable = false;
  try { country = await getCountry(slug); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); unavailable = true; }
  if (unavailable || !country) return <main><ContentSection><Container className="max-w-5xl"><ApiUnavailable /></Container></ContentSection></main>;
  const [universities, scholarships] = await Promise.allSettled([getUniversities({ country: country.slug, limit: 3 }), getScholarships({ country: country.slug, limit: 3 })]);
  return <main><Breadcrumbs items={[{ href: "/", label: "الرئيسية" }, { href: "/study-abroad", label: "الدراسة في الخارج" }, { label: country.nameAr }]} /><PageIntro eyebrow="وجهات الدراسة" title={`الدراسة في ${country.nameAr}`} intro={country.introductionAr} /><ContentSection><Container className="max-w-5xl"><div className="whitespace-pre-line text-base leading-8 text-muted-foreground">{country.detailsAr}</div></Container></ContentSection><ContentSection className="bg-background"><Container><h2 className="text-2xl font-bold text-primary">جامعات مرتبطة</h2>{universities.status === "fulfilled" ? universities.value.items.length ? <UniversityCards universities={universities.value.items} /> : <p className="mt-4 text-muted-foreground">لا توجد جامعات مرتبطة منشورة حاليًا.</p> : <p className="mt-4 text-muted-foreground">يتعذر تحميل الجامعات المرتبطة حاليًا.</p>}<h2 className="mt-14 text-2xl font-bold text-primary">منح مرتبطة</h2>{scholarships.status === "fulfilled" ? scholarships.value.items.length ? <ScholarshipCards scholarships={scholarships.value.items} /> : <p className="mt-4 text-muted-foreground">لا توجد منح مرتبطة منشورة حاليًا.</p> : <p className="mt-4 text-muted-foreground">يتعذر تحميل المنح المرتبطة حاليًا.</p>}<Link href="/study-abroad" className="mt-10 inline-flex text-sm font-bold text-primary hover:text-accent">العودة إلى وجهات الدراسة</Link></Container></ContentSection></main>;
}
