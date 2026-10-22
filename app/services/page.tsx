import { getServices } from "@/api/public-content";
import { ContentSection, PageIntro } from "@/components/public/page-components";
import { ApiUnavailable, EmptyContent, FilterField, FilterPanel, PaginationLinks, ServiceCards, inputClassName } from "@/components/public/public-content";
import { servicesParams, type RouteSearchParams } from "@/lib/public-search-params";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("الخدمات", "تعرف إلى الخدمات التعليمية المنشورة لدى طريق الأكاديمية.", { index: true, pathname: "/services" });

export default async function ServicesPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const rawParams = await searchParams; const params = servicesParams(rawParams);
  const services = await getServices(params).catch(() => undefined);
  if (!services) return <main><PageIntro eyebrow="الخدمات" title="خدمات تعليمية بمعلومات موثقة" intro="تعرف إلى الخدمات المنشورة كما يعتمدها فريق طريق الأكاديمية." /><ContentSection><div className="mx-auto max-w-5xl px-5 sm:px-8"><ApiUnavailable /></div></ContentSection></main>;
  return <main><PageIntro eyebrow="الخدمات" title="خدمات تعليمية بمعلومات موثقة" intro="تعرف إلى الخدمات المنشورة كما يعتمدها فريق طريق الأكاديمية." /><ContentSection><div className="mx-auto w-full max-w-7xl px-5 sm:px-8"><FilterPanel action="/services"><FilterField label="الظهور" htmlFor="featured"><select id="featured" name="featured" defaultValue={params.featured ?? ""} className={inputClassName}><option value="">الكل</option><option value="true">مميزة</option><option value="false">غير مميزة</option></select></FilterField><FilterField label="الترتيب" htmlFor="sort"><select id="sort" name="sort" defaultValue={params.sort ?? "manual"} className={inputClassName}><option value="manual">الترتيب المعتمد</option><option value="newest">الأحدث</option></select></FilterField></FilterPanel>{services.items.length ? <ServiceCards services={services.items} /> : <div className="mt-8"><EmptyContent title="لا توجد خدمات منشورة" /></div>}<PaginationLinks pathname="/services" params={rawParams} pagination={services.pagination} /></div></ContentSection></main>;
}
