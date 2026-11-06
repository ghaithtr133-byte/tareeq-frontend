import { browserApiClient } from "@/api/client";
import type {
  Article, ArticleListParams, Country, CountryListParams, PublicList,
  Scholarship, ScholarshipListParams, Service, ServiceListParams,
  University, UniversityListParams,
} from "@/api/public-content";
import {
  getDemoArticles, getDemoCountries, getDemoScholarships, getDemoServices,
  getDemoUniversities,
} from "@/lib/mocks/public-demo-content";
import { isPublicDemoMode } from "@/lib/public-content-mode";

async function getPublic<T>(path: string, params?: Record<string, string | number | undefined>) {
  const response = await browserApiClient.get(path, { params, withCredentials: false, timeout: 15000 });
  if (response.data?.success !== true) throw Error("Invalid public API response.");
  return response.data.data as T;
}

export const getBrowserCountries = (params: CountryListParams = {}) => isPublicDemoMode() ? getDemoCountries(params) : getPublic<PublicList<Country>>("/countries", params);
export const getBrowserUniversities = (params: UniversityListParams = {}) => isPublicDemoMode() ? getDemoUniversities(params) : getPublic<PublicList<University>>("/universities", params);
export const getBrowserScholarships = (params: ScholarshipListParams = {}) => isPublicDemoMode() ? getDemoScholarships(params) : getPublic<PublicList<Scholarship>>("/scholarships", params);
export const getBrowserServices = (params: ServiceListParams = {}) => isPublicDemoMode() ? getDemoServices(params) : getPublic<PublicList<Service>>("/services", params);
export const getBrowserArticles = (params: ArticleListParams = {}) => isPublicDemoMode() ? getDemoArticles(params) : getPublic<PublicList<Article>>("/articles", params);
