import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getArticle } from "@/api/public-content";
import { ApiError } from "@/api/error";
import { Container } from "@/components/layout/container";
import { Breadcrumbs, ContentSection, PageIntro } from "@/components/public/page-components";
import { ApiUnavailable, ArticleBlocks, DetailImage } from "@/components/public/public-content";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; try { const article = await getArticle(slug); return createPageMetadata(article.seoTitleAr ?? article.titleAr, article.seoDescriptionAr ?? article.summaryAr, { index: true, pathname: `/articles/${article.slug}`, imageUrl: article.coverImageUrl, publishedAt: article.publishedAt, article: true }); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); return createPageMetadata("المقال", "المقال المنشور لدى طريق الأكاديمية."); } }
export default async function ArticleDetailPage({ params }: Props) { const { slug } = await params; let article; let unavailable = false; try { article = await getArticle(slug); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); unavailable = true; } if (unavailable || !article) return <main><ContentSection><Container className="max-w-5xl"><ApiUnavailable /></Container></ContentSection></main>; return <main><Breadcrumbs items={[{ href: "/", label: "الرئيسية" }, { href: "/articles", label: "المقالات" }, { label: article.titleAr }]} /><PageIntro eyebrow="مقال تعليمي" title={article.titleAr} intro={article.summaryAr} /><ContentSection><Container className="max-w-4xl"><DetailImage src={article.coverImageUrl} alt={article.coverImageAltAr} /><ArticleBlocks blocks={article.bodyAr} /><div className="mt-10 flex flex-wrap gap-4 border-t border-primary/15 pt-6 text-sm font-bold text-primary">{article.country ? <Link href={`/study-abroad/${article.country.slug}`}>وجهة: {article.country.nameAr}</Link> : null}{article.university ? <Link href={`/universities/${article.university.slug}`}>جامعة: {article.university.nameAr}</Link> : null}{article.scholarship ? <Link href={`/scholarships/${article.scholarship.slug}`}>منحة: {article.scholarship.titleAr}</Link> : null}</div></Container></ContentSection></main>; }
