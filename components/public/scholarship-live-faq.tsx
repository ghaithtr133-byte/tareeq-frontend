"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { loadScholarshipFaqs } from "@/lib/api-client/scholarship-faq-actions";
import type { ScholarshipFaqResult } from "@/lib/scholarship-detail-live";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { SkeletonResults } from "@/components/public/content-skeletons";

export function ScholarshipLiveFaq({ slug, initial }: { slug: string; initial: ScholarshipFaqResult }) {
  const query = useInfiniteQuery({ queryKey: ["scholarship-detail-faq", slug], initialPageParam: 1, gcTime: 0, staleTime: 60_000, enabled: initial.ok,
    initialData: initial.ok ? { pages: [initial.data], pageParams: [1] } : undefined,
    queryFn: async ({ pageParam }) => { const result = await loadScholarshipFaqs(slug, pageParam); if (!result.ok) throw Error("FAQ unavailable"); return result.data; },
    getNextPageParam: (last) => last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });
  const seen = new Set<string>();
  const items = (query.data?.pages.flatMap((page) => page.items).filter((item) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; }) ?? [])
    .sort((left, right) => left.displayOrder - right.displayOrder || left.id.localeCompare(right.id));
  return <>
    {query.isFetching && !items.length ? <SkeletonResults kind="scholarship" count={2} label="جارٍ تحميل أسئلة المنحة…" /> : null}
    {items.length ? <FaqAccordion items={items} name={`scholarship-faq-${slug}`} /> : query.data && !query.isError ? <EmptyState title="لا توجد أسئلة منشورة لهذه المنحة حالياً" description="يمكنك الرجوع إلى المصدر الرسمي أو التواصل مع الفريق للاستفسار." /> : null}
    {query.isError || (!initial.ok && !query.data && !query.isFetching) ? <ErrorState title="تعذّر تحميل أسئلة المنحة" description="يرجى إعادة المحاولة لتحميل الأسئلة الخاصة بهذه المنحة." onRetry={() => { void (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch()); }} retrying={query.isFetching} /> : null}
    {query.hasNextPage ? <button type="button" disabled={query.isFetching} onClick={() => { void query.fetchNextPage(); }} className="mt-4 min-h-11 rounded-lg border border-accent px-4 font-bold focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60">{query.isFetching ? "جارٍ التحميل…" : "عرض المزيد من الأسئلة"}</button> : null}
  </>;
}
