/* eslint-disable @typescript-eslint/no-require-imports -- Exercise TS/TSX with isolated Next runtime boundaries. */
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
    const original = instance.require.bind(instance);
    instance.require = (name) => {
      if (name in overrides) return overrides[name];
      if (name === "server-only") return {};
      const target = name.startsWith("@/") ? path.resolve(__dirname, "..", name.slice(2)) : name.startsWith(".") ? path.resolve(path.dirname(filename), name) : null;
      if (target) for (const extension of [".tsx", ".ts"]) if (fs.existsSync(target + extension)) return load(path.relative(path.resolve(__dirname, ".."), target + extension));
      return original(name);
    };
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
    return instance.exports;
  }
  return load;
}
const load = loader();
const model = load("lib/university-details.ts");
const demo = load("lib/mocks/public-demo-content.ts");
const { demoUniversityDetails } = load("lib/mocks/university-detail-fixtures.ts");
const empty = { search: "", level: "", language: "", faculty: "" };

test("exactly four ordered tabs; direct and invalid URL values resolve safely", () => {
  assert.deepEqual(model.universityTabs.map((tab) => tab.id), ["overview", "programs", "admissions", "gallery"]);
  for (const tab of model.universityTabs) assert.equal(model.universityTab(tab.id), tab.id);
  for (const value of [null, "", "scholarships", "invalid"]) assert.equal(model.universityTab(value), "overview");
});
test("Demo profiles are isolated, university-specific, and contain no invented authentic campus photos", async () => {
  const universities = (await demo.getDemoUniversities({ limit: 50 })).items;
  for (const university of universities) {
    const content = demoUniversityDetails(university);
    assert.ok(content.programs.length);
    assert.ok(content.faqs.every((faq) => faq.question.includes(university.nameAr)));
    assert.ok(content.admissions[0].includes(university.nameAr));
    assert.equal(content.gallery.length, 0);
    assert.deepEqual(demoUniversityDetails({ ...university, id: "live-id" }), model.emptyUniversityContent());
  }
});
test("complete Demo programs support combined search, level, language, and faculty filters", async () => {
  const programs = demoUniversityDetails(await demo.getDemoUniversity("university-bucharest")).programs;
  assert.equal(model.filterUniversityPrograms(programs, empty).length, 4);
  assert.equal(model.filterUniversityPrograms(programs, { ...empty, search: "  إدارة  ", level: "ماجستير", language: "الرومانية", faculty: "الإدارة" }).length, 1);
  assert.equal(model.filterUniversityPrograms(programs, { ...empty, search: "missing" }).length, 0);
  assert.equal(model.filterUniversityPrograms(programs, { ...empty, language: "التركية" }).length, 0);
});
test("tuition preserves currency, unknown period, academic year, zero, and missing values honestly", () => {
  assert.equal(model.programTuition(null), "غير معلنة");
  assert.equal(model.programTuition({ amount: 0, currency: "EUR" }), `${new Intl.NumberFormat("ar").format(0)} · EUR`);
  assert.equal(model.programTuition({ amount: 2500, currency: "EUR" }).includes("سنو"), false);
  assert.ok(model.programTuition({ amount: 100, currency: "TRY", period: "فصلي", academicYear: "2026–2027" }).endsWith("TRY · فصلي · 2026–2027"));
});
test("scholarships append 3 + 3 + 1, respect metadata, deduplicate, and reject unrelated/unpublished records", () => {
  const items = Array.from({ length: 7 }, (_, index) => ({ id: `${index}`, universityId: "u1", university: { slug: "university-one" }, status: "PUBLISHED" }));
  const pages = [1, 2, 3].map((page) => ({ items: items.slice((page - 1) * 3, page * 3), pagination: { page, limit: 3, total: 7, totalPages: 3 } }));
  assert.equal(model.RELATED_SCHOLARSHIP_BATCH, 3);
  assert.deepEqual(pages.map(model.nextScholarshipPage), [2, 3, undefined]);
  assert.deepEqual([1, 2, 3].map((n) => model.uniqueUniversityScholarships(pages.slice(0, n), "u1", "university-one").length), [3, 6, 7]);
  const dirty = { ...pages[0], items: [...pages[0].items, items[0], { ...items[0], id: "wrong", universityId: "u2" }, { ...items[0], id: "draft", status: "DRAFT" }, { ...items[0], id: "wrong-slug", university: { slug: "other" } }] };
  assert.equal(model.uniqueUniversityScholarships([dirty], "u1", "university-one").length, 3);
  assert.equal(model.uniqueUniversityScholarships(pages, "u2", "other").length, 0);
});
test("read-only scholarship bridge uses existing scoped endpoint client, limit 3, validates input, and never fabricates errors as empty", async () => {
  const calls = [];
  const data = { items: [], pagination: { page: 2, limit: 3, total: 0, totalPages: 0 } };
  const local = loader({ "@/api/public-content": { getScholarships: async (params) => { calls.push(params); return data; } } });
  const { loadUniversityScholarships } = local("api/university-detail-actions.ts");
  assert.deepEqual(await loadUniversityScholarships("university-bucharest", 2), { ok: true, data });
  assert.deepEqual(calls, [{ university: "university-bucharest", page: 2, limit: 3, sort: "newest" }]);
  for (const [slug, page] of [["", 1], ["valid", 0], ["valid", 1.5]]) assert.deepEqual(await loadUniversityScholarships(slug, page), { ok: false });
  assert.equal(calls.length, 1);
  const fail = loader({ "@/api/public-content": { getScholarships: async () => { throw Error("offline"); } } })("api/university-detail-actions.ts");
  assert.deepEqual(await fail.loadUniversityScholarships("valid", 1), { ok: false });
});

const ui = {
  "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
  "next/navigation": { useSearchParams: () => new URLSearchParams(), notFound: () => { throw Error("NOT_FOUND"); } },
  "@tanstack/react-query": { useInfiniteQuery: (options) => ({ data: options.initialData, isPending: false, isError: false, hasNextPage: false }) },
};
test("shared page structure has one scholarship section and FAQ outside all panels; Live does not substitute Demo data", async () => {
  const university = await demo.getDemoUniversity("university-bucharest");
  const initial = await demo.getDemoScholarships({ university: university.slug, limit: 3 });
  for (const demoMode of [true, false]) {
    const local = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => demoMode }, "@/api/public-content": { getUniversity: async () => university }, "@/api/university-detail-actions": { loadUniversityScholarships: async () => ({ ok: true, data: initial }) } });
    const page = await local("app/universities/[slug]/page.tsx").default({ params: Promise.resolve({ slug: university.slug }) });
    const html = renderToStaticMarkup(page);
    assert.equal((html.match(/role="tab"/g) ?? []).length, 4);
    assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 4);
    assert.ok(html.includes('aria-selected="true" aria-controls="university-panel-overview"'));
    assert.equal((html.match(/data-university-scholarships/g) ?? []).length, 1);
    assert.ok(html.indexOf("data-university-scholarships") > html.indexOf('id="university-panel-gallery"'));
    assert.equal(html.includes("معلومات أساسية"), false);
    assert.equal(html.includes("نبذة سريعة عن الجامعة"), false);
    assert.equal((html.match(/data-university-faq/g) ?? []).length, demoMode ? 1 : 0);
    if (demoMode) assert.ok(html.indexOf("data-university-faq") > html.indexOf("data-university-scholarships"));
    else { assert.equal(html.includes("برامج ورسوم خيالية"), false); assert.ok(html.includes("لا تتوفر حاليًا بيانات منشورة عن البرامج")); }
    const { createWhatsappUrl } = local("lib/whatsapp.ts");
    assert.ok(html.includes(createWhatsappUrl(`مرحبًا، أود الاستفسار عن الدراسة في ${university.nameAr}.`)));
  }
});
test("Homepage and university FAQ import the same accessible disclosure, preserving first-open, styles and reduced motion", () => {
  const local = loader(ui);
  const { FaqAccordion } = local("components/public/faq-accordion.tsx");
  const html = renderToStaticMarkup(React.createElement(FaqAccordion, { name: "test", items: [{ question: "سؤال ١", answer: "جواب ١" }, { question: "سؤال ٢", answer: "جواب ٢" }] }));
  assert.equal((html.match(/<summary/g) ?? []).length, 2);
  assert.equal((html.match(/open=""/g) ?? []).length, 1);
  assert.ok(html.includes("motion-reduce:transition-none"));
  const homeSource = fs.readFileSync(path.resolve(__dirname, "../components/home/home-faq.tsx"), "utf8");
  const detailSource = fs.readFileSync(path.resolve(__dirname, "../components/public/university-details.tsx"), "utf8");
  assert.ok(homeSource.includes('<FaqAccordion items={questions} name="home-faq"'));
  assert.ok(detailSource.includes("<FaqAccordion items={content.faqs}"));
  const home = renderToStaticMarkup(React.createElement(local("components/home/home-faq.tsx").HomeFaq));
  assert.equal((home.match(/<summary/g) ?? []).length, 6);
  assert.ok(home.includes("كيف أختار الجامعة المناسبة؟"));
});

test("related scholarship component exposes loading/error separately, omits successful empty data, and wires paginated appends", async () => {
  const university = await demo.getDemoUniversity("university-bucharest");
  const sample = (await demo.getDemoScholarships({ university: university.slug, limit: 3 })).items[0];
  const items = Array.from({ length: 7 }, (_, index) => ({ ...sample, id: `item-${index}`, slug: `test-${index}` }));
  const pages = [1, 2, 3].map((page) => ({ items: items.slice((page - 1) * 3, page * 3), pagination: { page, limit: 3, total: 7, totalPages: 3 } }));
  const props = { id: university.id, slug: university.slug, demo: true, initial: null };
  let options;
  let state = { isPending: true };
  const requests = [];
  const local = loader({ ...ui,
    "@tanstack/react-query": { useInfiniteQuery: (value) => { options = value; return state; } },
    "@/api/university-detail-actions": { loadUniversityScholarships: async (slug, page) => { requests.push({ slug, page }); return { ok: true, data: pages[page - 1] }; } },
  });
  const { UniversityDetailScholarships } = local("components/public/university-detail-scholarships.tsx");
  const render = () => renderToStaticMarkup(React.createElement(UniversityDetailScholarships, props));
  assert.ok(render().includes("جارٍ تحميل المنح المرتبطة"));
  state = { isPending: false, isError: true };
  const failed = render();
  assert.ok(failed.includes("إعادة المحاولة"));
  assert.ok(failed.includes("هذا لا يعني عدم توفر منح"));
  state = { data: { pages: [{ items: [], pagination: { page: 1, totalPages: 0 } }] } };
  assert.equal(render(), "");
  for (const count of [1, 2, 3]) {
    state = { data: { pages: pages.slice(0, count) }, hasNextPage: count < 3 };
    const html = render();
    assert.equal((html.match(/<article/g) ?? []).length, [3, 6, 7][count - 1]);
    assert.equal(html.includes("عرض المزيد من المنح"), count < 3);
    assert.deepEqual(await options.queryFn({ pageParam: count }), pages[count - 1]);
  }
  assert.deepEqual(requests, [1, 2, 3].map((page) => ({ slug: university.slug, page })));
  assert.deepEqual(options.queryKey, ["university-detail-scholarships", "demo", university.id, university.slug]);
  assert.equal(options.gcTime, 0);
});
