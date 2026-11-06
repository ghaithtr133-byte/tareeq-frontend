/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the real route/client with isolated Next boundaries. */
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
    cache.set(filename, instance); instance.filename = filename;
    instance.paths = Module._nodeModulePaths(path.dirname(filename));
    const original = instance.require.bind(instance);
    instance.require = (name) => {
      if (name in overrides) return overrides[name];
      if (name === "server-only") return {};
      if (name.endsWith(".module.css")) return {};
      const target = name.startsWith("@/") ? path.resolve(__dirname, "..", name.slice(2)) : name.startsWith(".") ? path.resolve(path.dirname(filename), name) : null;
      if (target) for (const extension of [".tsx", ".ts"]) if (fs.existsSync(target + extension)) return load(path.relative(path.resolve(__dirname, ".."), target + extension));
      return original(name);
    };
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
    return instance.exports;
  }
  return load;
}
const ui = {
  "@tanstack/react-query": { useInfiniteQuery: (options) => ({ data: options.initialData, isFetching: false, isError: false, isFetchNextPageError: false, hasNextPage: options.initialData ? !!options.getNextPageParam(options.initialData.pages.at(-1)) : false }) },
  "next/link": ({ children, ...props }) => React.createElement("a", props, children),
  "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
  "next/navigation": { useRouter: () => ({ push() {}, refresh() {} }), redirect: (href) => { throw Error(`redirect:${href}`); } },
};
const country = { id: "real-country", slug: "romania", nameAr: "رومانيا", nameEn: "Romania" };
const university = (index = 1) => ({ id: `real-university-${index}`, slug: `real-university-${index}`, nameAr: `جامعة منشورة ${index}`, countryId: country.id, cityAr: "مدينة حقيقية", overviewAr: "نبذة حقيقية", universityType: "PRIVATE", city: null, imageUrl: null, imageAltAr: null });
const list = (items, changes = {}) => ({ items, pagination: { page: 1, limit: 6, total: items.length, totalPages: Math.ceil(items.length / 6), ...changes } });
const facets = { majors: [{ value: "medicine", nameAr: "الطب", count: 1 }], studyLevels: [{ value: "BACHELORS", count: 1 }], languages: [{ value: "ENGLISH", count: 1 }], cities: [{ value: "bucharest", nameAr: "بوخارست", count: 1 }], universityTypes: [{ value: "PRIVATE", count: 1 }] };

async function render(raw = {}, changes = {}, calls = []) {
  const responses = { "/universities": list([university()]), "/countries": list([country], { limit: 50 }), "/universities/filter-options": facets, "/scholarships": list([], { limit: 4 }), ...changes };
  const load = loader({ ...ui,
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "@/lib/mocks/public-demo-content": new Proxy({}, { get() { throw Error("Live must not touch Demo records"); } }),
    "@/lib/university-directory-demo": new Proxy({}, { get() { throw Error("Live must not import Demo directory"); } }),
    "@/lib/api-client/server-client": { serverApiClient: { get: async (path, config) => {
      calls.push({ path, config });
      const response = responses[path];
      if (response instanceof Error) throw response;
      if (!(path in responses)) throw Error("Unexpected request");
      return { data: { success: true, data: response } };
    } } },
  });
  return renderToStaticMarkup(await load("app/universities/page.tsx").default({ searchParams: Promise.resolve(raw) }));
}

test("Live uses supported combined filters, canonical enum values, real dynamic options and a single country lookup", async () => {
  const calls = [];
  const criteria = { search: "طب", country: "romania", major: "medicine", studyLevel: "BACHELORS", language: "ENGLISH", city: "bucharest", universityType: "PRIVATE", featured: "true", sort: "name", page: "2" };
  const html = await render(criteria, { "/universities": list([university()], { page: 2, total: 7, totalPages: 2 }) }, calls);
  assert.deepEqual(calls.map((call) => call.path), ["/universities", "/countries", "/universities/filter-options", "/scholarships"]);
  const params = calls[0].config.params;
  for (const [key, value] of Object.entries(criteria)) assert.equal(params[key], key === "page" ? 2 : value);
  assert.equal(params.limit, 6);
  assert.deepEqual(calls[3].config.params, { universitySearch: "طب", universityCountry: "romania", universityMajor: "medicine", universityStudyLevel: "BACHELORS", universityLanguage: "ENGLISH", universityCity: "bucharest", universityType: "PRIVATE", universityFeatured: "true", page: 1, limit: 4, sort: "newest" });
  assert.equal("page" in calls[2].config.params, false);
  for (const value of ["رومانيا", "الطب", "بكالوريوس", "الإنجليزية", "بوخارست", "خاصة", "مدينة حقيقية", "نبذة حقيقية"]) assert.ok(html.includes(value), value);
  assert.ok(html.includes('href="/universities/real-university-1"'));
  assert.ok(html.includes("page=1"));
  assert.ok(html.includes("major=medicine"));
  assert.ok(html.includes("studyLevel=BACHELORS"));
  assert.ok(html.includes("لا تتوفر حالياً منح دراسية مرتبطة"));
  assert.equal(html.includes("غير مدعوم حالياً"), false);
});

const related = (index) => ({ id: `related-${index}`, slug: `related-${index}`, titleAr: `منحة منشورة ${index}`, universityId: `off-page-university-${index}`, countryId: country.id, applicationStatus: "OPEN", effectiveApplicationStatus: "CLOSED", fundingType: null, studyLevel: "BACHELORS" });
test("Live related scholarships include off-page universities and preserve success, partial, empty and isolated error states", async () => {
  const html = await render({ country: "romania", page: "2" }, { "/universities": list([university()], { page: 2, total: 7, totalPages: 2 }), "/scholarships": list([related(1)], { limit: 4 }) });
  assert.ok(html.includes('href="/scholarships/related-1"'));
  assert.ok(html.includes("منحة منشورة 1"));
  assert.ok(html.includes("اسم الجامعة (غير متوفر حالياً)"));
  assert.ok(html.includes("نوع التمويل (غير متوفر حالياً)"));
  assert.ok(html.includes("التقديم مغلق"));
  assert.equal(html.includes("التقديم مفتوح"), false);
  assert.equal(html.includes("تمويل كامل"), false);
  for (const bad of [Error("HTTP 503"), null, {}, list([null], { limit: 4 }), list([{ ...related(1), status: "DRAFT" }], { limit: 4 }), list([{ ...related(1), universityId: null }], { limit: 4 })]) {
    const failed = await render({ country: "romania" }, { "/scholarships": bad });
    assert.ok(failed.includes("تعذر تحميل المنح المرتبطة"));
    assert.ok(failed.includes("جامعة منشورة 1"));
    assert.ok(failed.includes("إعادة المحاولة"));
    assert.equal(failed.includes("لا تتوفر حالياً منح دراسية مرتبطة"), false);
  }
  for (const raw of [{}, { sort: "name" }, { page: "1" }]) {
    const calls = [];
    await render(raw, {}, calls);
    assert.equal(calls.some((call) => call.path === "/scholarships"), false);
  }
  const calls = [];
  const emptyUniversities = await render({ country: "romania" }, { "/universities": list([]) }, calls);
  assert.equal(emptyUniversities.includes('id="related-scholarships-title"'), false);
  assert.equal(calls.some((call) => call.path === "/scholarships"), false);
});

test("Read-only load-more bridge validates requests and uses scholarship pagination independently", async () => {
  const calls = [];
  const local = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/lib/api-client/public-content": { getScholarships: async (params) => { calls.push(params); return list([related(5)], { page: params.page, limit: 4, total: 9, totalPages: 3 }); } } });
  const { loadRelatedUniversityScholarships } = local("lib/api-client/university-related-scholarships.ts");
  const criteria = { country: "romania", page: 99, limit: 6, sort: "name", major: "medicine" };
  const result = await loadRelatedUniversityScholarships(criteria, 2);
  assert.equal(result.ok, true);
  assert.equal(calls[0].page, 2);
  assert.equal(calls[0].limit, 4);
  assert.equal(calls[0].sort, "newest");
  assert.equal(calls[0].universityCountry, "romania");
  for (const key of ["country", "university", "universityIds", "search", "studyLevel", "featured"]) assert.equal(key in calls[0], false);
  assert.equal((await loadRelatedUniversityScholarships({}, 1)).ok, false);
  assert.equal((await loadRelatedUniversityScholarships(criteria, 0)).ok, false);
  assert.equal(calls.length, 1);
  const demo = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => true }, "@/lib/api-client/public-content": { getScholarships() { throw Error("must not fetch"); } } })("lib/api-client/university-related-scholarships.ts");
  assert.equal((await demo.loadRelatedUniversityScholarships(criteria, 1)).ok, false);
});

test("Related load-more appends batches, retries failed pages, and keys data only by university criteria", async () => {
  let options, fetched = 0, refetched = 0;
  const first = list([related(1)], { limit: 4, total: 9, totalPages: 3 });
  const second = list([related(1), related(2)], { page: 2, limit: 4, total: 9, totalPages: 3 });
  let state = { data: { pages: [first, second] }, isFetching: false, isError: false, isFetchNextPageError: false, hasNextPage: true, fetchNextPage() { fetched++; }, refetch() { refetched++; } };
  const local = loader({ ...ui, "@tanstack/react-query": { useInfiniteQuery: (value) => { options = value; return state; } }, "@/lib/api-client/university-related-scholarships": { loadRelatedUniversityScholarships: async () => ({ ok: true, data: second }) } });
  const { LiveUniversityRelatedScholarships } = local("components/public/live-university-related-scholarships.tsx");
  const props = { criteria: { country: "romania", page: 7, sort: "name" }, initial: first, countries: [country], universities: [] };
  let tree = LiveUniversityRelatedScholarships(props);
  const html = renderToStaticMarkup(tree);
  assert.equal((html.match(/href="\/scholarships\/related-/g) ?? []).length, 2);
  const key = options.queryKey;
  assert.equal(options.getNextPageParam(second), 3);
  assert.equal(options.staleTime, 60000);
  assert.equal("placeholderData" in options, false);
  walk(tree, (node) => node.type === "button" && text(node).includes("عرض المزيد"))[0].props.onClick();
  assert.equal(fetched, 1);
  LiveUniversityRelatedScholarships({ ...props, criteria: { ...props.criteria, page: 8, sort: "newest" } });
  assert.deepEqual(options.queryKey, key);
  LiveUniversityRelatedScholarships({ ...props, criteria: { country: "poland" } });
  assert.notDeepEqual(options.queryKey, key);
  state = { ...state, isFetchNextPageError: true };
  tree = LiveUniversityRelatedScholarships(props);
  walk(tree, (node) => node.props?.title === "تعذر تحميل المنح المرتبطة")[0].props.onRetry();
  assert.equal(fetched, 2);
  assert.equal(refetched, 0);
  state = { ...state, data: undefined, isFetchNextPageError: false, isFetching: true };
  assert.ok(renderToStaticMarkup(LiveUniversityRelatedScholarships({ ...props, initial: null })).includes("جارٍ تحميل المنح المرتبطة"));
});

test("Initial listing retains real cards, placeholders and shared states without silently substituting Demo content", async () => {
  const html = await render();
  assert.equal(html.includes('id="related-scholarships-title"'), false);
  assert.ok(html.includes("صورة الجامعة (غير متوفر حالياً)"));
  assert.ok(html.includes('aria-label="شعار الجامعة (غير متوفر حالياً)"'));
  assert.equal(html.includes("شعار جامعة بوخارست:"), false);
  assert.equal(html.includes("Demo"), false);
  const empty = await render({}, { "/universities": list([]) });
  assert.ok(empty.includes("لا توجد جامعات منشورة حالياً"));
  assert.equal(empty.includes('role="alert"'), false);
  const filtered = await render({ major: "medicine" }, { "/universities": list([]) });
  assert.ok(filtered.includes("لا توجد جامعات تطابق البحث"));
  assert.ok(filtered.includes("مسح الفلاتر"));
  for (const response of [Error("ENOTFOUND raw"), Error("503 raw"), null, {}, list([null]), list([{ ...university(), status: "DRAFT" }])]) {
    const failed = await render({}, { "/universities": response });
    assert.ok(failed.includes('role="alert"'));
    assert.ok(failed.includes("إعادة المحاولة"));
    assert.equal(failed.includes("لا توجد جامعات منشورة"), false);
    assert.equal(failed.includes("ENOTFOUND"), false);
    assert.ok(failed.includes('id="directory-contact-title"'));
  }
});

test("Facet empty/failed states stay visible without fictional options; country failures do not remove universities", async () => {
  const empty = await render({}, { "/universities/filter-options": { majors: [], studyLevels: [], languages: [], cities: [], universityTypes: [] } });
  for (const label of ["التخصص", "المستوى الدراسي", "لغة الدراسة", "المدينة", "نوع الجامعة"]) assert.ok(empty.includes(label));
  assert.ok(empty.includes("لا توجد خيارات منشورة لهذه المعايير حالياً"));
  assert.ok(empty.includes("disabled="));
  assert.equal(empty.includes('value="medicine"'), false);
  const failed = await render({}, { "/universities/filter-options": Error("offline"), "/countries": Error("offline") });
  assert.ok(failed.includes("تعذر تحميل بعض الفلاتر"));
  assert.ok(failed.includes("جامعة منشورة 1"));
  assert.ok(failed.includes("الدولة (غير متوفر حالياً)"));
  assert.ok(failed.includes("إعادة المحاولة"));
});

test("Partial records retain location/media/type/description slots and real fields replace temporary content", async () => {
  const missing = await render({}, { "/universities": list([{ id: "unknown", slug: "unknown-university", nameAr: "جامعة مختلفة" }]) });
  for (const label of ["الدولة", "المدينة", "نوع الجامعة", "نبذة الجامعة"]) assert.ok(missing.includes(`${label} (غير متوفر حالياً)`));
  const original = await render({}, { "/universities": list([{ ...university(), slug: "university-of-warsaw", nameAr: "جامعة وارسو", universityType: null, cityAr: null }]) });
  assert.ok(original.includes("حكومية (غير متوفر حالياً)"));
  assert.ok(original.includes("وارسو (غير متوفر حالياً)"));
  const populated = await render({}, { "/universities": list([{ ...university(), slug: "university-of-warsaw", nameAr: "جامعة وارسو", city: { nameAr: "اسم المدينة الموثق" }, imageUrl: "https://example.test/campus.jpg" }]) });
  assert.ok(populated.includes("اسم المدينة الموثق"));
  assert.ok(populated.includes('src="https://example.test/campus.jpg"'));
  assert.equal(populated.includes("حكومية (غير متوفر حالياً)"), false);
  assert.equal(populated.includes("وارسو (غير متوفر حالياً)"), false);
});

test("Zero to six records retain balanced card bases and pagination redirects preserve criteria", async () => {
  for (let count = 0; count <= 6; count++) {
    const html = await render({}, { "/universities": list(Array.from({ length: count }, (_, index) => university(index))) });
    assert.equal((html.match(/href="\/universities\/real-university-/g) ?? []).length, count);
    if (count) for (const token of ["justify-center", "sm:[--card-columns:2]", "xl:[--card-columns:3]", "min-w-0"]) assert.ok(html.includes(token));
  }
  await assert.rejects(() => render({ page: "99", country: "romania", studyLevel: "BACHELORS" }, { "/universities": list([], { page: 99, total: 7, totalPages: 2 }) }), /redirect:.*country=romania.*studyLevel=BACHELORS.*page=2/);
  const { liveUniversityFilters } = loader()("lib/university-directory-data.ts");
  assert.equal(liveUniversityFilters({ level: "bachelor", type: "public", language: "english" }).studyLevel, "BACHELORS");
  assert.equal(liveUniversityFilters({ level: "bachelor", type: "public", language: "english" }).universityType, "PUBLIC");
  assert.equal(liveUniversityFilters({ major: "../bad", studyLevel: "invented" }).major, undefined);
});

test("Demo remains explicit and keeps its own filters without contacting Live facets", async () => {
  const local = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => true }, "@/lib/api-client/server-client": { serverApiClient: { get() { throw Error("Demo must not request Live endpoints"); } } } });
  const page = local("app/universities/page.tsx").default;
  const initial = renderToStaticMarkup(await page({ searchParams: Promise.resolve({}) }));
  assert.equal(initial.includes('id="related-scholarships-title"'), false);
  assert.ok(initial.includes('value="bachelor"'));
  const filtered = renderToStaticMarkup(await page({ searchParams: Promise.resolve({ major: "medicine", level: "bachelor", language: "english" }) }));
  assert.ok(filtered.includes('id="related-scholarships-title"'));
  assert.ok(filtered.includes("أمثلة تجريبية مرتبطة"));
});

function walk(node, predicate) {
  if (Array.isArray(node)) return node.flatMap((child) => walk(child, predicate));
  if (!node || typeof node !== "object") return [];
  return [...(predicate(node) ? [node] : []), ...walk(node.props?.children, predicate)];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  return typeof node === "string" ? node : node?.props ? text(node.props.children) : "";
}
test("Sidebar filters/reset/sort and mobile dialog preserve interaction and reset pagination", () => {
  const pushes = [], dialog = { opened: 0, closed: 0, showModal() { this.opened++; }, close() { this.closed++; } };
  const local = loader({ react: { ...React, useEffect() {}, useState: (initial) => [initial, () => {}], useRef: (value) => ({ current: value }) }, "next/navigation": { useRouter: () => ({ push: (href) => pushes.push(href), refresh() {} }) }, "@/components/public/university-filter-scroll-area": { UniversityFilterScrollArea: "div" } });
  const { UniversityDirectoryFilters, UniversitySort } = local("components/public/university-directory-filters.tsx");
  const values = { search: "", country: "romania", major: "medicine", sort: "newest" };
  const tree = UniversityDirectoryFilters({ values, groups: [{ key: "major", label: "التخصص", options: [["medicine", "الطب"]] }] });
  const selectors = walk(tree, (node) => node.type === "select");
  selectors[0].props.onChange({ target: { value: "engineering" } });
  assert.ok(pushes.at(-1).includes("country=romania"));
  assert.ok(pushes.at(-1).includes("major=engineering"));
  assert.equal(pushes.at(-1).includes("page="), false);
  walk(tree, (node) => node.type === "button" && text(node).includes("مسح الفلاتر"))[0].props.onClick();
  assert.equal(pushes.at(-1), "/universities");
  const modal = walk(tree, (node) => node.type === "dialog")[0]; modal.props.ref.current = dialog;
  walk(tree, (node) => node.type === "button" && text(node).includes("تصفية"))[0].props.onClick();
  assert.equal(dialog.opened, 1);
  walk(modal, (node) => node.type === "button" && node.props["aria-label"] === "إغلاق التصفية")[0].props.onClick();
  assert.equal(dialog.closed, 1);
  const sort = UniversitySort({ value: "newest", values });
  walk(sort, (node) => node.type === "select")[0].props.onChange({ target: { value: "name" } });
  assert.ok(pushes.at(-1).includes("sort=name"));
  assert.ok(pushes.at(-1).includes("major=medicine"));
});
