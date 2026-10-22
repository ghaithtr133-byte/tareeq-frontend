import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getService } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { Breadcrumbs, ContentSection, PageIntro } from "@/components/public/page-components";
import { ApiUnavailable, DetailImage } from "@/components/public/public-content";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; try { const service = await getService(slug); return createPageMetadata(service.seoTitleAr ?? service.titleAr, service.seoDescriptionAr ?? service.summaryAr, { index: true, pathname: `/services/${service.slug}`, imageUrl: service.imageUrl, publishedAt: service.publishedAt }); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); return createPageMetadata("الخدمة التعليمية", "معلومات الخدمة المنشورة لدى طريق الأكاديمية."); } }
export default async function ServiceDetailPage({ params }: Props) { const { slug } = await params; let service; let unavailable = false; try { service = await getService(slug); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); unavailable = true; } if (unavailable || !service) return <main><ContentSection><Container className="max-w-5xl"><ApiUnavailable /></Container></ContentSection></main>; return <main><Breadcrumbs items={[{ href: "/", label: "الرئيسية" }, { href: "/services", label: "الخدمات" }, { label: service.titleAr }]} /><PageIntro eyebrow="الخدمات" title={service.titleAr} intro={service.summaryAr} /><ContentSection><Container className="max-w-5xl"><DetailImage src={service.imageUrl} alt={service.imageAltAr} /><div className="mt-8 whitespace-pre-line text-base leading-8 text-muted-foreground">{service.descriptionAr}</div></Container></ContentSection></main>; }
