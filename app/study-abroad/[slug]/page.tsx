import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedCountry, getCountryFaqs, countrySlugIsValid } from "@/api/country-details";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { ErrorState } from "@/components/ui/content-state";
import { CountryDetails } from "@/components/public/country-details";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!countrySlugIsValid(slug)) notFound();
  try {
    const country = await getPublishedCountry(slug);
    return createPageMetadata(country.seoTitleAr ?? `الدراسة في ${country.nameAr}`, country.seoDescriptionAr ?? country.introductionAr, { index: true, pathname: `/study-abroad/${encodeURIComponent(country.slug)}`, imageUrl: country.imageUrl, publishedAt: country.publishedAt });
  } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); return createPageMetadata("وجهة الدراسة", "معلومات وجهة الدراسة المنشورة لدى طريق الأكاديمية."); }
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  if (!countrySlugIsValid(slug)) notFound();
  let country;
  try { country = await getPublishedCountry(slug); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); }
  if (!country) return <main className="bg-[#F8FAFC] py-10"><Container><ErrorState title="يتعذر تحميل معلومات الدولة حالياً" description="يرجى المحاولة مجدداً؛ لم نعرض بيانات تجريبية بدلاً من المحتوى المنشور." variant="section" action={<a href={`/study-abroad/${encodeURIComponent(slug)}`}>إعادة المحاولة</a>} /></Container></main>;
  // Facts and guide lack structured API fields. Country-specific FAQs do have
  // a documented endpoint; failures remain isolated from the country content.
  const demoDetails = isPublicDemoMode() ? (await import("@/lib/mocks/country-details-fixtures")).getDemoCountryDetails(country) : null;
  // Overview media is optional. No dedicated public Backend field is approved
  // yet, so Live must not substitute local/Demo artwork for an Admin image.
  const overviewImage = demoDetails?.overviewImage ?? null;
  const faqs = isPublicDemoMode() ? undefined : await getCountryFaqs(country);
  return <CountryDetails country={country} demoDetails={demoDetails} overviewImage={overviewImage} faqResult={faqs} />;
}
