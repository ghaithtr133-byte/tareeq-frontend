"use client";

import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { loadUniversityPrograms, loadUniversityAdmissions, loadUniversityGallery, loadUniversityFaqs } from "@/lib/api-client/university-detail-actions";
import { UniversityPrograms } from "@/components/public/university-programs";
import { UniversityDirectoryImage } from "@/components/public/university-directory-image";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import type { ProgramFilters } from "@/lib/university-details";
import { programQuery, detailUnavailable, type LiveDetailSections, type DetailResult } from "@/lib/university-detail-live";

async function unwrap<T>(request: Promise<DetailResult<T>>) { const result = await request; if (!result.ok) throw Error("Content unavailable"); return result.data; }
const control = "min-h-11 rounded-lg border border-accent px-5 text-sm font-bold text-primary hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60";

export function LiveUniversityPrograms({ slug, name, initial }: { slug: string; name: string; initial: LiveDetailSections["programs"] }) {
  const [filters, setFilters] = useState<ProgramFilters>({ search: "", level: "", language: "", faculty: "" });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => { setApplied(filters); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [filters]);
  const waiting = filters !== applied;
  const params = programQuery({ search: applied.search, studyLevel: applied.level, language: applied.language, faculty: applied.faculty }, page);
  const original = page === 1 && !Object.values(applied).some(Boolean);
  const query = useQuery({
    queryKey: ["university-detail-programs", slug, params], gcTime: 0, staleTime: 60_000,
    queryFn: () => unwrap(loadUniversityPrograms(slug, { search: applied.search, studyLevel: applied.level, language: applied.language, faculty: applied.faculty }, page)),
    initialData: original && initial.ok ? initial.data : undefined,
    enabled: !waiting && (!original || initial.ok),
  });
  const data = waiting ? undefined : query.data;
  return <>
    <UniversityPrograms programs={data?.items ?? []} university={name} demo={false} server={{ filters, onFilters: setFilters, total: data?.pagination.total ?? 0, pending: waiting || query.isFetching || (!query.data && query.isPending), failed: !waiting && (query.isError || (original && !initial.ok && !query.data)) }} />
    {waiting ? <p role="status" className="mt-3 text-sm text-muted-foreground">جارٍ تحديث البحث…</p> : query.isFetching && !query.data ? <SkeletonResults kind="university" count={2} label="جارٍ تحميل التخصصات…" /> : null}
    {!waiting && (query.isError || (original && !initial.ok && !query.data && !query.isFetching)) ? <ErrorState className="mt-4" title="تعذّر تحميل التخصصات" description="يرجى المحاولة مجدداً؛ تعذّر الطلب لا يعني عدم وجود تخصصات." onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : null}
    {data && data.pagination.totalPages > 1 ? <nav aria-label="صفحات تخصصات الجامعة" className="mt-5 flex flex-wrap items-center justify-center gap-3"><button type="button" className={control} disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}>السابق</button><span role="status">{page} / {data.pagination.totalPages}</span><button type="button" className={control} disabled={page >= data.pagination.totalPages || query.isFetching} onClick={() => setPage(page + 1)}>التالي</button></nav> : null}
  </>;
}

export function LiveUniversityAdmissions({ slug, initial }: { slug: string; initial: LiveDetailSections["admissions"] }) {
  const query = useQuery({ queryKey: ["university-detail-admissions", slug], gcTime: 0, staleTime: 60_000, enabled: initial.ok, initialData: initial.ok ? initial.data : undefined, queryFn: () => unwrap(loadUniversityAdmissions(slug)) });
  return <>
    {query.isFetching && !query.data ? <SkeletonResults kind="university" count={2} label="جارٍ تحميل شروط القبول…" /> : null}
    {query.isError || (!initial.ok && !query.data && !query.isFetching) ? <ErrorState className="mt-4" title="تعذّر تحميل شروط القبول" description="يرجى إعادة المحاولة لتحميل المتطلبات المنشورة لهذه الجامعة." onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : null}
    {query.data?.length ? <ul className="mt-4 space-y-3">{query.data.map((item) => <li key={item.id} className="rounded-xl border bg-muted/30 p-4 text-sm leading-8 text-muted-foreground"><h3 className="font-bold text-primary">{item.label}</h3><p className="whitespace-pre-line">{item.content}</p></li>)}</ul> : query.data ? <EmptyState className="mt-4" title="لا توجد شروط قبول منشورة حالياً" description="لم تُنشر متطلبات لهذه الجامعة بعد. راجع المصدر الرسمي أو استفسر عبر بطاقة التواصل." /> : null}
  </>;
}

export function LiveUniversityGallery({ slug, initial }: { slug: string; initial: LiveDetailSections["gallery"] }) {
  const query = useQuery({ queryKey: ["university-detail-gallery", slug], gcTime: 0, staleTime: 60_000, enabled: initial.ok, initialData: initial.ok ? initial.data : undefined, queryFn: () => unwrap(loadUniversityGallery(slug)) });
  return <>
    {query.isFetching && !query.data ? <SkeletonResults kind="university" count={2} label="جارٍ تحميل صور الجامعة…" /> : null}
    {query.isError || (!initial.ok && !query.data && !query.isFetching) ? <ErrorState className="mt-4" title="تعذّر تحميل صور الجامعة" description="يرجى إعادة المحاولة لتحميل الصور المنشورة." onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : null}
    {query.data?.length ? <BalancedCardGrid columns={{ sm: 2 }} gap={4} className="mt-4">{query.data.map((item) => <figure key={item.id}><UniversityDirectoryImage src={item.src} alt={item.alt} unavailableLabel={detailUnavailable("صورة الجامعة")} className="aspect-video rounded-xl" /></figure>)}</BalancedCardGrid> : query.data ? <EmptyState className="mt-4" title="لا توجد صور إضافية منشورة حالياً" description="لم تُضف صور إلى معرض هذه الجامعة بعد." /> : null}
  </>;
}

export function LiveUniversityFaqs({ slug, initial }: { slug: string; initial: LiveDetailSections["faqs"] }) {
  const query = useInfiniteQuery({ queryKey: ["university-detail-faqs", slug], initialPageParam: 1, gcTime: 0, staleTime: 60_000, enabled: initial.ok,
    initialData: initial.ok ? { pages: [initial.data], pageParams: [1] } : undefined,
    queryFn: ({ pageParam }) => unwrap(loadUniversityFaqs(slug, pageParam)),
    getNextPageParam: (last) => last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
  });
  const seen = new Set<string>();
  const items = query.data?.pages.flatMap((page) => page.items).filter((item) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; }) ?? [];
  return <>
    {query.isFetching && !items.length ? <SkeletonResults kind="university" count={2} label="جارٍ تحميل الأسئلة…" /> : null}
    {items.length ? <FaqAccordion items={items} name={`university-faq-${slug}`} /> : query.data && !query.isError ? <EmptyState title="لا توجد أسئلة منشورة لهذه الجامعة حالياً" description="يمكنك الاستفسار عن الجامعة عبر بطاقة التواصل." /> : null}
    {query.isError || (!initial.ok && !query.data && !query.isFetching) ? <ErrorState className="mt-4" title="تعذّر تحميل أسئلة الجامعة" description="يرجى إعادة المحاولة؛ لا تُعرض أسئلة عامة بدلاً من أسئلة هذه الجامعة." onRetry={() => { void (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch()); }} retrying={query.isFetching} /> : null}
    {query.hasNextPage ? <div className="mt-5 text-center"><button type="button" className={control} disabled={query.isFetching} onClick={() => { void query.fetchNextPage(); }}>{query.isFetching ? "جارٍ التحميل…" : "عرض المزيد من الأسئلة"}</button></div> : null}
  </>;
}
