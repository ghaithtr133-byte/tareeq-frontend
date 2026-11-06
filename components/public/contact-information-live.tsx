"use client";

import { useQuery } from "@tanstack/react-query";
import { getBrowserContactSettings } from "@/api/site-settings-browser";
import { ContactInformationCard } from "@/components/public/contact-cards";
import { ErrorState } from "@/components/ui/content-state";
import { Skeleton } from "@/components/ui/skeleton";

function ContactInformationSkeleton() {
  return <section aria-busy="true" aria-labelledby="contact-information-loading" className="min-w-0 rounded-2xl border border-[#E0E7EF] bg-white p-4 shadow-sm sm:p-5">
    <p id="contact-information-loading" role="status" className="sr-only">جارٍ تحميل معلومات التواصل الأخرى…</p>
    <Skeleton className="h-7 w-44" />
    <div className="mt-4 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="flex items-center gap-3 border-b border-[#E0E7EF] pb-3"><Skeleton className="size-11 shrink-0 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-3/4" /></div></div>)}</div>
    <Skeleton className="mt-4 h-4 w-36" /><div className="mt-3 flex gap-3">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="size-11 rounded-lg" />)}</div>
  </section>;
}

export function ContactInformationLive({ demo }: { demo: boolean }) {
  const query = useQuery({ queryKey: ["site-settings", "contact"], queryFn: getBrowserContactSettings, enabled: !demo, retry: 1 });
  if (demo) return <ContactInformationCard settings={{}} demo />;
  if (query.isPending) return <ContactInformationSkeleton />;
  return <>
    <ContactInformationCard settings={query.data ?? {}} />
    {query.isError ? <div className="mt-3"><ErrorState title="تعذر تحميل معلومات التواصل الإضافية" description="يمكنك إعادة المحاولة. يبقى نموذج الاستفسار وواتساب متاحين." retrying={query.isFetching} onRetry={() => { void query.refetch(); }} /></div> : null}
  </>;
}
