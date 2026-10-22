import { getCountries } from "@/api/public-content";
import { ContentSection, PageIntro } from "@/components/public/page-components";
import { ApiUnavailable, CountryCards, EmptyContent, FilterField, FilterPanel, PaginationLinks, inputClassName } from "@/components/public/public-content";
import { countriesParams, type RouteSearchParams } from "@/lib/public-search-params";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("الدراسة في الخارج", "استكشف وجهات الدراسة المنشورة لدى طريق الأكاديمية.", { index: true, pathname: "/study-abroad" });

export default async function StudyAbroadPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const rawParams = await searchParams;
  const params = countriesParams(rawParams);

  const countries = await getCountries(params).catch(() => undefined);
  if (!countries) {
    return <main><PageIntro eyebrow="وجهات الدراسة" title="وجهات الدراسة في الخارج" intro="تعرّف إلى الوجهات المنشورة ومعلوماتها المعتمدة." /><ContentSection><div className="mx-auto max-w-5xl px-5 sm:px-8"><ApiUnavailable /></div></ContentSection></main>;
  }

  return (
      <main>
        <PageIntro eyebrow="وجهات الدراسة" title="وجهات الدراسة في الخارج" intro="تعرّف إلى الوجهات المنشورة ومعلوماتها المعتمدة." />
        <ContentSection>
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <FilterPanel action="/study-abroad">
              <FilterField label="بحث" htmlFor="search"><input id="search" name="search" type="search" defaultValue={params.search} className={inputClassName} /></FilterField>
              <FilterField label="الظهور" htmlFor="featured"><select id="featured" name="featured" defaultValue={params.featured ?? ""} className={inputClassName}><option value="">الكل</option><option value="true">مميزة</option><option value="false">غير مميزة</option></select></FilterField>
              <FilterField label="الترتيب" htmlFor="sort"><select id="sort" name="sort" defaultValue={params.sort ?? "manual"} className={inputClassName}><option value="manual">الترتيب المعتمد</option><option value="newest">الأحدث</option></select></FilterField>
            </FilterPanel>
            {countries.items.length ? <CountryCards countries={countries.items} /> : <div className="mt-8"><EmptyContent title="لا توجد وجهات دراسة منشورة" /></div>}
            <PaginationLinks pathname="/study-abroad" params={rawParams} pagination={countries.pagination} />
          </div>
        </ContentSection>
      </main>
  );
}
