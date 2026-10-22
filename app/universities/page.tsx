import { getCountries, getUniversities } from "@/api/public-content";
import { ContentSection, PageIntro } from "@/components/public/page-components";
import { ApiUnavailable, EmptyContent, FilterField, FilterPanel, PaginationLinks, UniversityCards, inputClassName } from "@/components/public/public-content";
import { type RouteSearchParams, universitiesParams } from "@/lib/public-search-params";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("الجامعات", "استكشف الجامعات المنشورة لدى طريق الأكاديمية.", { index: true, pathname: "/universities" });

export default async function UniversitiesPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const rawParams = await searchParams;
  const params = universitiesParams(rawParams);
  const [universities, countries] = await Promise.allSettled([getUniversities(params), getCountries({ limit: 50, sort: "manual" })]);
  if (universities.status === "rejected") return <main><PageIntro eyebrow="الجامعات" title="اكتشف الجامعات" intro="تصفح الجامعات المنشورة ومعلوماتها المعتمدة." /><ContentSection><div className="mx-auto max-w-5xl px-5 sm:px-8"><ApiUnavailable /></div></ContentSection></main>;
  const countryOptions = countries.status === "fulfilled" ? countries.value.items : [];
  return <main><PageIntro eyebrow="الجامعات" title="اكتشف الجامعات" intro="تصفح الجامعات المنشورة ومعلوماتها المعتمدة." /><ContentSection><div className="mx-auto w-full max-w-7xl px-5 sm:px-8"><FilterPanel action="/universities"><FilterField label="بحث" htmlFor="search"><input id="search" name="search" type="search" defaultValue={params.search} className={inputClassName} /></FilterField><FilterField label="البلد" htmlFor="country"><select id="country" name="country" defaultValue={params.country ?? ""} className={inputClassName}><option value="">كل البلدان</option>{countryOptions.map((country) => <option key={country.id} value={country.slug}>{country.nameAr}</option>)}</select></FilterField><FilterField label="الظهور" htmlFor="featured"><select id="featured" name="featured" defaultValue={params.featured ?? ""} className={inputClassName}><option value="">الكل</option><option value="true">مميزة</option><option value="false">غير مميزة</option></select></FilterField><FilterField label="الترتيب" htmlFor="sort"><select id="sort" name="sort" defaultValue={params.sort ?? "newest"} className={inputClassName}><option value="newest">الأحدث</option><option value="name">الاسم</option></select></FilterField></FilterPanel>{universities.value.items.length ? <UniversityCards universities={universities.value.items} /> : <div className="mt-8"><EmptyContent title="لا توجد جامعات منشورة" /></div>}<PaginationLinks pathname="/universities" params={rawParams} pagination={universities.value.pagination} /></div></ContentSection></main>;
}
