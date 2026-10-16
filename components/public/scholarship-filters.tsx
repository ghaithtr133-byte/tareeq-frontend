"use client";

import { useRef, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { approvedDestinations } from "@/lib/public-destinations";

type ScholarshipFiltersState = {
  country: string;
  studyLevel: string;
  fundingType: string;
  keyword: string;
};

const filterKeys = ["country", "studyLevel", "fundingType", "keyword"] as const;

function filtersFromSearchParams(searchParams: ReadonlyURLSearchParams): ScholarshipFiltersState {
  return {
    country: searchParams.get("country") ?? "",
    studyLevel: searchParams.get("studyLevel") ?? "",
    fundingType: searchParams.get("fundingType") ?? "",
    keyword: searchParams.get("keyword") ?? "",
  };
}

function hasFilters(filters: ScholarshipFiltersState) {
  return filterKeys.some((key) => filters[key].trim().length > 0);
}

/**
 * URL-only filter state for the scholarship listing. It intentionally does not
 * call the Backend until the approved listing and filtering contract exists.
 */
export function ScholarshipFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const filters = filtersFromSearchParams(searchParams);

  function writeFilters(nextFilters: ScholarshipFiltersState) {
    const nextParams = new URLSearchParams(searchParams.toString());

    filterKeys.forEach((key) => {
      const value = nextFilters[key].trim();
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    writeFilters({
      country: String(formData.get("country") ?? ""),
      studyLevel: String(formData.get("studyLevel") ?? ""),
      fundingType: String(formData.get("fundingType") ?? ""),
      keyword: String(formData.get("keyword") ?? ""),
    });
  }

  function resetFilters() {
    const emptyFilters = { country: "", studyLevel: "", fundingType: "", keyword: "" };
    formRef.current?.reset();
    writeFilters(emptyFilters);
  }

  return (
    <section className="border border-primary/15 bg-card p-5 shadow-[0_18px_46px_-36px_color-mix(in_srgb,var(--primary)_45%,transparent)] sm:p-8" aria-labelledby="scholarship-filter-title">
      <div className="max-w-2xl">
        <p className="text-[0.6875rem] font-bold tracking-[0.17em] text-accent">تصفية المنح</p>
        <h2 id="scholarship-filter-title" className="mt-3 text-2xl font-bold leading-[1.45] text-primary">ابحث ضمن المنح المنشورة</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">تُحفظ اختيارات التصفية في رابط الصفحة. ستتصل هذه الواجهة بالبيانات المنشورة فقط بعد اعتماد عقد Backend الخاص بالمنح.</p>
      </div>

      <form ref={formRef} className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-bold text-primary" htmlFor="scholarship-country">البلد</label>
          <select id="scholarship-country" name="country" defaultValue={filters.country} className="mt-2 min-h-12 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none">
            <option value="">كل البلدان المتاحة</option>
            {approvedDestinations.map((destination) => <option key={destination.slug} value={destination.slug}>{destination.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-primary" htmlFor="scholarship-study-level">المستوى الدراسي</label>
          <input id="scholarship-study-level" name="studyLevel" defaultValue={filters.studyLevel} placeholder="اكتب المستوى عند توفره" className="mt-2 min-h-12 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/75 focus-visible:border-accent focus-visible:outline-none" />
        </div>
        <div>
          <label className="text-sm font-bold text-primary" htmlFor="scholarship-funding-type">نوع التمويل</label>
          <input id="scholarship-funding-type" name="fundingType" defaultValue={filters.fundingType} placeholder="اكتب نوع التمويل عند توفره" className="mt-2 min-h-12 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/75 focus-visible:border-accent focus-visible:outline-none" />
        </div>
        <div>
          <label className="text-sm font-bold text-primary" htmlFor="scholarship-keyword">بحث بكلمة مفتاحية</label>
          <input id="scholarship-keyword" type="search" name="keyword" defaultValue={filters.keyword} placeholder="ابحث في المنح المنشورة" className="mt-2 min-h-12 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/75 focus-visible:border-accent focus-visible:outline-none" />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit">تطبيق التصفية</Button>
          <Button type="button" variant="outline" onClick={resetFilters}>مسح التصفية</Button>
        </div>
      </form>

      <div className="mt-7 border-t border-primary/15 pt-6" aria-live="polite">
        {hasFilters(filters) ? <p className="text-sm leading-7 text-muted-foreground">لا توجد منح منشورة تطابق عوامل التصفية الحالية. لا تعرض هذه الصفحة سجلات تجريبية بدل المحتوى المعتمد.</p> : <p className="text-sm leading-7 text-muted-foreground">لا توجد منح منشورة حاليًا يمكن تصفيتها.</p>}
      </div>
    </section>
  );
}
