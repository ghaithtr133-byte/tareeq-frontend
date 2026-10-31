"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  scholarshipDirectoryHref,
  scholarshipFilterKeys,
  type ScholarshipFilterKey,
  type ScholarshipFilterValues,
} from "@/lib/scholarship-directory";

type Option = { value: string; label: string };
const controlClass =
  "h-11 w-full min-w-0 rounded-lg border border-[#DCE4EC] bg-white px-3 text-sm text-primary placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";
const labels: Record<ScholarshipFilterKey, string> = {
  search: "البحث",
  country: "الدولة",
  university: "الجامعة",
  studyLevel: "المستوى الدراسي",
  fundingType: "نوع التمويل",
  applicationStatus: "حالة التقديم",
  featured: "الظهور",
  sort: "الترتيب",
};

export function ScholarshipDirectoryFilters({
  values,
  countries,
  universities,
  demoOptions,
  optionError,
  children,
}: {
  values: ScholarshipFilterValues;
  countries: Option[];
  universities: Option[];
  demoOptions?: { studyLevel: Option[]; fundingType: Option[] };
  optionError: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(values);
  const [pending, startTransition] = useTransition();
  const [advanced, setAdvanced] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signature = JSON.stringify(values);
  const [previous, setPrevious] = useState(signature);
  if (previous !== signature) {
    setPrevious(signature);
    setDraft(values);
  }
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
  }, [signature]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function navigate(next: ScholarshipFilterValues) {
    if (timer.current) clearTimeout(timer.current);
    startTransition(() =>
      router.push(scholarshipDirectoryHref(next), { scroll: false }),
    );
  }
  function change(key: ScholarshipFilterKey, value: string, debounce = false) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    if (debounce) timer.current = setTimeout(() => navigate(next), 450);
    else navigate(next);
  }
  const options = {
    country: countries,
    university: universities,
    studyLevel: demoOptions?.studyLevel ?? [],
    fundingType: demoOptions?.fundingType ?? [],
    applicationStatus: [
      { value: "OPEN", label: "مفتوح" },
      { value: "CLOSED", label: "مغلق" },
    ],
    featured: [
      { value: "true", label: "مميزة" },
      { value: "false", label: "غير مميزة" },
    ],
    sort: [
      { value: "newest", label: "الأحدث أولاً" },
      { value: "deadline", label: "الأقرب لانتهاء التقديم" },
    ],
  };
  function select(
    key: Exclude<ScholarshipFilterKey, "search">,
    placeholder: string,
  ) {
    const items = options[key];
    return (
      <select
        id={`scholarships-${key}`}
        value={draft[key]}
        onChange={(event) => change(key, event.target.value)}
        className={controlClass}
      >
        {key !== "sort" ? <option value="">{placeholder}</option> : null}
        {draft[key] && !items.some((item) => item.value === draft[key]) ? (
          <option value={draft[key]}>{draft[key]}</option>
        ) : null}
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    );
  }
  const active = scholarshipFilterKeys.filter(
    (key) => values[key] && !(key === "sort" && values[key] === "newest"),
  );
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          navigate(draft);
        }}
        aria-label="البحث وتصفية المنح الدراسية"
        className="rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-[0_8px_24px_-20px_rgba(8,43,80,0.4)] sm:p-4"
      >
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:flex lg:items-center">
          <label className="relative col-span-2 block min-w-0 lg:w-80 lg:shrink-0">
            <span className="sr-only">ابحث عن منحة دراسية</span>
            <Search
              className="pointer-events-none absolute right-3 top-3 size-5 text-[#607185]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={draft.search}
              onChange={(event) => change("search", event.target.value, true)}
              maxLength={200}
              placeholder="ابحث عن منحة دراسية..."
              className={`${controlClass} pr-10`}
            />
          </label>
          <label className="min-w-0 lg:w-56 lg:shrink-0">
            <span className="sr-only">الدولة</span>
            {select("country", "جميع الدول")}
          </label>
          <button
            type="button"
            aria-expanded={advanced}
            aria-controls="scholarship-advanced"
            onClick={() => setAdvanced(!advanced)}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#DCE4EC] bg-[#F5F8FB] px-3 text-sm font-bold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent lg:w-48"
          >
            <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />
            تصفية متقدمة
            <ChevronDown
              className={`size-3 shrink-0 transition-transform motion-reduce:transition-none ${advanced ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
        <div id="scholarship-advanced" hidden={!advanced}>
          <div className="mt-3 grid w-full min-w-0 gap-3 border-t border-[#E7ECF2] pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <label
              htmlFor="scholarships-university"
              className="grid min-w-0 gap-2 text-xs font-bold text-muted-foreground"
            >
              الجامعة{select("university", "جميع الجامعات")}
            </label>
            {(["studyLevel", "fundingType"] as const).map((key) => (
              <label
                key={key}
                htmlFor={`scholarships-${key}`}
                className="grid min-w-0 gap-2 text-xs font-bold text-muted-foreground"
              >
                {labels[key]}
                {demoOptions ? (
                  select(key, "الكل")
                ) : (
                  <input
                    id={`scholarships-${key}`}
                    value={draft[key]}
                    onChange={(event) => change(key, event.target.value, true)}
                    className={controlClass}
                    placeholder="اكتب القيمة المطلوبة"
                  />
                )}
              </label>
            ))}
            <label
              htmlFor="scholarships-applicationStatus"
              className="grid min-w-0 gap-2 text-xs font-bold text-muted-foreground"
            >
              حالة التقديم{select("applicationStatus", "جميع الحالات")}
            </label>
            <label
              htmlFor="scholarships-featured"
              className="grid min-w-0 gap-2 text-xs font-bold text-muted-foreground"
            >
              الظهور{select("featured", "جميع المنح")}
            </label>
            <label
              htmlFor="scholarships-sort"
              className="grid min-w-0 gap-2 text-xs font-bold text-muted-foreground"
            >
              الترتيب حسب{select("sort", "الأحدث أولاً")}
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-6">
              {/* <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-primary"
              >
                <Search className="size-4" aria-hidden="true" />
                بحث
              </button> */}
              <button
                type="button"
                onClick={() => {
                  const next = { ...values };
                  for (const key of scholarshipFilterKeys)
                    next[key] = key === "sort" ? "newest" : "";
                  setDraft(next);
                  navigate(next);
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#DCE4EC] px-3 text-sm text-primary"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                إعادة ضبط الفلاتر
              </button>
            </div>
          </div>
        </div>
        {optionError ? (
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            تعذر تحميل بعض خيارات التصفية. يمكنك البحث بكلمة مفتاحية أو إعادة
            تحميل الصفحة.
          </p>
        ) : null}
      </form>
      {active.length ? (
        <div
          aria-label="الفلاتر النشطة"
          className="mt-3 flex flex-wrap items-center gap-2"
        >
          {active.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                const next = {
                  ...draft,
                  [key]: key === "sort" ? "newest" : "",
                };
                setDraft(next);
                navigate(next);
              }}
              aria-label={`إزالة ${labels[key]}: ${values[key]}`}
              className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-secondary px-3 text-xs text-primary"
            >
              <span className="min-w-0 break-words">
                {labels[key]}:{" "}
                {key === "search"
                  ? values[key]
                  : (options[key].find((item) => item.value === values[key])
                      ?.label ?? values[key])}
              </span>
              <X className="size-3 shrink-0" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            className="min-h-11 px-2 text-xs font-bold text-[#17669C]"
            onClick={() =>
              navigate({
                ...values,
                search: "",
                country: "",
                university: "",
                studyLevel: "",
                fundingType: "",
                applicationStatus: "",
                featured: "",
                sort: "newest",
              })
            }
          >
            مسح الكل
          </button>
        </div>
      ) : null}
      <div aria-busy={pending} aria-live="polite">
        {pending ? (
          <div role="status" className="py-6 text-sm text-muted-foreground">
            جارٍ تحديث المنح الدراسية…
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}
