"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

type Option = readonly [string, string];
type FilterValues = Record<string, string>;
type FilterGroup = { key: string; label: string; options: readonly Option[] };
const inputClass =
  "min-h-12 w-full rounded-lg border border-[#DCE4EC] bg-[#FCFDFE] px-3 text-sm text-[#082B50] transition-colors placeholder:text-[#8393A5] hover:border-[#BAC8D5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C8A253]";

export function UniversityDirectoryFilters({
  values,
  groups,
}: {
  values: FilterValues;
  groups: FilterGroup[];
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(values);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signature = JSON.stringify(values);
  const [previousSignature, setPreviousSignature] = useState(signature);

  if (signature !== previousSignature) {
    setPreviousSignature(signature);
    setDraft(values);
  }
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function navigate(next: FilterValues) {
    if (timer.current) clearTimeout(timer.current);
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next))
      if (value.trim() && !(key === "sort" && value === "newest"))
        query.set(key, value.trim());
    router.push(query.size ? `/universities?${query}` : "/universities", {
      scroll: false,
    });
  }

  function change(key: string, value: string) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    if (key === "search") timer.current = setTimeout(() => navigate(next), 450);
    else navigate(next);
  }

  const active = Object.entries(values).filter(
    ([key, value]) => key !== "sort" && value,
  );
  function fields(prefix: string) {
    return (
      <div className="space-y-5">
        <div>
          <label
            htmlFor={`${prefix}-search`}
            className="mb-2 block text-sm font-bold text-[#082B50]"
          >
            البحث بكلمة مفتاحية
          </label>
          <input
            id={`${prefix}-search`}
            type="search"
            value={draft.search ?? ""}
            onChange={(event) => change("search", event.target.value)}
            placeholder="ابحث عن جامعة"
            className={inputClass}
          />
        </div>
        {groups.map((group) => (
          <div key={group.key}>
            <label
              htmlFor={`${prefix}-${group.key}`}
              className="mb-2 block text-sm font-bold text-[#082B50]"
            >
              {group.label}
            </label>
            <select
              id={`${prefix}-${group.key}`}
              value={draft[group.key] ?? ""}
              onChange={(event) => change(group.key, event.target.value)}
              className={inputClass}
            >
              <option value="">الكل</option>
              {group.options.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setDraft({ sort: draft.sort ?? "newest" });
            navigate({ sort: draft.sort ?? "newest" });
          }}
          className="min-h-11 w-full rounded-lg border border-[#DCE4EC] text-sm font-bold text-[#082B50] hover:bg-[#F1F5F9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A253]"
        >
          مسح الفلاتر
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-4 self-start lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:pb-1 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
      <aside
        className="hidden self-start rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[0_12px_35px_-30px_rgba(8,43,80,0.4)] lg:block"
        aria-label="تصفية الجامعات"
      >
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#A47B2D]">
          <Search className="size-5" aria-hidden="true" /> ابحث عن جامعتك
        </h2>
        <p className="mb-6 mt-2 text-sm leading-7 text-[#52647A]">
          اختر المعايير المناسبة لاستكشاف الجامعات المنشورة.
        </p>
        {fields("desktop")}
      </aside>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#C8A253] bg-white px-4 text-sm font-bold text-[#082B50] transition-colors hover:bg-[#FFFDF7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253]"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" /> تصفية
          النتائج {active.length ? `(${active.length})` : ""}
        </button>
      </div>
      <dialog
        ref={dialog}
        aria-labelledby="university-filter-dialog-title"
        className="fixed inset-y-0 right-0 m-0 h-dvh max-h-none w-[min(24rem,100vw)] max-w-none overflow-y-auto bg-white p-6 text-right shadow-xl backdrop:bg-[#041F3C]/60"
        dir="rtl"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2
            id="university-filter-dialog-title"
            className="text-xl font-bold text-[#082B50]"
          >
            تصفية النتائج
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="إغلاق التصفية"
            className="grid size-11 place-items-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A253]"
          >
            <X className="size-5" />
          </button>
        </div>
        {fields("mobile")}
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="mt-5 min-h-12 w-full rounded-lg bg-[#C8A253] text-sm font-bold text-[#082B50]"
        >
          عرض النتائج
        </button>
      </dialog>
      <div
        className="flex flex-wrap items-center gap-2"
        aria-label="الفلاتر النشطة"
      >
        {active.map(([key, value]) => {
          const label =
            key === "featured"
              ? value === "true"
                ? "جامعات مميزة"
                : "جامعات غير مميزة"
              : (groups
                  .find((group) => group.key === key)
                  ?.options.find(([option]) => option === value)?.[1] ?? value);
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                const next = { ...draft, [key]: "" };
                setDraft(next);
                navigate(next);
              }}
              className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#F1F5F9] px-3 text-xs font-semibold text-[#082B50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A253]"
              aria-label={`إزالة فلتر ${label}`}
            >
              {label}
              <X className="size-3" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function UniversitySort({
  value,
  values,
}: {
  value: string;
  values: FilterValues;
}) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-[#52647A]">
      الترتيب{" "}
      <select
        value={value}
        onChange={(event) => {
          const query = new URLSearchParams();
          for (const [key, item] of Object.entries({
            ...values,
            sort: event.target.value,
          }))
            if (item && !(key === "sort" && item === "newest"))
              query.set(key, item);
          router.push(query.size ? `/universities?${query}` : "/universities", {
            scroll: false,
          });
        }}
        className={inputClass}
      >
        <option value="newest">الأحدث</option>
        <option value="name">الاسم (أ–ي)</option>
      </select>
    </label>
  );
}
