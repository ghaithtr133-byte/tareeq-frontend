"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Search, X } from "lucide-react";
import { articleDirectoryHref, type ArticleFilterValues } from "@/lib/article-directory";

type CountryOption = { value: string; label: string };
const blank: ArticleFilterValues = { search: "", country: "", featured: "" };
const control = "h-11 w-full min-w-0 rounded-lg border border-[#DEE6EF] bg-white px-3 text-sm text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ArticleDirectoryFilters({ values, countries, optionError, children }: {
  values: ArticleFilterValues;
  countries: CountryOption[];
  optionError: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(values);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signature = JSON.stringify(values);
  const [previous, setPrevious] = useState(signature);
  if (previous !== signature) { setPrevious(signature); setDraft(values); }
  useEffect(() => { if (timer.current) clearTimeout(timer.current); }, [signature]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function navigate(next: ArticleFilterValues) {
    if (timer.current) clearTimeout(timer.current);
    startTransition(() => router.push(articleDirectoryHref(next), { scroll: false }));
  }
  function change(key: keyof ArticleFilterValues, value: string, debounce = false) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    if (debounce) timer.current = setTimeout(() => navigate(next), 450);
    else navigate(next);
  }
  const active = (Object.keys(values) as (keyof ArticleFilterValues)[]).filter((key) => values[key]);
  const labels = { search: "البحث", country: "الدولة", featured: "المقالات المميزة" };
  const countryLabel = (value: string) => countries.find((item) => item.value === value)?.label ?? value;

  return <>
    <form aria-label="البحث وتصفية المقالات" onSubmit={(event) => { event.preventDefault(); navigate(draft); }} className="grid grid-cols-2 items-center gap-2 rounded-xl border border-[#E2E8EF] bg-white/80 p-3 shadow-[0_6px_20px_-18px_rgba(8,43,80,0.3)] md:flex md:flex-wrap md:gap-3">
      <label className="relative col-span-2 block min-w-0 md:w-80 md:shrink-0">
        <span className="sr-only">ابحث في المقالات</span><Search className="pointer-events-none absolute right-3 top-3 size-5 text-[#5B7390]" aria-hidden="true" />
        <input name="search" type="search" value={draft.search} onChange={(event) => change("search", event.target.value, true)} maxLength={200} placeholder="ابحث في المقالات..." className={`${control} pr-10`} />
      </label>
      <label className="min-w-0 md:w-48 md:shrink-0"><span className="sr-only">الدولة</span><select name="country" value={draft.country} onChange={(event) => change("country", event.target.value)} className={control}>
        <option value="">جميع الدول</option>
        {draft.country && !countries.some((item) => item.value === draft.country) ? <option value={draft.country}>{draft.country}</option> : null}
        {countries.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select></label>
      <label className="flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#E2E8EF] bg-white px-2 text-xs font-bold leading-5 text-primary md:px-3 md:text-sm"><input name="featured" type="checkbox" checked={draft.featured === "true"} onChange={(event) => change("featured", event.target.checked ? "true" : "")} className="size-4 shrink-0 accent-primary" />المقالات المميزة</label>
      <p className="ms-auto hidden text-xs text-muted-foreground lg:block">الأحدث أولاً</p>
      {optionError ? <p className="col-span-2 w-full text-xs leading-6 text-muted-foreground">تعذّر تحميل خيارات الدول. يمكنك البحث أو إعادة تحميل الصفحة.</p> : null}
    </form>
    {active.length ? <div aria-label="الفلاتر النشطة" className="mt-3 flex flex-wrap items-center gap-2">
      {active.map((key) => <button key={key} type="button" aria-label={`إزالة ${labels[key]}: ${key === "country" ? countryLabel(values[key]) : key === "featured" ? "مفعلة" : values[key]}`} onClick={() => { const next = { ...draft, [key]: "" }; setDraft(next); navigate(next); }} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-[#DAE4EF] bg-white px-3 text-xs text-primary"><span className="min-w-0 [overflow-wrap:anywhere]">{labels[key]}{key === "featured" ? "" : `: ${key === "country" ? countryLabel(values[key]) : values[key]}`}</span><X className="size-3.5 shrink-0" aria-hidden="true" /></button>)}
      <button type="button" onClick={() => { setDraft(blank); navigate(blank); }} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[#17669C]"><RotateCcw className="size-3.5" aria-hidden="true" />مسح الكل</button>
    </div> : null}
    <div aria-busy={pending} aria-live="polite">{pending ? <div role="status" className="py-8 text-sm text-muted-foreground">جارٍ تحديث المقالات…</div> : children}</div>
  </>;
}
