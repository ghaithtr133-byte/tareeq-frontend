type QueryFilters = Readonly<Record<string, unknown>>;
type QueryIdentifier = string | number;

const rootKey = ["api"] as const;

/** Generic convention for future approved API resources and targeted invalidation. */
export const queryKeys = {
  all: rootKey,
  resource: <TResource extends string>(resource: TResource) => [...rootKey, resource] as const,
  list: <TResource extends string, TFilters extends QueryFilters | undefined = undefined>(
    resource: TResource,
    filters?: TFilters,
  ) =>
    filters === undefined
      ? ([...rootKey, resource, "list"] as const)
      : ([...rootKey, resource, "list", filters] as const),
  detail: <TResource extends string, TId extends QueryIdentifier>(resource: TResource, id: TId) =>
    [...rootKey, resource, "detail", id] as const,
};
