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

test("Scholarships route uses the approved real hero image, compact toolbar, and scoped card variant with unchanged fetching", async () => {
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
