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
  "next/navigation": { useSearchParams: () => new URLSearchParams(), useRouter: () => ({ refresh() {} }), notFound: () => { throw Error("NOT_FOUND"); } },
  "@tanstack/react-query": { useInfiniteQuery: (options) => ({ data: options.initialData, isPending: false, isError: false, hasNextPage: false }), useQuery: (options) => ({ data: options.initialData, isPending: false, isError: false }) },
};
test("shared page structure has one scholarship section and FAQ outside all panels; Live does not substitute Demo data", async () => {
  const university = await demo.getDemoUniversity("university-bucharest");
  const initial = await demo.getDemoScholarships({ university: university.slug, limit: 3 });
  for (const demoMode of [true, false]) {
    const local = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => demoMode }, "@/api/public-content": { getUniversity: async () => university }, "@/api/university-detail-actions": {
      loadUniversityScholarships: async () => ({ ok: true, data: initial }),
      loadUniversityPrograms: async () => ({ ok: true, data: { items: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } } }),
      loadUniversityAdmissions: async () => ({ ok: true, data: [] }), loadUniversityGallery: async () => ({ ok: true, data: [] }),
      loadUniversityFaqs: async () => ({ ok: true, data: { items: [], pagination: { page: 1, limit: 5, total: 0, totalPages: 0 } } }),
    } });
    const page = await local("app/universities/[slug]/page.tsx").default({ params: Promise.resolve({ slug: university.slug }) });
    const html = renderToStaticMarkup(page);
    assert.equal((html.match(/role="tab"/g) ?? []).length, 4);
    assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 4);
    assert.ok(html.includes('aria-selected="true" aria-controls="university-panel-overview"'));
    assert.equal((html.match(/data-university-scholarships/g) ?? []).length, 1);
    assert.ok(html.indexOf("data-university-scholarships") > html.indexOf('id="university-panel-gallery"'));
    assert.equal(html.includes("معلومات أساسية"), false);
    assert.equal(html.includes("نبذة سريعة عن الجامعة"), false);
    assert.equal((html.match(/data-university-faq/g) ?? []).length, 1);
    if (demoMode) assert.ok(html.indexOf("data-university-faq") > html.indexOf("data-university-scholarships"));
    else { assert.equal(html.includes("تخصصات ورسوم خيالية"), false); assert.ok(html.includes("لا تتوفر حاليًا بيانات منشورة عن التخصصات")); }
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
  const home = renderToStaticMarkup(React.createElement(local("components/home/home-faq.tsx").HomeFaq, { questions: local("lib/mocks/home-faq.ts").demoHomeQuestions }));
  assert.equal((home.match(/<summary/g) ?? []).length, 6);
  assert.ok(home.includes("كيف أختار الجامعة المناسبة؟"));
});

test("related scholarship component preserves successful empty section, isolates failures, and wires paginated appends", async () => {
  const university = await demo.getDemoUniversity("university-bucharest");
  const sample = (await demo.getDemoScholarships({ university: university.slug, limit: 3 })).items[0];
  const items = Array.from({ length: 7 }, (_, index) => ({ ...sample, id: `item-${index}`, slug: `test-${index}` }));
  const pages = [1, 2, 3].map((page) => ({ items: items.slice((page - 1) * 3, page * 3), pagination: { page, limit: 3, total: 7, totalPages: 3 } }));
  const props = { id: university.id, slug: university.slug, demo: true, initial: null };
  let options;
  let state = { isPending: true, isFetching: true };
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
  assert.ok(render().includes("لا توجد منح مرتبطة منشورة حالياً"));
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

const livePage = (items = [], limit = 12, page = 1, total = items.length) => ({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
const programRecord = { id: "p1", nameAr: "برنامج منشور", nameEn: null, facultyNameAr: "كلية العلوم", studyLevel: "BACHELORS", languages: ["ENGLISH", "ARABIC"], durationValue: 4, durationUnit: "YEARS", tuition: { amount: "0.00", currency: "EUR", billingPeriod: "YEAR", academicYear: "2026/2027" }, tuitionFees: [{ amount: "2500.00", currency: "EUR", billingPeriod: "SEMESTER", academicYear: "2025/2026" }] };

test("Live detail validates exact identity, published projection, optional media, safe links and real country lookup", async () => {
  const base = await demo.getDemoUniversity("university-bucharest");
  const record = { ...base, status: undefined, country: undefined, cityId: "city-1", city: { id: "city-1", nameAr: "مدينة موثقة" }, overviewAr: null, imageUrl: "javascript:alert(1)", officialWebsite: "javascript:alert(1)" };
  const countries = [];
  const local = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/public-content": {
    getUniversity: async () => record, getCountries: async (params) => { countries.push(params); return { items: [base.country] }; },
  } });
  const result = await local("api/university-detail.ts").getUniversityDetail(base.slug);
  assert.equal(result.country.id, base.countryId);
  assert.equal(result.cityAr, "مدينة موثقة");
  assert.equal(result.imageUrl, null);
  assert.equal(result.officialWebsite, null);
  assert.equal(result.overviewAr, "");
  assert.deepEqual(countries, [{ limit: 50, sort: "manual" }]);
  const parse = local("lib/university-detail-live.ts").parseDetailUniversity;
  assert.throws(() => parse({ ...record, slug: "other" }, base.slug));
  assert.throws(() => parse({ ...record, status: "DRAFT" }, base.slug));
  assert.equal(parse({ ...record, city: { id: "wrong", nameAr: "wrong" } }, base.slug).cityAr, base.cityAr);
  for (const value of ["DRAFT", "ARCHIVED"]) {
    const scoped = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/public-content": { getUniversity: async () => ({ ...base, status: value }) } });
    await assert.rejects(scoped("api/university-detail.ts").getUniversityDetail(base.slug), { status: 404 });
  }
  await assert.rejects(local("api/university-detail.ts").getUniversityDetail("../invalid"), { status: 404 });
  const noLookup = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/public-content": { getUniversity: async () => base, getCountries: () => { throw Error("unexpected supplementary request"); } } });
  assert.equal((await noLookup("api/university-detail.ts").getUniversityDetail(base.slug)).country.id, base.countryId);
});

test("Live programs map exact names, multiple languages, zero and historical tuition without invented duration or fees", () => {
  const live = load("lib/university-detail-live.ts");
  const parsed = live.parseDetailPrograms(livePage([programRecord]));
  assert.equal(parsed.items[0].name, programRecord.nameAr);
  assert.equal(parsed.items[0].language, "الإنجليزية، العربية");
  assert.equal(parsed.items[0].tuition.amount, 0);
  assert.equal(parsed.items[0].tuition.period, "سنوياً");
  assert.equal(parsed.items[0].tuitionHistory[0].academicYear, "2025/2026");
  const partial = live.parseDetailPrograms(livePage([{ id: "partial" }])).items[0];
  for (const field of ["name", "faculty", "level", "language", "duration"]) assert.ok(partial[field].includes("(غير متوفر حالياً)"));
  assert.equal(partial.tuition, null);
  assert.throws(() => live.parseDetailPrograms(livePage([{ ...programRecord, status: "DRAFT" }])));
  assert.throws(() => live.parseDetailPrograms({ items: [], pagination: { page: 1, limit: 12, total: 10, totalPages: 1 } }));
  assert.deepEqual(live.parseDetailPrograms(livePage()).items, []);
  const uiLocal = loader(ui);
  const html = renderToStaticMarkup(React.createElement(uiLocal("components/public/university-programs.tsx").UniversityPrograms, { programs: parsed.items, university: "الجامعة", demo: false }));
  assert.ok(html.includes("2025/2026"));
  assert.ok(html.includes("2026/2027"));
  assert.ok(html.includes("table-fixed"));
  assert.ok(html.includes("data-program-cards"));
  assert.ok(html.includes("data-balanced-cards"));
  assert.equal(html.includes("خيالية"), false);
});

test("Live admission scopes stay distinct; gallery has its own source; FAQs reject GLOBAL and other scopes", () => {
  const live = load("lib/university-detail-live.ts");
  const admissions = live.parseDetailAdmissions({ university: [{ id: "a1", scope: "UNIVERSITY", contentAr: "شرط عام" }], studyLevels: [{ id: "a2", scope: "STUDY_LEVEL", studyLevel: "MASTERS", contentAr: "شرط مرحلة" }], programs: [{ id: "a3", scope: "PROGRAM", programId: "p1", program: { id: "p1", nameAr: "برنامج محدد" }, contentAr: "شرط برنامج" }] });
  assert.deepEqual(admissions.map((item) => item.content), ["شرط عام", "شرط مرحلة", "شرط برنامج"]);
  assert.ok(admissions[1].label.includes("ماجستير"));
  assert.ok(admissions[2].label.includes("برنامج محدد"));
  assert.throws(() => live.parseDetailAdmissions({ university: [{ id: "bad", scope: "PROGRAM" }], studyLevels: [], programs: [] }));
  assert.deepEqual(live.parseDetailGallery({ items: [] }), []);
  assert.equal(live.parseDetailGallery({ items: [{ id: "g1", imageUrl: null }] })[0].src, null);
  const faq = { id: "f1", scope: "UNIVERSITY", questionAr: "سؤال الجامعة", answerAr: "إجابة الجامعة" };
  assert.equal(live.parseDetailFaqs(livePage([faq], 5)).items[0].question, "سؤال الجامعة");
  for (const scope of ["GLOBAL", "COUNTRY", "SERVICE"]) assert.throws(() => live.parseDetailFaqs(livePage([{ ...faq, scope }], 5)));
});

test("Live collection bridges use only documented parent paths and server-side filters/pages; failures and Demo stay isolated", async () => {
  let demoMode = false;
  const calls = [];
  const local = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => demoMode }, "@/api/server-client": { serverApiClient: { get: async (url, config) => {
    calls.push({ url, config });
    let data;
    if (url.endsWith("/programs")) data = livePage([programRecord], 12, config.params.page, 25);
    else if (url.endsWith("/faqs")) data = livePage([], 5);
    else if (url.endsWith("/gallery")) throw Error("gallery offline");
    else data = { university: [], studyLevels: [], programs: [] };
    return { data: { success: true, data } };
  } } } });
  const api = local("api/university-detail-actions.ts");
  const programs = await api.loadUniversityPrograms("one-university", { search: "  الطب  ", studyLevel: "BACHELORS", language: "ENGLISH", faculty: "الطب", universityId: "ignored" }, 2);
  assert.equal(programs.ok, true);
  assert.deepEqual(calls[0], { url: "/universities/one-university/programs", config: { params: { page: 2, limit: 12, search: "الطب", faculty: "الطب", studyLevel: "BACHELORS", language: "ENGLISH" }, timeout: 12000 } });
  assert.equal((await api.loadUniversityGallery("one-university")).ok, false);
  assert.equal((await api.loadUniversityAdmissions("one-university")).ok, true);
  assert.equal((await api.loadUniversityFaqs("one-university")).ok, true);
  assert.equal(calls[3].url, "/universities/one-university/faqs");
  assert.deepEqual(calls[3].config.params, { page: 1, limit: 5 });
  const count = calls.length;
  assert.equal((await api.loadUniversityPrograms("one-university", { language: "invented" })).ok, false);
  assert.equal((await api.loadUniversityPrograms("../wrong")).ok, false);
  assert.equal((await api.loadUniversityFaqs("one-university", 0)).ok, false);
  demoMode = true;
  assert.equal((await api.loadUniversityPrograms("one-university")).ok, false);
  assert.equal((await api.loadUniversityAdmissions("one-university")).ok, false);
  assert.equal(calls.length, count);
});

test("Live university page isolates failed requests and keeps every approved tab and FAQ mounted", async () => {
  const university = { ...(await demo.getDemoUniversity("university-bucharest")), country: undefined, status: undefined, imageUrl: null, cityAr: null, overviewAr: null };
  const local = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/public-content": { getUniversity: async () => university }, "@/api/university-detail-actions": {
    loadUniversityScholarships: async () => ({ ok: false }), loadUniversityPrograms: async () => ({ ok: false }),
    loadUniversityAdmissions: async () => ({ ok: false }), loadUniversityGallery: async () => ({ ok: false }), loadUniversityFaqs: async () => ({ ok: false }),
  } });
  const page = await local("app/universities/[slug]/page.tsx").default({ params: Promise.resolve({ slug: university.slug }) });
  const html = renderToStaticMarkup(page);
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 4);
  for (const label of ["تعذّر تحميل التخصصات", "تعذّر تحميل شروط القبول", "تعذّر تحميل صور الجامعة", "تعذّر تحميل أسئلة الجامعة", "تعذّر تحميل المنح المرتبطة", "رومانيا (غير متوفر حالياً)", "بوخارست (غير متوفر حالياً)"]) assert.ok(html.includes(label), label);
  assert.equal(html.includes("تخصصات ورسوم خيالية"), false);
  assert.equal(html.includes("لا توجد منح مرتبطة منشورة"), false);
  assert.ok(html.includes("رسم أكاديمي توضيحي، وليس صورة للحرم الجامعي"));
  assert.ok(html.includes("شعار جامعة بوخارست (غير متوفر حالياً)"));
  const { ApiError } = load("api/error.ts");
  for (const status of [404, 500]) {
    const broken = loader({ ...ui, "@/api/university-detail": { getUniversityDetail: async () => { throw new ApiError(status, "test"); } }, "@/api/error": { ApiError } });
    const render = () => broken("app/universities/[slug]/page.tsx").default({ params: Promise.resolve({ slug: university.slug }) });
    if (status === 404) await assert.rejects(render, /NOT_FOUND/);
    else assert.ok(renderToStaticMarkup(await render()).includes("تعذّر تحميل معلومات الجامعة"));
  }
});

test("Live collections retry independently and server program results are not locally re-filtered", () => {
  const captures = [];
  let state;
  const local = loader({ ...ui, "@tanstack/react-query": { useQuery: (options) => { captures.push(options); return state ?? { data: options.initialData }; }, useInfiniteQuery: (options) => { captures.push(options); return state ?? { data: options.initialData, hasNextPage: false }; } } });
  const components = local("components/public/university-live-content.tsx");
  for (const [name, title] of [["LiveUniversityAdmissions", "شروط القبول"], ["LiveUniversityGallery", "صور الجامعة"], ["LiveUniversityFaqs", "أسئلة الجامعة"]]) {
    state = { isFetching: false };
    const failed = renderToStaticMarkup(React.createElement(components[name], { slug: "one-university", initial: { ok: false } }));
    assert.ok(failed.includes("تعذّر تحميل"), title);
    assert.ok(failed.includes("إعادة المحاولة"));
    assert.equal(failed.includes("لا توجد"), false);
    state = { isFetching: true };
    const pending = renderToStaticMarkup(React.createElement(components[name], { slug: "one-university", initial: { ok: false } }));
    assert.ok(pending.includes("جارٍ تحميل"));
    assert.equal(pending.includes("لا توجد"), false);
  }
  state = undefined;
  const faq = renderToStaticMarkup(React.createElement(components.LiveUniversityFaqs, { slug: "one-university", initial: { ok: true, data: livePage([{ id: "f1", question: "سؤال خاص", answer: "جواب خاص" }], 5) } }));
  assert.ok(faq.includes("<summary"));
  const options = captures.at(-1);
  assert.deepEqual(options.queryKey, ["university-detail-faqs", "one-university"]);
  assert.equal(options.getNextPageParam(livePage([], 5, 1, 11)), 2);
  const mapped = load("lib/university-detail-live.ts").parseDetailPrograms(livePage([programRecord])).items;
  const view = renderToStaticMarkup(React.createElement(local("components/public/university-programs.tsx").UniversityPrograms, { programs: mapped, university: "الجامعة", demo: false, server: { filters: { search: "Backend localized match", level: "", language: "", faculty: "" }, onFilters() {}, total: 25 } }));
  assert.ok(view.includes("برنامج منشور"));
  assert.ok(view.includes("25 تخصص في النتائج"));
});

test("academic UI uses specializations while scholarship terminology and Backend-managed degree names stay intact", () => {
  for (const file of ["components/public/university-programs.tsx", "components/public/university-live-content.tsx", "lib/university-detail-live.ts", "lib/country-detail-content.ts", "lib/mocks/university-detail-fixtures.ts", "lib/mocks/country-details-fixtures.ts", "lib/mocks/service-detail-fixtures.ts", "lib/mocks/article-detail-fixtures.ts", "lib/mocks/home-faq.ts", "lib/mocks/public-demo-content.ts"]) {
    assert.doesNotMatch(fs.readFileSync(path.resolve(__dirname, "..", file), "utf8"), /برامج|برنامج/u, file);
  }
  const hero = fs.readFileSync(path.resolve(__dirname, "../components/home/home-hero.tsx"), "utf8");
  assert.ok(hero.includes("منح وبرامج"));
  const scholarship = fs.readFileSync(path.resolve(__dirname, "../lib/mocks/scholarship-detail-fixtures.ts"), "utf8");
  assert.ok(scholarship.includes("متطلبات البرنامج"));
  const live = load("lib/university-detail-live.ts");
  const row = { ...programRecord, nameAr: "برنامج بكالوريوس الطب", tuition: { ...programRecord.tuition, billingPeriod: "FULL_PROGRAM" } };
  const mapped = live.parseDetailPrograms(livePage([row])).items[0];
  assert.equal(mapped.name, row.nameAr, "Never rewrite Backend editorial content at runtime");
  assert.equal(mapped.tuition.period, "لكامل مدة التخصص");
  assert.equal(live.parseDetailPrograms(livePage([{ id: "partial" }])).items[0].name, "اسم التخصص (غير متوفر حالياً)");
  const source = fs.readFileSync(path.resolve(__dirname, "../api/university-detail-actions.ts"), "utf8");
  assert.ok(source.includes('"programs"'));
  assert.ok(source.includes("getScholarships({ university: slug"));
});
