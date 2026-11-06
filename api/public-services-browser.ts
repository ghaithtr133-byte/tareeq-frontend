import { browserApiClient } from "@/api/client";
import type { PublicList, Service } from "@/api/public-content";
import { parsePublishedService, serviceDetailList } from "@/lib/service-detail-live";

/** Bounded public services request used by the static About page shell. */
export async function getBrowserAboutServices(): Promise<Service[]> {
  const response = await browserApiClient.get("/services", {
    params: { limit: 3, sort: "manual" },
    withCredentials: false,
    timeout: 15000,
  });
  const data: PublicList<Service> = serviceDetailList(response.data?.data, (row) => parsePublishedService(row));
  if (response.data?.success !== true || data.pagination.page !== 1 || data.pagination.limit !== 3) throw new Error("Invalid About services response.");
  return data.items;
}
