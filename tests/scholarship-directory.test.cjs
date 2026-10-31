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
