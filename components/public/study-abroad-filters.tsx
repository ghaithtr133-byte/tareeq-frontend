"use client";

import { Search } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { FeaturedOnlySwitch } from "@/components/public/featured-only-switch";

type Values = { search: string; featured: boolean; sort: "manual" | "newest" };

const controlClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-[#DCE4EC] bg-white px-2 text-sm text-[#082B50] transition-colors placeholder:text-[#8393A5] hover:border-[#BAC8D5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C8A253] sm:px-4";

export function StudyAbroadFilters({
  values,
  children,
}: {
  values: Values;
  children: ReactNode;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(values);
  const [pending, startTransition] = useTransition();
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

  function navigate(next: Values) {
    if (timer.current) clearTimeout(timer.current);
    const query = new URLSearchParams();
    if (next.search.trim()) query.set("search", next.search.trim());
    if (next.featured) query.set("featured", "true");
    if (next.sort !== "manual") query.set("sort", next.sort);
    startTransition(() =>
      router.push(query.size ? `/study-abroad?${query}` : "/study-abroad", {
        scroll: false,
      }),
    );
  }

  function change(next: Values, debounced = false) {
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    if (debounced) timer.current = setTimeout(() => navigate(next), 450);
    else navigate(next);
  }

  const changing =
    pending ||
    draft.search.trim() !== values.search ||
    draft.featured !== values.featured ||
    draft.sort !== values.sort;

  return (
    <>
      <form
        className="rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-[0_14px_34px_-30px_rgba(8,43,80,0.5)]"
        aria-label="البحث وتصفية الوجهات الدراسية"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(draft);
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block min-w-0 basis-full sm:basis-[18rem] sm:max-w-[20rem] lg:basis-80 lg:max-w-none lg:shrink-0">
            <span className="sr-only">ابحث عن دولة</span>
            <Search
              className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-[#607185]"
              aria-hidden="true"
            />
            <input
              type="search"
              maxLength={200}
              value={draft.search}
              onChange={(event) =>
                change({ ...draft, search: event.target.value }, true)
              }
              placeholder="ابحث عن دولة..."
              className={`${controlClass} pe-12`}
            />
          </label>
          <FeaturedOnlySwitch
            id="study-abroad-featured"
            label="الوجهات المميزة فقط"
            checked={draft.featured}
            onCheckedChange={(featured) => change({ ...draft, featured })}
          />
        </div>
      </form>
      <div aria-busy={changing}>
        {changing ? (
          <section
            id="destination-results"
            aria-label="نتائج الوجهات الدراسية"
            className="mt-3 scroll-mt-28"
          >
            <SkeletonResults
              kind="country"
              label="جارٍ تحديث الوجهات الدراسية…"
            />
          </section>
        ) : (
          children
        )}
      </div>
    </>
  );
}
