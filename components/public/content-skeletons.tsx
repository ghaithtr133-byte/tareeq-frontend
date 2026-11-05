import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { innerPageHero } from "@/lib/inner-page-hero";

export type SkeletonCardKind = "country" | "university" | "scholarship" | "article" | "service";
export type SkeletonPageKind = "destinations" | "universities" | "scholarships" | "services" | "articles" | "country" | "university" | "scholarship" | "service" | "article" | "generic";
const grids: Record<SkeletonCardKind, string> = {
  country: "md:grid-cols-2 lg:grid-cols-3",
  university: "md:grid-cols-2 xl:grid-cols-3",
  scholarship: "md:grid-cols-2 xl:grid-cols-3",
  article: "md:grid-cols-2",
  service: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
};

export function SkeletonCardGrid({ kind, count = 6 }: { kind: SkeletonCardKind; count?: number }) {
  return <div aria-hidden="true" data-skeleton-grid={kind} className={`grid min-w-0 items-stretch gap-4 ${grids[kind]}`}>
    {Array.from({ length: count }, (_, index) => <div key={index} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E2E8EF] bg-white">
      <Skeleton className={kind === "service" ? "aspect-[2/1] rounded-none" : kind === "country" ? "aspect-[16/9] rounded-none" : "aspect-[8/5] rounded-none"} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        {kind === "university" || kind === "service" ? <Skeleton className="-mt-9 size-14 self-center rounded-xl border-4 border-white" /> : null}
        <div className="flex items-center justify-between gap-3"><Skeleton className="h-5 w-3/4" />{kind !== "service" ? <Skeleton className="h-5 w-7 shrink-0" /> : null}</div>
        <Skeleton className="h-3 w-1/2" />
        {kind === "scholarship" ? <div className="grid grid-cols-2 gap-3"><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /></div> : <div className="space-y-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /></div>}
        <Skeleton className={`mt-auto h-11 ${kind === "article" || kind === "university" ? "w-28 self-end" : "w-full"}`} />
      </div>
    </div>)}
  </div>;
}

export function SkeletonResults({ kind, count = 6, label = "جارٍ تحميل النتائج…" }: { kind: SkeletonCardKind; count?: number; label?: string }) {
  return <div data-public-skeleton={kind} aria-busy="true" className="py-4"><p role="status" className="sr-only">{label}</p><SkeletonCardGrid kind={kind} count={count} /></div>;
}

/** Only API-backed Homepage sections; the static Hero/journey are not grey placeholders. */
export function HomeContentSkeleton() {
  return <div data-public-skeleton="home-content" aria-busy="true">
    <p role="status" className="sr-only">جارٍ تحميل محتوى الصفحة الرئيسية…</p>
    <div aria-hidden="true">{["destinations", "universities", "services", "articles", "scholarships"].map((section) => <Container key={section} data-home-loading-section={section} className="space-y-6 py-10 2xl:max-w-[112rem]">
      <div className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-3/4 max-w-lg" /></div>
      {section === "destinations" ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="aspect-[8/5] rounded-xl" />)}</div>
        : section === "universities" ? <SkeletonCardGrid kind="university" count={3} />
        : section === "articles" ? <div className="grid gap-5 lg:grid-cols-2"><Skeleton className="aspect-[4/3] rounded-2xl" /><div className="grid gap-4">{[0, 1, 2].map((item) => <div key={item} className="flex gap-4 rounded-xl border bg-white p-4"><Skeleton className="w-2/5 shrink-0" /><div className="w-full space-y-3"><Skeleton className="h-5 w-5/6" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div></div>)}</div></div>
        : <div className={`grid gap-4 sm:grid-cols-2 ${section === "services" ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>{Array.from({ length: section === "services" ? 5 : 4 }, (_, item) => <div key={item} className="space-y-4 rounded-xl border bg-white p-5">{section === "services" ? <Skeleton className="mx-auto size-12 rounded-full" /> : null}<Skeleton className="h-6 w-4/5" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" /><Skeleton className="h-6 w-24" /></div>)}</div>}
    </Container>)}<Container data-home-loading-section="faqs" className="space-y-6 py-10 2xl:max-w-[112rem]"><Skeleton className="h-8 w-3/4 max-w-lg" /><div className="grid gap-6 lg:grid-cols-[2fr_3fr]"><Skeleton className="order-2 min-h-48 rounded-2xl lg:order-1" /><div className="space-y-3 lg:order-2">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-16 rounded-2xl" />)}</div></div></Container></div>
  </div>;
}

function TextBlocks() {
  return <div className="space-y-5 rounded-xl border border-[#E2E8EF] bg-white p-5"><Skeleton className="h-7 w-2/3" />{[0, 1].map((item) => <div key={item} className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div>)}</div>;
}

export function PublicPageSkeleton({ page = "generic" }: { page?: SkeletonPageKind }) {
  const directory = ["destinations", "universities", "scholarships", "services", "articles"].includes(page);
  const kind: SkeletonCardKind = page === "destinations" ? "country" : page === "universities" ? "university" : page === "scholarships" ? "scholarship" : page === "services" ? "service" : "article";
  return <main dir="rtl" data-public-skeleton={page} aria-busy="true" className="bg-[#F8FAFC] pb-8" aria-label="جارٍ تحميل المحتوى">
    <p role="status" className="sr-only">جارٍ تحميل المحتوى…</p>
    <div aria-hidden="true">
      {page === "universities" ? <Container className="py-3"><Skeleton className="h-5 w-40" /></Container> : <section className="border-b border-[#E2E8EF] bg-[#F2F6FA]"><Container className={innerPageHero.content}>
        <Skeleton className="mb-4 h-4 w-44" />
        <div className={`grid items-center gap-5 ${page === "country" || page === "service" || page === "university" ? "md:grid-cols-[3fr_2fr]" : ""}`}>
          <div className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-3/4 max-w-xl" /><Skeleton className="h-4 w-5/6 max-w-2xl" /><Skeleton className="h-4 w-2/3 max-w-xl" />{page === "country" || page === "service" ? <div className="flex flex-wrap gap-2"><Skeleton className="h-12 w-44" /><Skeleton className="h-12 w-40" /></div> : null}</div>
          {page === "country" || page === "service" || page === "university" ? <Skeleton className="hidden aspect-[3/1] rounded-xl md:block" /> : null}
        </div>
      </Container></section>}
      <Container className="py-5">
        {directory ? <div className={page === "universities" ? "grid items-start gap-7 lg:grid-cols-[18rem_minmax(0,1fr)]" : ""}>
          {page === "universities" ? <div className="hidden space-y-5 rounded-xl border bg-white p-5 lg:block"><Skeleton className="h-6 w-3/4" />{[0, 1, 2, 3].map((item) => <div key={item} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-12 w-full" /></div>)}</div> : null}
          <div className="min-w-0"><div className="mb-5 flex items-center justify-between gap-4"><Skeleton className="h-6 w-36" /><Skeleton className="h-10 w-28" /></div><SkeletonCardGrid kind={kind} count={page === "services" ? 5 : 6} /></div>
        </div> : page === "country" ? <div className="space-y-6"><div className="grid items-center gap-6 md:grid-cols-[3fr_2fr]"><TextBlocks /><Skeleton className="aspect-[2/1] rounded-xl" /></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="space-y-3 rounded-xl border bg-white p-4"><Skeleton className="size-7" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-full" /></div>)}</div><div data-country-guide-skeleton className="space-y-4"><Skeleton className="h-8 w-2/3 max-w-md" /><div className="grid gap-3 lg:grid-cols-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-16 w-full rounded-xl" />)}</div></div><div data-country-faq-skeleton className="space-y-4"><Skeleton className="h-8 w-2/3 max-w-md" /><div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_11rem]"><div className="space-y-3">{[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-16 w-full rounded-xl" />)}</div><Skeleton className="hidden size-44 rounded-xl lg:block" /></div></div></div>
          : page === "scholarship" ? <div className="grid items-start gap-5 lg:grid-cols-[1fr_2.2fr]"><TextBlocks /><div className="space-y-4"><Skeleton className="aspect-[16/6] rounded-xl" /><TextBlocks /></div></div>
          : page === "article" ? <div className="grid items-start gap-5 lg:grid-cols-[1fr_2.2fr_1fr]"><div className="hidden lg:block"><TextBlocks /></div><div className="space-y-4"><Skeleton className="aspect-[2/1] rounded-xl" /><TextBlocks /><TextBlocks /></div><div className="hidden lg:block"><TextBlocks /></div></div>
          : <div className="space-y-5">{page === "university" ? <Skeleton className="h-14 w-full rounded-xl" /> : null}<div className="grid items-start gap-5 lg:grid-cols-[2.2fr_1fr]"><TextBlocks /><div className="hidden lg:block"><TextBlocks /></div></div>{page === "service" ? <SkeletonCardGrid kind="service" count={3} /> : null}</div>}
      </Container>
    </div>
  </main>;
}
