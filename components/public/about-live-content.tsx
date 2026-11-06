"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Service } from "@/api/public-content";
import { getBrowserAboutServices } from "@/api/public-services-browser";
import { getBrowserContactSettings } from "@/api/site-settings-browser";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { aboutTemporaryContent } from "@/lib/about-content";
import { Skeleton } from "@/components/ui/skeleton";

const settingsQuery = { queryKey: ["site-settings", "about"], queryFn: getBrowserContactSettings, retry: 1 } as const;

export function AboutIdentityName({ demo }: { demo: boolean }) {
  const query = useQuery({ ...settingsQuery, enabled: !demo });
  if (demo) return null;
  if (query.isPending) return <span className="ms-2 inline-flex align-middle" aria-busy="true"><Skeleton className="h-4 w-28 bg-white/20" /></span>;
  if (query.isError) return null;
  return <span className="ms-2">— {query.data?.academyNameAr || "اسم الأكاديمية (غير متوفر حالياً)"}</span>;
}

export function AboutIdentityNotice({ demo }: { demo: boolean }) {
  const query = useQuery({ ...settingsQuery, enabled: !demo });
  if (demo || !query.isError) return null;
  return <ErrorState title="تعذّر تحميل اسم الأكاديمية" description="يمكنك إعادة المحاولة. بقية محتوى الصفحة وخيارات التواصل متاحة." retrying={query.isFetching} onRetry={() => { void query.refetch(); }} />;
}

function AboutServiceCards({ services }: { services: Service[] }) {
  return <BalancedCardGrid columns={{ md: 2, lg: 3 }} gap={4}>{services.map((service) => <Link key={service.id} href={`/services/${service.slug}`} data-about-service={service.id} className="group flex min-w-0 flex-col rounded-xl border border-[#DFE7EF] bg-white p-5 transition-colors hover:border-[#C8A253] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A47B2D] motion-reduce:transition-none"><h3 className="text-lg font-bold leading-8 [overflow-wrap:anywhere]">{service.titleAr}</h3><p className="mb-4 mt-2 line-clamp-3 text-sm leading-8 text-[#52647A] [overflow-wrap:anywhere]">{service.summaryAr || aboutTemporaryContent.serviceSummary}</p><span className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#17669C] group-hover:underline">اعرف المزيد<ArrowLeft className="size-4" aria-hidden="true" /></span></Link>)}</BalancedCardGrid>;
}

export function AboutLiveServices({ demo, demoServices }: { demo: boolean; demoServices: Service[] }) {
  const query = useQuery({ queryKey: ["about", "services", { limit: 3, sort: "manual" }], queryFn: getBrowserAboutServices, enabled: !demo, retry: 1 });
  if (demo) return <AboutServiceCards services={demoServices} />;
  if (query.isPending) return <SkeletonResults kind="service" count={3} label="جارٍ تحميل الخدمات المنشورة…" />;
  if (query.isError) return <ErrorState title="تعذّر تحميل الخدمات" description="يرجى إعادة المحاولة للاطلاع على الخدمات المنشورة." retrying={query.isFetching} onRetry={() => { void query.refetch(); }} />;
  if (!query.data?.length) return <EmptyState title="لا توجد خدمات منشورة حالياً" description="يمكنك التواصل مع الفريق لطرح استفسارك." />;
  return <AboutServiceCards services={query.data} />;
}
