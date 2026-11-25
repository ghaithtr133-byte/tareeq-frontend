import type { FeaturedFilter, PublicList } from "@/lib/api-client/public-content";

type FeaturedPageParams = {
  page?: number;
  limit?: number;
  featured?: FeaturedFilter;
  excludeIds?: string;
};

const ids = (value: string | undefined) =>
  value ? value.split(",").map((id) => id.trim()).filter(Boolean) : [];

const unique = <T extends { id: string }>(items: T[]) => {
  const seen = new Set<string>();
  return items.filter((item) => !seen.has(item.id) && !!seen.add(item.id));
};

/**
 * Creates one stable virtual sequence: the first three featured records, then
 * the Backend's original filtered order without those records. Both queries
 * apply the same filters, and every page slices that one sequence on the
 * server. No catalogue is downloaded to the browser or re-sorted per page.
 */
export async function getFeaturedFirstPage<T extends { id: string }, P extends FeaturedPageParams>(
  params: P,
  load: (request: P) => Promise<PublicList<T>>,
): Promise<PublicList<T>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;

  // An explicit featured/non-featured filter already defines the complete
  // sequence, so a separate promotion query would be redundant.
  if (params.featured === "false" || params.featured === "true") return load(params);

  const existingExcluded = ids(params.excludeIds);
  let promotedResponse: PublicList<T>;
  try {
    promotedResponse = await load({ ...params, page: 1, limit: 3, featured: "true" } as P);
  } catch {
    // The primary list remains usable if the optional promotion lookup fails.
    return load(params);
  }
  const promoted = unique(promotedResponse.items).slice(0, 3);
  if (!promoted.length) return load(params);

  const excluded = Array.from(new Set(existingExcluded.concat(promoted.map((item) => item.id))));
  const start = (page - 1) * limit;
  const promotedItems = promoted.slice(start, start + limit);
  const remainingStart = Math.max(0, start - promoted.length);
  const remainingNeeded = limit - promotedItems.length;
  const firstRemainingPage = Math.floor(remainingStart / limit) + 1;
  const firstOffset = remainingStart % limit;
  const remainingRequest = {
    ...params,
    page: firstRemainingPage,
    limit,
    featured: params.featured === "true" ? "true" : undefined,
    excludeIds: excluded.join(","),
  } as P;
  let first: PublicList<T>;
  try {
    first = await load(remainingRequest);
  } catch {
    return load(params);
  }
  const remainder = first.items.slice(firstOffset, firstOffset + remainingNeeded);

  // The requested window can cross exactly one Backend page boundary because
  // the remote page size equals the public page size.
  if (remainder.length < remainingNeeded && firstOffset + remainingNeeded > limit) {
    try {
      const second = await load({ ...remainingRequest, page: firstRemainingPage + 1 } as P);
      remainder.push(...second.items.slice(0, remainingNeeded - remainder.length));
    } catch {
      return load(params);
    }
  }

  const total = promoted.length + first.pagination.total;
  return {
    items: [...promotedItems, ...remainder],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
