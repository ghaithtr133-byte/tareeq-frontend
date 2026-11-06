/* eslint-disable @typescript-eslint/no-require-imports -- Node tests compile the real source with isolated Next.js boundary substitutes. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function loader(overrides = {}) {
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(__dirname, "..", relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const instance = new Module(filename, module);
    cache.set(filename, instance);
    instance.filename = filename;
    instance.paths = Module._nodeModulePaths(path.dirname(filename));
    const originalRequire = instance.require.bind(instance);
    instance.require = (name) => {
      if (name in overrides) return overrides[name];
      if (name === "server-only") return {};
      if (name.startsWith("@/")) {
        const base = name.slice(2);
        return load(fs.existsSync(path.resolve(__dirname, "..", `${base}.tsx`)) ? `${base}.tsx` : `${base}.ts`);
      }
      return originalRequire(name);
    };
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename, compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, filename);
    return instance.exports;
  }
  return load;
}
const load = loader();
const helpers = load("lib/scholarship-directory.ts");
const demo = load("lib/mocks/public-demo-content.ts");
const { isDemoDetailSlug } = load("lib/mocks/public-demo-routes.ts");

test("directory enforces 12 results, validates URL state, and preserves criteria across pages", () => {
  const params = helpers.directoryScholarshipParams({ page: "2", limit: "50", country: "romania", applicationStatus: "OPEN", sort: "deadline", studyLevel: "ماجستير", featured: "true", search: "بحث", unexpected: "ignored" });
  assert.equal(params.limit, 12);
  assert.equal(params.page, 2);
  const values = helpers.scholarshipFilterValues(params);
  const paged = new URL(helpers.scholarshipDirectoryHref(values, 3), "http://test.local");
  for (const key of ["country", "applicationStatus", "sort", "studyLevel", "featured", "search"]) assert.equal(paged.searchParams.get(key), params[key]);
  assert.equal(paged.searchParams.get("page"), "3");
  assert.equal(paged.searchParams.has("limit"), false);
  assert.equal(paged.searchParams.has("unexpected"), false);
  assert.equal(new URL(helpers.scholarshipDirectoryHref(values), "http://test.local").searchParams.has("page"), false);
  assert.equal(helpers.directoryScholarshipParams({ page: "-1", sort: "manual", applicationStatus: "unknown" }).page, 1);
  assert.equal(helpers.directoryScholarshipParams({ page: "x", applicationStatus: "unknown" }).applicationStatus, undefined);
});

test("real Demo source supplies 12 + 2 distinct records with working detail slugs", async () => {
  const first = await demo.getDemoScholarships({ page: 1, limit: 12, sort: "newest" });
  const second = await demo.getDemoScholarships({ page: 2, limit: 12, sort: "newest" });
  assert.equal(first.items.length, 12);
  assert.equal(second.items.length, 2);
  assert.equal(first.pagination.total, 14);
  assert.equal(first.pagination.totalPages, 2);
  assert.equal(new Set([...first.items, ...second.items].map((item) => item.id)).size, 14);
  for (const item of [...first.items, ...second.items]) {
    assert.equal(isDemoDetailSlug("scholarships", item.slug), true);
    assert.equal((await demo.getDemoScholarship(item.slug)).id, item.id);
  }
});

test("combined Demo filters, English search, empty results and deadline order are accurate", async () => {
  const filtered = await demo.getDemoScholarships({ country: "romania", university: "university-bucharest", studyLevel: "بكالوريوس", fundingType: "تمويل كامل", featured: "true", applicationStatus: "OPEN", limit: 12 });
  assert.equal(filtered.pagination.total, 1);
  assert.equal(filtered.items[0].slug, "romania-academic-scholarship");
  assert.equal((await demo.getDemoScholarships({ search: "Fictional Academic Opportunity", limit: 12 })).pagination.total, 7);
  assert.equal((await demo.getDemoScholarships({ search: "no-matching-scholarship", limit: 12 })).pagination.total, 0);
  const ordered = (await demo.getDemoScholarships({ sort: "deadline", limit: 50 })).items;
  const dates = ordered.map((item) => item.verifiedDeadline ?? "9999");
  assert.deepEqual(dates, [...dates].sort());
  assert.ok((await demo.getDemoScholarships({ applicationStatus: "CLOSED", limit: 50 })).items.every((item) => helpers.scholarshipStatus(item) === "CLOSED"));
});

test("cards prefer effective status and never fabricate optional university, deadline or funding", () => {
  const componentLoad = loader({ "next/link": ({ children, ...props }) => React.createElement("a", props, children) });
  const { ScholarshipDirectoryCard } = componentLoad("components/public/scholarship-directory-card.tsx");
  const sample = { ...demo.publicDemoContent.scholarships.at(-1), applicationStatus: "OPEN", effectiveApplicationStatus: "CLOSED", verifiedDeadline: "invalid", officialSourceUrl: "https://example.invalid/source" };
  const html = renderToStaticMarkup(React.createElement(ScholarshipDirectoryCard, { scholarship: sample }));
  assert.match(html, /التقديم مغلق/);
  assert.doesNotMatch(html, /التقديم مفتوح|تمويل كامل|example.invalid/);
  assert.match(html, /الموعد غير محدد/);
  assert.match(html, /غير محدد/);
  assert.match(html, new RegExp(`/scholarships/${sample.slug}`));
  assert.equal(helpers.scholarshipDeadline(null), null);
  assert.equal(helpers.scholarshipDeadline("invalid"), null);
});

test("large numbered pagination includes current page, boundaries and gaps without duplicates", () => {
  const items = helpers.scholarshipPageNumbers(9, 20);
  assert.deepEqual(items, [1, "gap-8", 8, 9, 10, "gap-20", 20]);
  assert.deepEqual(helpers.scholarshipPageNumbers(1, 2), [1, 2]);
});

test("Live adapter requests only selected API page and propagates errors without Demo fallback", async () => {
  const calls = [];
  const apiLoad = loader({
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "@/api/server-client": { serverApiClient: { get: async (...args) => { calls.push(args); throw new Error("API unavailable"); } } },
    "@/lib/mocks/public-demo-content": { getDemoScholarships: () => { throw new Error("Demo must not run"); } },
  });
  const api = apiLoad("api/public-content.ts");
  const params = helpers.directoryScholarshipParams({ page: "3", country: "romania" });
  await assert.rejects(api.getScholarships(params), /API unavailable/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "/scholarships");
  assert.equal(calls[0][1].params.page, 3);
  assert.equal(calls[0][1].params.limit, 12);
});

test("directory-only card styling emphasizes the CTA and fixes RTL cell padding without changing shared defaults", () => {
  const componentLoad = loader({ "next/link": ({ children, ...props }) => React.createElement("a", props, children) });
  const { ScholarshipDirectoryCard } = componentLoad("components/public/scholarship-directory-card.tsx");
  const scholarship = demo.publicDemoContent.scholarships[0];
  const render = (variant) => renderToStaticMarkup(React.createElement(ScholarshipDirectoryCard, { scholarship, variant }));
  const refined = render("directory");
  const shared = render(undefined);
  assert.ok(refined.includes("bg-[#082B50] text-white"));
  assert.ok(refined.includes("hover:border-[#C8A253] hover:bg-[#123D6A]"));
  assert.ok(refined.includes("focus-visible:outline-offset-2"));
  assert.ok(refined.includes(`href="/scholarships/${scholarship.slug}"`));
  assert.ok(refined.includes(`aria-label="التفاصيل والتقديم: ${scholarship.titleAr}"`));
  const metadata = refined.match(/<dl[^>]*>[\s\S]*?<\/dl>/)[0];
  assert.equal((metadata.match(/class="relative[^\"]*px-2/g) ?? []).length, 3);
  assert.equal(metadata.includes("divide-x-reverse"), false);
  assert.ok(shared.includes("divide-x-reverse"));
  assert.ok(shared.includes("border-[#D9BF8E] text-[#123D6A] hover:bg-[#F9F4EA]"));
  for (const field of ["titleAr", "studyLevel", "fundingType"]) assert.ok(refined.includes(scholarship[field]));
});

test.skip("legacy server-rendered Scholarships route coverage; replaced by client-shell coverage", async () => {
  const calls = [];
  const methods = { getScholarships: demo.getDemoScholarships, getCountries: demo.getDemoCountries, getUniversities: demo.getDemoUniversities };
  const pageLoad = loader({
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
    "next/navigation": { useRouter: () => ({ push() {} }), redirect: () => { throw Error("unexpected redirect"); } },
    "@/lib/public-content-mode": { isPublicDemoMode: () => true },
    "@/api/public-content": Object.fromEntries(Object.entries(methods).map(([name, method]) => [name, (...args) => { calls.push({ name, args }); return method(...args); }])),
  });
  const html = renderToStaticMarkup(await pageLoad("app/scholarships/page.tsx").default({ searchParams: Promise.resolve({}) }));
  const hero = html.match(/<section aria-labelledby="scholarships-title"[\s\S]*?<\/section>/)[0];
  assert.ok(fs.existsSync(path.resolve(__dirname, "../public/images/scholarships/scholarships-hero.png")));
  assert.ok(hero.includes('src="/images/scholarships/scholarships-hero.png"'));
  assert.ok(hero.includes('alt="قبعة تخرج وكتب وكرة أرضية ترمز إلى فرص المنح الدراسية"'));
  assert.ok(hero.includes("md:w-[58%]"));
  assert.equal(hero.includes("<svg"), false);
  for (const text of ["الرئيسية", "اكتشف فرصتك", "المنح الدراسية", "تصفح أحدث المنح الدراسية المتوفرة من جامعات وحكومات حول العالم وابدأ رحلتك الأكاديمية الآن."]) assert.ok(hero.includes(text));
  assert.equal((html.match(/<article\b/g) ?? []).length, 12);
  assert.equal((html.match(/bg-\[#082B50\] text-white hover:border/g) ?? []).length, 12);
  assert.ok(html.includes('aria-expanded="false" aria-controls="scholarship-advanced"'));
  assert.ok(html.includes('id="scholarship-advanced" hidden=""'));
  assert.ok(html.includes("lg:w-80 lg:shrink-0"));
  assert.equal(calls.length, 3);
  assert.equal(calls.find((call) => call.name === "getScholarships").args[0].limit, 12);
  assert.equal(calls.find((call) => call.name === "getScholarships").args[0].page, 1);
});

const pageData = (items = [], page = 1, limit = 12, total = items.length) => ({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
const liveModel = load("lib/scholarship-directory-live.ts");
const liveRecord = { id: "live-one", slug: "real-scholarship", titleAr: "منحة منشورة", countryId: "c1", universityId: "u1", studyLevel: "MASTER", fundingType: "GOVERNMENT_FUNDED", applicationStatus: "OPEN", effectiveApplicationStatus: "CLOSED", verifiedDeadline: null, featured: true, imageUrl: "https://media.example/real.jpg", imageAltAr: "صورة المنحة المنشورة" };
const liveCountries = [{ id: "c1", slug: "romania", nameAr: "رومانيا" }];
const liveUniversities = [{ id: "u1", slug: "real-university", nameAr: "الجامعة المرتبطة", countryId: "other-country" }];
const ui = {
  "next/link": ({ children, ...props }) => React.createElement("a", props, children),
  "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
  "next/navigation": { useRouter: () => ({ push() {}, refresh() {} }), redirect: (url) => { throw Error(`REDIRECT:${url}`); } },
};

test("Live validates the published projection and pagination, preserves partial records, and rejects malformed collections", () => {
  assert.equal(liveModel.parseScholarshipDirectory(pageData([liveRecord]), 1).items[0].titleAr, liveRecord.titleAr);
  for (const data of [null, {}, pageData([{ ...liveRecord, status: "DRAFT" }]), pageData([{ ...liveRecord, slug: "../wrong" }]), pageData([liveRecord, liveRecord]), pageData([], 1, 12, 3), pageData([liveRecord], 2)]) assert.throws(() => liveModel.parseScholarshipDirectory(data, 1));
  const partial = liveModel.parseScholarshipDirectory(pageData([{ id: "partial", slug: "partial-scholarship", imageUrl: "javascript:alert(1)" }]), 1).items[0];
  assert.equal(partial.titleAr, "اسم المنحة (غير متوفر حالياً)");
  assert.equal(partial.imageUrl, null);
  assert.equal(partial.verifiedDeadline, null);
  assert.equal(partial.fundingType, "");
  assert.equal(liveModel.directoryScholarshipLabel(partial.fundingType, "funding"), "نوع التمويل (غير متوفر حالياً)");
});

test("Live application status is Backend-owned, unknown stays neutral and deadlines never imply a status", () => {
  assert.equal(liveModel.directoryApplicationStatus(liveRecord), "CLOSED");
  assert.equal(liveModel.directoryApplicationStatus({ applicationStatus: "OPEN", verifiedDeadline: "2000-01-01T00:00:00Z" }), "OPEN");
  assert.equal(liveModel.directoryApplicationStatus({ applicationStatus: "CLOSED", verifiedDeadline: null }), "CLOSED");
  for (const value of [{ status: "PUBLISHED" }, { applicationStatus: "unknown" }, { applicationStatus: "OPEN", effectiveApplicationStatus: "bad" }]) assert.equal(liveModel.directoryApplicationStatus(value), null);
  for (const value of [null, "", "invalid", "1", "2026-02-31T00:00:00Z"]) assert.equal(liveModel.directoryDeadline(value), null);
  assert.equal(liveModel.directoryDeadline("2026-05-08T13:00:00Z"), "2026-05-08T13:00:00Z");
  const component = loader(ui)("components/public/scholarship-directory-card.tsx").ScholarshipDirectoryCard;
  const partial = liveModel.parseScholarshipDirectory(pageData([{ id: "partial", slug: "partial-scholarship" }]), 1).items[0];
  const html = renderToStaticMarkup(React.createElement(component, { scholarship: partial, live: true, variant: "directory" }));
  for (const text of ["حالة التقديم (غير متوفر حالياً)", "نوع التمويل (غير متوفر حالياً)", "موعد التقديم (غير متوفر حالياً)", "صورة المنحة (غير متوفر حالياً)"]) assert.ok(html.includes(text));
  assert.doesNotMatch(html, /التقديم مفتوح|التقديم مغلق|تمويل كامل/);
});

test("Live joins real relationship IDs once, respects valid projections and never infers a country from a university", () => {
  const [joined] = liveModel.joinScholarshipDirectory([liveRecord], liveCountries, liveUniversities);
  assert.equal(joined.country.nameAr, "رومانيا");
  assert.equal(joined.university.nameAr, "الجامعة المرتبطة");
  const [unrelated] = liveModel.joinScholarshipDirectory([{ ...liveRecord, countryId: null, universityId: null, country: liveCountries[0], university: liveUniversities[0] }], liveCountries, liveUniversities);
  assert.equal(unrelated.country, null);
  assert.equal(unrelated.university, null);
  const [projected] = liveModel.joinScholarshipDirectory([{ ...liveRecord, country: { ...liveCountries[0], nameAr: "الدولة من العلاقة" } }], [], []);
  assert.equal(projected.country.nameAr, "الدولة من العلاقة");
  const [missing] = liveModel.joinScholarshipDirectory([liveRecord], [], liveUniversities);
  assert.equal(missing.country, null);
  assert.equal(missing.university.nameAr, "الجامعة المرتبطة");
});

function liveRoute({ data = pageData([liveRecord]), countries = pageData(liveCountries, 1, 50), universities = pageData(liveUniversities, 1, 50), failScholarships = false, failCountries = false } = {}) {
  const calls = [];
  const scoped = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/server-client": { serverApiClient: { get: async (url, config) => {
    calls.push({ url, params: config.params });
    if ((url === "/scholarships" && failScholarships) || (url === "/countries" && failCountries)) throw Error("offline");
    return { data: { success: true, data: url === "/scholarships" ? data : url === "/countries" ? countries : universities } };
  } } } });
  return { calls, page: scoped("app/scholarships/page.tsx").default };
}
test.skip("legacy server-rendered Scholarships route coverage; replaced by client-shell coverage", async () => {
  const route = liveRoute({ data: pageData([liveRecord], 2, 12, 14) });
  const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({ page: "2", search: "منحة", country: "romania", university: "real-university", studyLevel: "MASTER", fundingType: "GOVERNMENT_FUNDED", applicationStatus: "CLOSED", featured: "true", sort: "deadline" }) }));
  assert.equal(route.calls.length, 3);
  const query = route.calls.find((row) => row.url === "/scholarships").params;
  assert.deepEqual(query, { page: 2, limit: 12, search: "منحة", featured: "true", country: "romania", university: "real-university", studyLevel: "MASTER", fundingType: "GOVERNMENT_FUNDED", applicationStatus: "CLOSED", sort: "deadline" });
  for (const text of ["منحة منشورة", "التقديم مغلق", "علم رومانيا", "الجامعة المرتبطة", "ماجستير", "تمويل حكومي", "https://media.example/real.jpg", "/scholarships/real-scholarship"]) assert.ok(html.includes(text), text);
  assert.equal((html.match(/<article\b/g) ?? []).length, 1);
  assert.ok(html.includes("data-balanced-cards"));
  assert.ok(html.includes("14"));
  assert.doesNotMatch(html, /Fictional|الخيالية|تمويل حكومي كامل/);
});

test.skip("legacy server-rendered Scholarships route coverage; replaced by client-shell coverage", async () => {
  for (const [config, filters, expected] of [
    [{ data: pageData() }, {}, "لا توجد منح دراسية منشورة حالياً"],
    [{ data: pageData() }, { search: "no-match" }, "لا توجد منح دراسية تطابق البحث"],
    [{ failScholarships: true }, {}, "تعذّر تحميل المنح الدراسية"],
    [{ data: { items: [], pagination: { total: 9 } } }, {}, "تعذّر تحميل المنح الدراسية"],
  ]) {
    const route = liveRoute(config);
    const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve(filters) }));
    assert.ok(html.includes(expected));
    assert.ok(html.includes("نتائج المنح الدراسية") || html.includes("تم العثور على"));
    assert.ok(html.includes("تحتاج مساعدة في التقديم"));
    if (expected.includes("تعذّر")) { assert.ok(html.includes("إعادة المحاولة")); assert.equal(html.includes("لا توجد منح"), false); }
  }
  const route = liveRoute({ failCountries: true });
  const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({}) }));
  assert.ok(html.includes("منحة منشورة"));
  assert.ok(html.includes("تعذّر تحميل بعض خيارات التصفية"));
  assert.ok(html.includes("الدولة (غير متوفر حالياً)"));
  assert.equal(html.includes("علم رومانيا"), false);
});

test.skip("legacy server-rendered Scholarships route coverage; replaced by client-shell coverage", async () => {
  const route = liveRoute({ universities: pageData(liveUniversities, 1, 50, 70) });
  const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({}) }));
  assert.ok(html.includes("أول 50 جامعة"));
  assert.ok(html.includes('maxLength="120"'));
  const redirect = liveRoute({ data: pageData([], 8, 12, 14) });
  await assert.rejects(redirect.page({ searchParams: Promise.resolve({ page: "8", country: "romania", sort: "deadline" }) }), /REDIRECT:\/scholarships\?country=romania&sort=deadline&page=2/);
  const params = helpers.directoryScholarshipParams({ studyLevel: "a".repeat(300), fundingType: "b".repeat(300), country: "../bad", university: "x".repeat(121) });
  assert.equal(params.studyLevel.length, 120);
  assert.equal(params.fundingType.length, 120);
  assert.equal(params.country, undefined);
  assert.equal(params.university, undefined);
});

test("Existing advanced mobile disclosure, reset and pagination remain wired without adding a new Drawer", () => {
  const pushes = [];
  const values = helpers.scholarshipFilterValues(helpers.directoryScholarshipParams({ country: "romania", studyLevel: "MASTER", page: "3", sort: "deadline" }));
  const react = { ...React, useState: (initial) => [initial, () => {}], useRef: (value) => ({ current: value }), useEffect() {}, useTransition: () => [false, (run) => run()] };
  const scoped = loader({ react, "next/navigation": { useRouter: () => ({ push: (url, options) => pushes.push({ url, options }), refresh() {} }) } });
  const component = scoped("components/public/scholarship-directory-filters.tsx").ScholarshipDirectoryFilters;
  const tree = component({ values, countries: [], universities: [], optionError: false, children: null });
  const nodes = [];
  function walk(value) { if (!value || typeof value !== "object") return; if (Array.isArray(value)) return value.forEach(walk); if (value.props) { nodes.push(value); walk(value.props.children); } }
  walk(tree);
  const advanced = nodes.find((node) => node.props["aria-controls"] === "scholarship-advanced");
  assert.equal(advanced.props["aria-expanded"], false);
  assert.equal(nodes.find((node) => node.props.id === "scholarship-advanced").props.hidden, true);
  const reset = nodes.find((node) => node.type === "button" && JSON.stringify(node.props.children).includes("إعادة ضبط الفلاتر"));
  reset.props.onClick();
  assert.deepEqual(pushes, [{ url: "/scholarships", options: { scroll: false } }]);
  const select = nodes.find((node) => node.type === "select" && node.props.id === "scholarships-applicationStatus");
  select.props.onChange({ target: { value: "CLOSED" } });
  const url = new URL(pushes.at(-1).url, "http://test.local");
  assert.equal(url.searchParams.get("applicationStatus"), "CLOSED");
  assert.equal(url.searchParams.get("country"), "romania");
  assert.equal(url.searchParams.get("studyLevel"), "MASTER");
  assert.equal(url.searchParams.has("page"), false);
});
