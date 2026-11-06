"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { loadServiceFaqs } from "@/lib/api-client/service-faq-actions";
import type { ServiceFaqResult } from "@/lib/service-detail-live";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { SkeletonResults } from "@/components/public/content-skeletons";

export function ServiceLiveFaq({ slug, initial }: { slug: string; initial: ServiceFaqResult }) {
  const query = useInfiniteQuery({ queryKey: ["service-detail-faq", slug], initialPageParam: 1, gcTime: 0, staleTime: 60_000, enabled: initial.ok,
    initialData: initial.ok ? { pages: [initial.data], pageParams: [1] } : undefined,
    queryFn: async ({ pageParam }) => { const result = await loadServiceFaqs(slug, pageParam); if (!result.ok) throw Error("FAQ unavailable"); return result.data; },
    getNextPageParam: (last) => last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });
  const seen = new Set<string>();
  const items = query.data?.pages.flatMap((page) => page.items).filter((item) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; }) ?? [];
  return <>
    {query.isFetching && !items.length ? <SkeletonResults kind="service" count={2} label="جارٍ تحميل أسئلة الخدمة…" /> : null}
    {items.length ? <FaqAccordion items={items} name={`service-faq-${slug}`} /> : query.data && !query.isError ? <EmptyState title="لا توجد أسئلة منشورة لهذه الخدمة حالياً" description="يمكنك التواصل مع الفريق للاستفسار عن الخدمة." /> : null}
    {query.isError || (!initial.ok && !query.data && !query.isFetching) ? <ErrorState title="تعذّر تحميل أسئلة الخدمة" description="يرجى المحاولة مجدداً لتحميل الأسئلة الخاصة بهذه الخدمة." onRetry={() => { void (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch()); }} retrying={query.isFetching} /> : null}
    {query.hasNextPage ? <button type="button" disabled={query.isFetching} onClick={() => { void query.fetchNextPage(); }} className="mt-4 min-h-11 rounded-lg border border-accent px-4 font-bold focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60">{query.isFetching ? "جارٍ التحميل…" : "عرض المزيد من الأسئلة"}</button> : null}
  </>;
}
