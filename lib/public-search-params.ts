import type {
  ArticleListParams,
  CountryListParams,
  FeaturedFilter,
  ScholarshipApplicationStatus,
  ScholarshipListParams,
  ServiceListParams,
  UniversityListParams,
} from "@/api/public-content";

export type RouteSearchParams = Record<string, string | string[] | undefined>;

function value(params: RouteSearchParams, key: string) {
  const candidate = params[key];
  return typeof candidate === "string" ? candidate.trim() : "";
}

function positiveInteger(candidate: string, maximum?: number) {
  const parsed = Number(candidate);
  return Number.isInteger(parsed) && parsed >= 1 && (!maximum || parsed <= maximum) ? parsed : undefined;
}

function featured(params: RouteSearchParams): FeaturedFilter | undefined {
  const candidate = value(params, "featured");
  return candidate === "true" || candidate === "false" ? candidate : undefined;
}

function common(params: RouteSearchParams) {
  return {
    page: positiveInteger(value(params, "page")),
    limit: positiveInteger(value(params, "limit"), 50),
    search: value(params, "search") || undefined,
    featured: featured(params),
  };
}

function slug(params: RouteSearchParams, key: string) {
  const candidate = value(params, key);
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate) ? candidate : undefined;
}

function text(params: RouteSearchParams, key: string) {
  const candidate = value(params, key);
  return candidate || undefined;
}

export function countriesParams(params: RouteSearchParams): CountryListParams {
  const sort = value(params, "sort");
  return { ...common(params), sort: sort === "newest" || sort === "manual" ? sort : undefined };
}

export function universitiesParams(params: RouteSearchParams): UniversityListParams {
  const sort = value(params, "sort");
  return { ...common(params), country: slug(params, "country"), sort: sort === "name" || sort === "newest" ? sort : undefined };
}

export function scholarshipsParams(params: RouteSearchParams): ScholarshipListParams {
  const sort = value(params, "sort");
  const status = value(params, "applicationStatus");
  return {
    ...common(params),
    country: slug(params, "country"),
    university: slug(params, "university"),
    studyLevel: text(params, "studyLevel"),
    fundingType: text(params, "fundingType"),
    applicationStatus: status === "OPEN" || status === "CLOSED" ? (status as ScholarshipApplicationStatus) : undefined,
    sort: sort === "deadline" || sort === "newest" ? sort : undefined,
  };
}

export function servicesParams(params: RouteSearchParams): ServiceListParams {
  const sort = value(params, "sort");
  return { page: positiveInteger(value(params, "page")), limit: positiveInteger(value(params, "limit"), 50), featured: featured(params), sort: sort === "manual" || sort === "newest" ? sort : undefined };
}

export function articlesParams(params: RouteSearchParams): ArticleListParams {
  const sort = value(params, "sort");
  return { ...common(params), country: slug(params, "country"), sort: sort === "newest" ? sort : undefined };
}

export function queryString(params: RouteSearchParams, overrides: Record<string, string | undefined> = {}) {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([key, candidate]) => {
    if (typeof candidate === "string" && candidate) next.set(key, candidate);
  });
  Object.entries(overrides).forEach(([key, candidate]) => {
    if (candidate) next.set(key, candidate);
    else next.delete(key);
  });
  return next.toString();
}
