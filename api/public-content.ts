import "server-only";

import { serverApiClient } from "@/api/server-client";
import {
  getDemoArticle,
  getDemoArticles,
  getDemoCountries,
  getDemoCountry,
  getDemoScholarships,
  getDemoScholarship,
  getDemoServices,
  getDemoService,
  getDemoUniversities,
  getDemoUniversity,
} from "@/lib/mocks/public-demo-content";
import { isPublicDemoMode } from "@/lib/public-content-mode";

export type PublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type FeaturedFilter = "true" | "false";
export type ScholarshipApplicationStatus = "OPEN" | "CLOSED";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PublicList<T> = { items: T[]; pagination: Pagination };
type PublicEnvelope<T> = { success: true; data: T };

export type Country = {
  id: string;
  slug: string;
  featured: boolean;
  publishedAt: string | null;
  seoTitleAr: string | null;
  seoDescriptionAr: string | null;
  nameAr: string;
  nameEn: string | null;
  introductionAr: string;
  introductionEn: string | null;
  detailsAr: string;
  detailsEn: string | null;
  imageUrl: string | null;
  imageAltAr: string | null;
  imageAltEn: string | null;
  displayOrder: number;
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type CountryReference = Pick<Country, "id" | "slug" | "nameAr" | "nameEn">;

export type University = {
  id: string;
  slug: string;
  featured: boolean;
  publishedAt: string | null;
  seoTitleAr: string | null;
  seoDescriptionAr: string | null;
  nameAr: string;
  nameEn: string | null;
  officialName: string;
  countryId: string;
  cityAr: string;
  cityEn: string | null;
  overviewAr: string;
  overviewEn: string | null;
  officialWebsite: string | null;
  imageUrl: string | null;
  imageAltAr: string | null;
  imageAltEn: string | null;
  country?: CountryReference;
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type ScholarshipReference = { id: string; slug: string; titleAr: string };
export type CountryShortReference = Pick<Country, "id" | "slug" | "nameAr">;
export type UniversityShortReference = Pick<University, "id" | "slug" | "nameAr">;

export type Scholarship = {
  id: string;
  slug: string;
  featured: boolean;
  publishedAt: string | null;
  seoTitleAr: string | null;
  seoDescriptionAr: string | null;
  titleAr: string;
  titleEn: string | null;
  countryId: string | null;
  universityId: string | null;
  studyLevel: string;
  fundingType: string;
  requirementsAr: string;
  requirementsEn: string | null;
  descriptionAr: string;
  descriptionEn: string | null;
  verifiedDeadline: string | null;
  officialSourceUrl: string | null;
  applicationStatus: ScholarshipApplicationStatus;
  effectiveApplicationStatus?: ScholarshipApplicationStatus;
  country?: CountryShortReference | null;
  university?: UniversityShortReference | null;
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type Service = {
  id: string;
  slug: string;
  featured: boolean;
  publishedAt: string | null;
  seoTitleAr: string | null;
  seoDescriptionAr: string | null;
  titleAr: string;
  titleEn: string | null;
  summaryAr: string;
  summaryEn: string | null;
  descriptionAr: string;
  descriptionEn: string | null;
  imageUrl: string | null;
  imageAltAr: string | null;
  imageAltEn: string | null;
  displayOrder: number;
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type ArticleBlock = {
  type: "paragraph" | "heading2" | "heading3" | "bulleted-list" | "numbered-list" | "quote";
  text: string;
};

export type Article = {
  id: string;
  slug: string;
  featured: boolean;
  publishedAt: string | null;
  seoTitleAr: string | null;
  seoDescriptionAr: string | null;
  titleAr: string;
  titleEn: string | null;
  summaryAr: string;
  summaryEn: string | null;
  bodyAr: ArticleBlock[];
  bodyEn: ArticleBlock[] | null;
  coverImageUrl: string | null;
  coverImageAltAr: string | null;
  coverImageAltEn: string | null;
  countryId: string | null;
  universityId: string | null;
  scholarshipId: string | null;
  country?: CountryShortReference | null;
  university?: UniversityShortReference | null;
  scholarship?: ScholarshipReference | null;
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
};

type PaginationParams = { page?: number; limit?: number };
type SearchParams = { search?: string };
type FeaturedParams = { featured?: FeaturedFilter };

export type CountryListParams = PaginationParams & SearchParams & FeaturedParams & { sort?: "manual" | "newest" };
export type UniversityListParams = PaginationParams & SearchParams & FeaturedParams & { country?: string; sort?: "newest" | "name" };
export type ScholarshipListParams = PaginationParams & SearchParams & FeaturedParams & {
  country?: string;
  university?: string;
  studyLevel?: string;
  fundingType?: string;
  applicationStatus?: ScholarshipApplicationStatus;
  sort?: "newest" | "deadline";
};
export type ServiceListParams = PaginationParams & FeaturedParams & { sort?: "manual" | "newest" };
export type ArticleListParams = PaginationParams & SearchParams & FeaturedParams & { country?: string; sort?: "newest" };

async function getPublic<T>(path: string, params?: Record<string, string | number | undefined>) {
  const response = await serverApiClient.get<PublicEnvelope<T>>(path, { params });
  return response.data.data;
}

export const getCountries = (params: CountryListParams = {}) => isPublicDemoMode() ? getDemoCountries(params) : getPublic<PublicList<Country>>("/countries", params);
export const getCountry = (slug: string) => isPublicDemoMode() ? getDemoCountry(slug) : getPublic<Country>(`/countries/${encodeURIComponent(slug)}`);
export const getUniversities = (params: UniversityListParams = {}) => isPublicDemoMode() ? getDemoUniversities(params) : getPublic<PublicList<University>>("/universities", params);
export const getUniversity = (slug: string) => isPublicDemoMode() ? getDemoUniversity(slug) : getPublic<University>(`/universities/${encodeURIComponent(slug)}`);
export const getScholarships = (params: ScholarshipListParams = {}) => isPublicDemoMode() ? getDemoScholarships(params) : getPublic<PublicList<Scholarship>>("/scholarships", params);
export const getScholarship = (slug: string) => isPublicDemoMode() ? getDemoScholarship(slug) : getPublic<Scholarship>(`/scholarships/${encodeURIComponent(slug)}`);
export const getServices = (params: ServiceListParams = {}) => isPublicDemoMode() ? getDemoServices(params) : getPublic<PublicList<Service>>("/services", params);
export const getService = (slug: string) => isPublicDemoMode() ? getDemoService(slug) : getPublic<Service>(`/services/${encodeURIComponent(slug)}`);
export const getArticles = (params: ArticleListParams = {}) => isPublicDemoMode() ? getDemoArticles(params) : getPublic<PublicList<Article>>("/articles", params);
export const getArticle = (slug: string) => isPublicDemoMode() ? getDemoArticle(slug) : getPublic<Article>(`/articles/${encodeURIComponent(slug)}`);
