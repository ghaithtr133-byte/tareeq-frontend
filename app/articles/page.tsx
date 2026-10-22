import { getArticles, getCountries } from "@/api/public-content";
import { ContentSection, PageIntro } from "@/components/public/page-components";
import { ApiUnavailable, ArticleCards, EmptyContent, FilterField, FilterPanel, PaginationLinks, inputClassName } from "@/components/public/public-content";
import { articlesParams, type RouteSearchParams } from "@/lib/public-search-params";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("المقالات", "المقالات التعليمية المنشورة من طريق الأكاديمية.", { index: true, pathname: "/articles" });

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const rawParams = await searchParams; const params = articlesParams(rawParams); const [articles, countries] = await Promise.allSettled([getArticles(params), getCountries({ limit: 50, sort: "manual" })]);
  if (articles.status === "rejected") return <main><PageIntro eyebrow="مقالات تعليمية" title="قراءة تعليمية هادئة ومفيدة" intro="مقالات منشورة تساعدك على فهم الخيارات والاستعداد لرحلتك التعليمية." /><ContentSection><div className="mx-auto max-w-5xl px-5 sm:px-8"><ApiUnavailable /></div></ContentSection></main>;
  const countryOptions = countries.status === "fulfilled" ? countries.value.items : [];
  return <main><PageIntro eyebrow="مقالات تعليمية" title="قراءة تعليمية هادئة ومفيدة" intro="مقالات منشورة تساعدك على فهم الخيارات والاستعداد لرحلتك التعليمية." /><ContentSection><div className="mx-auto w-full max-w-7xl px-5 sm:px-8"><FilterPanel action="/articles"><FilterField label="بحث" htmlFor="search"><input id="search" name="search" type="search" defaultValue={params.search} className={inputClassName} /></FilterField><FilterField label="البلد" htmlFor="country"><select id="country" name="country" defaultValue={params.country ?? ""} className={inputClassName}><option value="">كل البلدان</option>{countryOptions.map((country) => <option key={country.id} value={country.slug}>{country.nameAr}</option>)}</select></FilterField><FilterField label="الظهور" htmlFor="featured"><select id="featured" name="featured" defaultValue={params.featured ?? ""} className={inputClassName}><option value="">الكل</option><option value="true">مميزة</option><option value="false">غير مميزة</option></select></FilterField><FilterField label="الترتيب" htmlFor="sort"><select id="sort" name="sort" defaultValue={params.sort ?? "newest"} className={inputClassName}><option value="newest">الأحدث</option></select></FilterField></FilterPanel>{articles.value.items.length ? <ArticleCards articles={articles.value.items} /> : <div className="mt-8"><EmptyContent title="لا توجد مقالات منشورة" /></div>}<PaginationLinks pathname="/articles" params={rawParams} pagination={articles.value.pagination} /></div></ContentSection></main>;
}
