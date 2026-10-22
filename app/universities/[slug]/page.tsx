import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getScholarships, getUniversity } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { Breadcrumbs, ContentSection, PageIntro } from "@/components/public/page-components";
import { ApiUnavailable, DetailImage, ScholarshipCards } from "@/components/public/public-content";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try { const university = await getUniversity(slug); return createPageMetadata(university.seoTitleAr ?? university.nameAr, university.seoDescriptionAr ?? university.overviewAr, { index: true, pathname: `/universities/${university.slug}`, imageUrl: university.imageUrl, publishedAt: university.publishedAt }); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); return createPageMetadata("الجامعة", "معلومات الجامعة المنشورة لدى طريق الأكاديمية."); }
}

export default async function UniversityDetailPage({ params }: Props) {
  const { slug } = await params;
  let university;
  let unavailable = false;
  try { university = await getUniversity(slug); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); unavailable = true; }
  if (unavailable || !university) return <main><ContentSection><Container className="max-w-5xl"><ApiUnavailable /></Container></ContentSection></main>;
  const related = await getScholarships({ university: university.slug, limit: 3 }).then((value) => ({ value })).catch(() => undefined);
  return <main><Breadcrumbs items={[{ href: "/", label: "الرئيسية" }, { href: "/universities", label: "الجامعات" }, { label: university.nameAr }]} /><PageIntro eyebrow={university.country?.nameAr ?? "الجامعات"} title={university.nameAr} intro={university.overviewAr} /><ContentSection><Container className="max-w-5xl"><DetailImage src={university.imageUrl} alt={university.imageAltAr} /><dl className="mt-8 grid gap-4 border-y border-primary/15 py-6 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">المدينة</dt><dd className="mt-1 font-bold text-primary">{university.cityAr}</dd></div>{university.officialWebsite ? <div><dt className="text-muted-foreground">الموقع الرسمي</dt><dd className="mt-1"><a href={university.officialWebsite} target="_blank" rel="noreferrer" className="font-bold text-primary underline hover:text-accent">زيارة الموقع الرسمي</a></dd></div> : null}</dl></Container></ContentSection><ContentSection className="bg-background"><Container><h2 className="text-2xl font-bold text-primary">منح مرتبطة</h2>{related ? related.value.items.length ? <ScholarshipCards scholarships={related.value.items} /> : <p className="mt-4 text-muted-foreground">لا توجد منح مرتبطة منشورة حاليًا.</p> : <p className="mt-4 text-muted-foreground">يتعذر تحميل المنح المرتبطة حاليًا.</p>}<Link href="/universities" className="mt-10 inline-flex text-sm font-bold text-primary hover:text-accent">العودة إلى الجامعات</Link></Container></ContentSection></main>;
}
