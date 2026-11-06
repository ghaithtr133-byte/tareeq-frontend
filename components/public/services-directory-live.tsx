"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBrowserServices } from "@/api/public-content-browser";
import { ServiceOverviewCard } from "@/components/public/service-overview-card";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { PaginationLinks } from "@/components/public/public-content";
import { publicServices } from "@/lib/public-services";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { parseServicesDirectory, serviceOverviewFromLive, servicesDirectoryPage } from "@/lib/services-directory-live";
import { publishedServiceHref, serviceDetailHref } from "@/lib/service-details";

export function ServicesDirectoryLive() {
  const searchParams = useSearchParams(), router = useRouter();
  const demo = isPublicDemoMode();
  const page = demo ? 1 : servicesDirectoryPage(searchParams.get("page"));
  const query = useQuery({ queryKey: ["services-directory", { page, demo }], enabled: !demo, retry: 1,
    queryFn: async () => parseServicesDirectory(await getBrowserServices({ limit: 5, sort: "manual", page }), page),
  });
  const result = demo ? null : query.data;
  useEffect(() => { if (!demo && result && page > Math.max(1, result.pagination.totalPages)) router.replace(result.pagination.totalPages > 1 ? `/services?page=${result.pagination.totalPages}` : "/services", { scroll: false }); }, [demo, page, result, router]);
  if (demo) return <div data-services-grid className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{publicServices.map((service) => <ServiceOverviewCard key={service.slug} service={service} publishedHref={publishedServiceHref(service.title, [])} />)}</div>;
  if (query.isPending) return <SkeletonResults kind="service" count={5} label="جارٍ تحميل الخدمات المنشورة…" />;
  if (query.isError) return <ErrorState title="تعذّر تحميل الخدمات" description="حدثت مشكلة أثناء جلب الخدمات المنشورة. يرجى المحاولة مجدداً." retrying={query.isFetching} onRetry={() => { void query.refetch(); }} />;
  if (!result?.items.length) return <EmptyState title="لا توجد خدمات منشورة حالياً" description="ستظهر الخدمات هنا عند نشرها. يمكنك التواصل معنا للاستفسار." />;
  return <><BalancedCardGrid data-services-grid columns={{ md: 2, lg: 3, xl: 5 }} gap={4}>{result.items.map((service) => <ServiceOverviewCard key={service.id} service={serviceOverviewFromLive(service)} publishedHref={serviceDetailHref(service)} live />)}</BalancedCardGrid><PaginationLinks pathname="/services" params={{}} pagination={result.pagination} /></>;
}
