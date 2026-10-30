/* eslint-disable @next/next/no-img-element -- Public API media URLs are optional external content. */
import Link from "next/link";
import type { ReactNode } from "react";

import type { Article, ArticleBlock, Country, Pagination, Scholarship, Service, University } from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { ContentUnavailable } from "@/components/public/page-components";
import { buildArticleToc } from "@/lib/article-toc";
import { queryString, type RouteSearchParams } from "@/lib/public-search-params";

function PublicImage({ src, alt, className = "" }: { src: string | null; alt: string | null; className?: string }) {
  return src ? <img src={src} alt={alt ?? ""} className={`h-full w-full object-cover ${className}`} loading="lazy" /> : null;
}

export function ApiUnavailable() {
  return <ContentUnavailable title="يتعذر تحميل المحتوى حاليًا" description="تعذر الاتصال بمصدر المحتوى المنشور. يرجى المحاولة مرة أخرى لاحقًا." contact />;
}

export function EmptyContent({ title = "لا توجد نتائج منشورة" }: { title?: string }) {
  return <ContentUnavailable title={title} description="لا توجد سجلات منشورة تطابق الطلب الحالي." contact />;
}

export function FilterPanel({ action, title = "تصفية النتائج", children }: { action: string; title?: string; children: ReactNode }) {
  return (
    <form action={action} className="border border-primary/15 bg-card p-5 sm:p-6" aria-label={title}>
      <h2 className="text-lg font-bold text-primary">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" className="min-h-11 bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">تطبيق</button>
        <Link href={action} className="inline-flex min-h-11 items-center border border-primary/25 px-5 text-sm font-bold text-primary hover:bg-secondary">مسح التصفية</Link>
      </div>
    </form>
  );
}

export function FilterField({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="grid gap-2 text-sm font-bold text-primary">{label}{children}</label>;
}

export const inputClassName = "min-h-11 w-full border border-primary/20 bg-background px-3 text-sm text-primary placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none";

export function PaginationLinks({ pathname, params, pagination }: { pathname: string; params: RouteSearchParams; pagination: Pagination }) {
  if (pagination.totalPages <= 1) return null;
  const href = (page: number) => {
    const query = queryString(params, { page: String(page) });
    return query ? `${pathname}?${query}` : pathname;
  };
  return (
    <nav className="mt-10 flex items-center justify-between gap-4 border-t border-primary/15 pt-6" aria-label="ترقيم الصفحات">
      <span className="text-sm text-muted-foreground">الصفحة {pagination.page} من {pagination.totalPages}</span>
      <div className="flex gap-3">
        {pagination.page > 1 ? <Link href={href(pagination.page - 1)} className="inline-flex min-h-11 items-center border border-primary/25 px-4 text-sm font-bold text-primary hover:bg-secondary">السابقة</Link> : <span className="inline-flex min-h-11 items-center border border-primary/10 px-4 text-sm text-muted-foreground" aria-disabled="true">السابقة</span>}
        {pagination.page < pagination.totalPages ? <Link href={href(pagination.page + 1)} className="inline-flex min-h-11 items-center bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90">التالية</Link> : <span className="inline-flex min-h-11 items-center bg-primary/10 px-4 text-sm text-muted-foreground" aria-disabled="true">التالية</span>}
      </div>
    </nav>
  );
}

export function CountryCards({ countries }: { countries: Country[] }) {
  return <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{countries.map((country) => <Link key={country.id} href={`/study-abroad/${country.slug}`} className="group overflow-hidden border border-primary/15 bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">{country.imageUrl ? <div className="aspect-[16/9]"><PublicImage src={country.imageUrl} alt={country.imageAltAr} /></div> : null}<div className="p-6"><p className="text-xs font-bold tracking-[0.14em] text-accent">وجهة دراسية</p><h2 className="mt-3 text-2xl font-bold text-primary group-hover:text-accent">{country.nameAr}</h2><p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{country.introductionAr}</p></div></Link>)}</div>;
}

export function UniversityCards({ universities }: { universities: University[] }) {
  const featuredId = universities.length >= 3 ? universities.find((university) => university.featured)?.id : undefined;
  return <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{universities.map((university) => {
    const isFeatured = university.id === featuredId;
    return <Link key={university.id} href={`/universities/${university.slug}`} className={`group overflow-hidden border border-primary/15 bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${isFeatured ? "sm:col-span-2 sm:grid sm:grid-cols-[minmax(12rem,0.9fr)_minmax(0,1.1fr)] xl:col-span-2" : ""}`}>{university.imageUrl ? <div className={`aspect-[16/9] ${isFeatured ? "sm:aspect-auto" : ""}`}><PublicImage src={university.imageUrl} alt={university.imageAltAr} /></div> : null}<div className={`p-6 ${isFeatured ? "sm:flex sm:flex-col sm:justify-center sm:p-8" : ""}`}><p className="text-sm text-muted-foreground">{university.country?.nameAr ?? ""}{university.cityAr ? `، ${university.cityAr}` : ""}</p>{isFeatured ? <p className="mt-4 text-xs font-bold tracking-[0.14em] text-accent">جامعة مميزة</p> : null}<h2 className={`mt-2 font-bold text-primary group-hover:text-accent ${isFeatured ? "text-2xl leading-9" : "text-xl"}`}>{university.nameAr}</h2><p className={`mt-3 text-sm leading-7 text-muted-foreground ${isFeatured ? "line-clamp-4" : "line-clamp-3"}`}>{university.overviewAr}</p></div></Link>;
  })}</div>;
}

export function ScholarshipCards({ scholarships }: { scholarships: Scholarship[] }) {
  return <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{scholarships.map((scholarship) => <Link key={scholarship.id} href={`/scholarships/${scholarship.slug}`} className="border-t-2 border-accent bg-card p-6 transition-shadow hover:shadow-[0_18px_46px_-36px_color-mix(in_srgb,var(--primary)_45%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold tracking-[0.14em] text-accent">{scholarship.country?.nameAr ?? "منحة دراسية"}</p><span className="text-xs font-bold text-[#51667D]">{scholarship.effectiveApplicationStatus === "CLOSED" ? "مغلق" : "مفتوح"}</span></div><h2 className="mt-3 text-xl font-bold leading-8 text-primary">{scholarship.titleAr}</h2><dl className="mt-5 grid gap-2 border-t border-primary/10 pt-4 text-sm"><div className="flex justify-between gap-3"><dt className="font-normal text-[#51667D]">المستوى</dt><dd className="font-bold text-primary">{scholarship.studyLevel}</dd></div><div className="flex justify-between gap-3"><dt className="font-normal text-[#51667D]">التمويل</dt><dd className="font-bold text-primary">{scholarship.fundingType}</dd></div></dl></Link>)}</div>;
}

export function ServiceCards({ services }: { services: Service[] }) {
  return <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{services.map((service, index) => <Link key={service.id} href={`/services/${service.slug}`} className="border border-primary/15 bg-card p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"><p className="text-xs font-bold tracking-[0.14em] text-accent" dir="ltr">{String(index + 1).padStart(2, "0")}</p><h2 className="mt-7 text-xl font-bold text-primary">{service.titleAr}</h2><p className="mt-3 line-clamp-4 text-sm leading-7 text-muted-foreground">{service.summaryAr}</p></Link>)}</div>;
}

export function ArticleCards({ articles }: { articles: Article[] }) {
  const featuredId = articles.length >= 3 ? articles.find((article) => article.featured)?.id : undefined;
  return <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{articles.map((article) => {
    const isFeatured = article.id === featuredId;
    return <Link key={article.id} href={`/articles/${article.slug}`} className={`group flex flex-col overflow-hidden rounded-xl border border-primary/15 bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${isFeatured ? "sm:col-span-2 sm:grid sm:grid-cols-[minmax(12rem,0.95fr)_minmax(0,1.05fr)] xl:col-span-2" : ""}`}>{article.coverImageUrl ? <div className={`aspect-[16/10] ${isFeatured ? "sm:aspect-auto" : ""}`}><PublicImage src={article.coverImageUrl} alt={article.coverImageAltAr} /></div> : null}<div className={`flex flex-1 flex-col p-6 ${isFeatured ? "sm:justify-center sm:p-8" : ""}`}><p className="text-xs font-bold tracking-[0.14em] text-accent">{isFeatured ? "مقال مميز" : "مقال تعليمي"}</p><h2 className={`mt-3 font-bold leading-8 text-primary group-hover:text-accent ${isFeatured ? "text-2xl leading-9" : "text-xl"}`}>{article.titleAr}</h2><p className={`mt-3 text-sm leading-7 text-muted-foreground ${isFeatured ? "line-clamp-5" : "line-clamp-4"}`}>{article.summaryAr}</p></div></Link>;
  })}</div>;
}

export function DetailImage({ src, alt }: { src: string | null; alt: string | null }) {
  return src ? <div className="mt-8 aspect-[16/8] overflow-hidden border border-primary/15 bg-secondary"><PublicImage src={src} alt={alt} /></div> : null;
}

export function ArticleBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  const headingIds = new Map(buildArticleToc(blocks).map((item) => [item.blockIndex, item.id]));
  return <div className="mt-8 space-y-5 text-base leading-8 text-muted-foreground">{blocks.map((block, index) => {
    const key = `${block.type}-${index}`;
    if (block.type === "heading2") return <h2 id={headingIds.get(index)} key={key} className="scroll-mt-28 pt-8 text-2xl font-bold leading-10 text-primary sm:text-3xl">{block.text}</h2>;
    if (block.type === "heading3") return <h3 id={headingIds.get(index)} key={key} className="scroll-mt-28 pt-4 text-xl font-bold leading-9 text-primary">{block.text}</h3>;
    if (block.type === "bulleted-list") return <ul key={key} className="list-disc space-y-2 pe-6 leading-8"><li>{block.text}</li></ul>;
    if (block.type === "numbered-list") return <ol key={key} className="list-decimal space-y-2 pe-6 leading-8"><li>{block.text}</li></ol>;
    if (block.type === "quote") return <blockquote key={key} className="border-s-4 border-accent bg-secondary/60 p-5 leading-8 text-primary">{block.text}</blockquote>;
    return <p key={key}>{block.text}</p>;
  })}</div>;
}

export function PageShell({ children }: { children: ReactNode }) {
  return <main><Container className="py-12 sm:py-16 lg:py-20">{children}</Container></main>;
}
