import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCountry } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { ApiUnavailable } from "@/components/public/public-content";
import { CountryDetails } from "@/components/public/country-details";
import { getCountryOverviewImage } from "@/lib/country-overview-images";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const country = await getCountry(slug);
    return createPageMetadata(country.seoTitleAr ?? `الدراسة في ${country.nameAr}`, country.seoDescriptionAr ?? country.introductionAr, { index: true, pathname: `/study-abroad/${encodeURIComponent(country.slug)}`, imageUrl: country.imageUrl, publishedAt: country.publishedAt });
  } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); return createPageMetadata("وجهة الدراسة", "معلومات وجهة الدراسة المنشورة لدى طريق الأكاديمية."); }
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  let country;
  try { country = await getCountry(slug); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); }
  if (!country) return <main className="bg-[#F8FAFC] py-10"><Container><ApiUnavailable /></Container></main>;
  // The API has no structured facts, study guide, secondary image or country FAQ association.
  // Demo overview/facts/guide/FAQs stay isolated; Live may use only explicitly mapped local imagery.
  const demoDetails = isPublicDemoMode() ? (await import("@/lib/mocks/country-details-fixtures")).getDemoCountryDetails(country) : null;
  const overviewImage = demoDetails?.overviewImage ?? getCountryOverviewImage(country.slug);
  return <CountryDetails country={country} demoDetails={demoDetails} overviewImage={overviewImage} />;
}
