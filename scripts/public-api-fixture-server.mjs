import { createServer } from "node:http";

const now = "2026-10-20T00:00:00.000Z";
const country = { id: "country-1", slug: "romania", featured: true, publishedAt: now, seoTitleAr: "الدراسة في رومانيا", seoDescriptionAr: "وصف SEO", nameAr: "رومانيا", nameEn: "Romania", introductionAr: "مقدمة رومانيا", introductionEn: null, detailsAr: "تفاصيل رومانيا", detailsEn: null, imageUrl: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=1200&q=80", imageAltAr: "مشهد في رومانيا", imageAltEn: null, displayOrder: 1, status: "PUBLISHED", createdAt: now, updatedAt: now };
const university = { id: "university-1", slug: "university-bucharest", featured: true, publishedAt: now, seoTitleAr: null, seoDescriptionAr: null, nameAr: "جامعة بوخارست", nameEn: null, officialName: "University of Bucharest", countryId: country.id, cityAr: "بوخارست", cityEn: null, overviewAr: "نبذة الجامعة", overviewEn: null, officialWebsite: null, imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80", imageAltAr: "حرم جامعي", imageAltEn: null, country: { id: country.id, slug: country.slug, nameAr: country.nameAr, nameEn: country.nameEn }, status: "PUBLISHED", createdAt: now, updatedAt: now };
const scholarship = { id: "scholarship-1", slug: "romania-scholarship", featured: true, publishedAt: now, seoTitleAr: null, seoDescriptionAr: null, titleAr: "منحة رومانيا", titleEn: null, countryId: country.id, universityId: university.id, studyLevel: "بكالوريوس", fundingType: "تمويل كامل", requirementsAr: "متطلبات المنحة", requirementsEn: null, descriptionAr: "وصف المنحة", descriptionEn: null, verifiedDeadline: "2026-12-31T00:00:00.000Z", officialSourceUrl: null, applicationStatus: "OPEN", effectiveApplicationStatus: "OPEN", country: { id: country.id, slug: country.slug, nameAr: country.nameAr }, university: { id: university.id, slug: university.slug, nameAr: university.nameAr }, status: "PUBLISHED", createdAt: now, updatedAt: now };
const service = { id: "service-1", slug: "admission-guidance", featured: true, publishedAt: now, seoTitleAr: null, seoDescriptionAr: null, titleAr: "إرشاد القبول", titleEn: null, summaryAr: "ملخص الخدمة", summaryEn: null, descriptionAr: "تفاصيل الخدمة", descriptionEn: null, imageUrl: null, imageAltAr: null, imageAltEn: null, displayOrder: 1, status: "PUBLISHED", createdAt: now, updatedAt: now };
const article = { id: "article-1", slug: "study-guide", featured: true, publishedAt: now, seoTitleAr: "دليل الدراسة", seoDescriptionAr: "وصف المقال", titleAr: "دليل الدراسة", titleEn: null, summaryAr: "ملخص المقال", summaryEn: null, bodyAr: ["paragraph", "heading2", "heading3", "bulleted-list", "numbered-list", "quote"].map((type) => ({ type, text: `نص ${type}` })), bodyEn: null, coverImageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80", coverImageAltAr: "طالبة تراجع موادها", coverImageAltEn: null, countryId: country.id, universityId: university.id, scholarshipId: scholarship.id, country: { id: country.id, slug: country.slug, nameAr: country.nameAr }, university: { id: university.id, slug: university.slug, nameAr: university.nameAr }, scholarship: { id: scholarship.id, slug: scholarship.slug, titleAr: scholarship.titleAr }, status: "PUBLISHED", createdAt: now, updatedAt: now };
const country2 = { ...country, id: "country-2", slug: "turkey", featured: false, nameAr: "تركيا", nameEn: "Turkey", introductionAr: "مقدمة تركيا", displayOrder: 2, publishedAt: "2026-10-19T00:00:00.000Z" };
const country3 = { ...country, id: "country-3", slug: "poland", nameAr: "بولندا", nameEn: "Poland", introductionAr: "مقدمة بولندا", displayOrder: 3, publishedAt: "2026-10-18T00:00:00.000Z" };
const university2 = { ...university, id: "university-2", slug: "istanbul-university", nameAr: "جامعة إسطنبول", countryId: country2.id, country: { id: country2.id, slug: country2.slug, nameAr: country2.nameAr, nameEn: country2.nameEn }, cityAr: "إسطنبول", featured: false };
const scholarship2 = { ...scholarship, id: "scholarship-2", slug: "turkey-masters", titleAr: "منحة تركيا", countryId: country2.id, universityId: university2.id, country: { id: country2.id, slug: country2.slug, nameAr: country2.nameAr }, university: { id: university2.id, slug: university2.slug, nameAr: university2.nameAr }, studyLevel: "MASTERS", fundingType: "FULL", applicationStatus: "CLOSED", effectiveApplicationStatus: "CLOSED", featured: false, verifiedDeadline: null };
const service2 = { ...service, id: "service-2", slug: "visa-guidance", titleAr: "إرشاد التأشيرة", featured: false, displayOrder: 2 };
const article2 = { ...article, id: "article-2", slug: "turkey-guide", titleAr: "دليل تركيا", summaryAr: "ملخص تركيا", countryId: country2.id, universityId: null, scholarshipId: null, country: { id: country2.id, slug: country2.slug, nameAr: country2.nameAr }, university: null, scholarship: null, featured: false, bodyAr: [{ type: "paragraph", text: "محتوى تركيا" }] };
const collections = { countries: [country, country2, country3], universities: [university, university2], scholarships: [scholarship, scholarship2], services: [service, service2], articles: [article, article2] };

function matchesText(item, search) {
  if (!search) return true;
  return [item.nameAr, item.titleAr, item.summaryAr, item.introductionAr, item.overviewAr].filter(Boolean).join(" ").includes(search);
}

function list(resource, query) {
  let items = [...collections[resource]];
  const search = query.get("search");
  if (search) items = items.filter((item) => matchesText(item, search));
  const featured = query.get("featured");
  if (featured === "true" || featured === "false") items = items.filter((item) => item.featured === (featured === "true"));
  for (const key of ["country", "university"]) if (query.get(key)) items = items.filter((item) => item[key]?.slug === query.get(key));
  for (const key of ["studyLevel", "fundingType", "applicationStatus"]) if (query.get(key)) items = items.filter((item) => item[key] === query.get(key));
  const sort = query.get("sort");
  if (sort === "name") items.sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
  else if (sort === "deadline") items.sort((a, b) => String(a.verifiedDeadline ?? "9999").localeCompare(String(b.verifiedDeadline ?? "9999")));
  else if (sort === "newest") items.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  else if (sort === "manual") items.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const page = Math.max(1, Number(query.get("page") ?? 1)); const limit = Math.min(50, Math.max(1, Number(query.get("limit") ?? 12)));
  return { items: items.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) } };
}

createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  const [, api, version, resource, slug] = url.pathname.split("/");
  response.setHeader("content-type", "application/json");
  if (api !== "api" || version !== "v1" || !collections[resource]) { response.writeHead(404).end(JSON.stringify({ success: false })); return; }
  if (url.searchParams.get("search") === "serverError") { response.writeHead(500).end(JSON.stringify({ success: false })); return; }
  const items = collections[resource];
  if (slug) { const item = items.find((entry) => entry.slug === slug); if (!item) { response.writeHead(404).end(JSON.stringify({ success: false })); return; } response.end(JSON.stringify({ success: true, data: item })); return; }
  response.end(JSON.stringify({ success: true, data: list(resource, url.searchParams) }));
}).listen(4010, "127.0.0.1", () => console.log("Fixture API: http://127.0.0.1:4010"));
