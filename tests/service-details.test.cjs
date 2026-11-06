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
const model = load("lib/service-details.ts");
const demo = load("lib/mocks/public-demo-content.ts");
const { demoServiceDetails } = load("lib/mocks/service-detail-fixtures.ts");
const { isDemoDetailSlug } = load("lib/mocks/public-demo-routes.ts");
const ui = {
  "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/image": ({ src, alt, className, style }) => React.createElement("img", { src, alt, className, style }),
  "next/navigation": { useRouter: () => ({ refresh() {} }), notFound: () => { throw Error("NOT_FOUND"); } },
  "@tanstack/react-query": { useInfiniteQuery: (options) => ({ data: options.initialData, isFetching: false, isError: false }) },
  "@/api/service-faq-actions": { loadServiceFaqs: async () => ({ ok: true, data: { items: [], pagination: { page: 1, limit: 5, total: 0, totalPages: 0 } } }) },
};

test("all nine existing Demo service records resolve through the guard, without invented slug aliases", async () => {
  const items = (await demo.getDemoServices({ limit: 50, sort: "manual" })).items;
  assert.equal(items.length, 9);
  for (const item of items) {
    assert.ok(isDemoDetailSlug("services", item.slug));
    assert.equal((await demo.getDemoService(item.slug)).id, item.id);
    assert.equal(model.serviceDetailHref(item), `/services/${item.slug}`);
  }
  assert.equal(isDemoDetailSlug("services", "university-admission"), false);
  assert.equal(isDemoDetailSlug("services", "not-a-service"), false);
});
test("admission image follows service identity, not a hardcoded URL slug; other records use their own media", async () => {
  const service = await demo.getDemoService("university-admissions");
  const media = model.serviceDetailMedia({ ...service, slug: "backend-owned-admission-slug" });
  assert.equal(media.src, "/images/services/university-admission-hero.png");
  assert.ok(fs.existsSync(path.resolve(__dirname, "../public", media.src.slice(1))));
  const major = await demo.getDemoService("major-selection");
  assert.equal(model.serviceDetailMedia(major), null);
  assert.deepEqual(model.serviceDetailMedia({ ...major, imageUrl: "https://media.example/major.jpg", imageAltAr: "الصورة المعتمدة" }), { src: "https://media.example/major.jpg", alt: "الصورة المعتمدة" });
  for (const imageUrl of ["javascript:alert(1)", "//untrusted.example/image", "data:image/png;base64,invalid"]) assert.equal(model.serviceDetailMedia({ ...major, imageUrl }), null);
});
test("Demo journeys differ by service, preserve actual content, and do not impose five steps/four benefits everywhere", async () => {
  const items = (await demo.getDemoServices({ limit: 50, sort: "manual" })).items;
  const admissions = demoServiceDetails(items[0]);
  assert.equal(admissions.steps.length, 5);
  assert.equal(admissions.benefits.length, 4);
  assert.equal(admissions.faqs.length, 4);
  for (const item of items) {
    const extras = demoServiceDetails(item);
    assert.ok(extras.steps.length && extras.benefits.length && extras.faqs.length);
    assert.ok(extras.faqs[0].answer.includes(item.descriptionAr));
    assert.ok(extras.faqs[0].question.includes(item.titleAr));
    if (item.id !== items[0].id) assert.notDeepEqual(extras.steps, admissions.steps);
  }
  assert.deepEqual(demoServiceDetails({ ...items[0], id: "live-id" }), model.emptyServiceExtras());
});
test("related services retain listing order, exclude the current record, deduplicate and omit unpublished entries", async () => {
  const items = (await demo.getDemoServices({ limit: 50, sort: "manual" })).items;
  const related = model.otherPublishedServices([items[0], items[1], items[1], { ...items[2], status: "DRAFT" }, items[3], items[4]], items[0]);
  assert.deepEqual(related.map((item) => item.id), [items[1].id, items[3].id, items[4].id]);
  assert.deepEqual(model.otherPublishedServices([items[0]], items[0]), []);
  assert.equal(model.publishedServiceHref(items[0].titleAr, items), "/services/university-admissions");
  assert.equal(model.publishedServiceHref(items[0].titleAr, [{ ...items[0], slug: "actual-backend-value" }]), "/services/actual-backend-value");
  assert.equal(model.publishedServiceHref(items[0].titleAr, [{ ...items[0], status: "DRAFT" }]), null);
  assert.equal(model.publishedServiceHref(items[0].titleAr, [items[0], { ...items[0], slug: "ambiguous" }]), null);
});

test("dynamic template supports every Demo service using one detail request and one bounded recommendations request", async () => {
  const items = (await demo.getDemoServices({ limit: 50, sort: "manual" })).items;
  const calls = [];
  const local = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => true },
    "@/api/public-content": { getService: async (slug) => { calls.push(slug); return demo.getDemoService(slug); }, getServices: async (params) => { assert.deepEqual(params, { limit: 4, sort: "manual" }); return demo.getDemoServices(params); } },
  });
  const Page = local("app/services/[slug]/page.tsx").default;
  for (const service of items) {
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ slug: service.slug }) }));
    assert.equal((html.match(/<h1/g) ?? []).length, 1);
    assert.ok(html.includes(service.titleAr));
    assert.ok(html.includes(service.summaryAr));
    assert.ok(html.includes(service.descriptionAr));
    assert.ok(html.includes('data-service-steps="true"') || html.includes("data-service-steps"));
    assert.equal((html.match(/<summary/g) ?? []).length, demoServiceDetails(service).faqs.length);
    assert.equal(html.includes('role="tab"'), false);
    assert.equal(html.includes("<form"), false);
    assert.equal(html.includes(`href="${model.serviceDetailHref(service)}"`), false);
  }
  assert.deepEqual(calls, items.map((item) => item.slug));
});
test("Live generic slugs use API content with no Demo steps, benefits or FAQ and render safe text paragraphs", async () => {
  const source = await demo.getDemoService("major-selection");
  const service = { ...source, id: "live-42", slug: "custom-published-service", titleAr: "خدمة منشورة جديدة", summaryAr: "ملخص المصدر", descriptionAr: "الفقرة الأولى\n\n<script>alert(1)</script>", imageUrl: null };
  let fixtureCalls = 0;
  const local = loader({ ...ui,
    "@/api/public-content": { getService: async () => service, getServices: async () => ({ items: [], pagination: { page: 1, limit: 4, total: 0, totalPages: 0 } }) },
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "@/lib/mocks/service-detail-fixtures": { demoServiceDetails: () => { fixtureCalls += 1; throw Error("must not call"); } },
  });
  const html = renderToStaticMarkup(await local("app/services/[slug]/page.tsx").default({ params: Promise.resolve({ slug: service.slug }) }));
  assert.equal(fixtureCalls, 0);
  for (const marker of ["data-service-steps", "data-service-benefits", "data-service-faq"]) assert.ok(html.includes(marker));
  assert.equal(html.includes("/university-admission-hero.png"), false);
  assert.ok(html.includes("مراحل الخدمة (غير متوفر حالياً)"));
  assert.ok(html.includes("صورة الخدمة (غير متوفر حالياً)"));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.equal(html.includes("<script>"), false);
  assert.ok(html.includes("لا توجد خدمات أخرى منشورة حاليًا"));
});
test("404 and draft responses cannot render service details, while network errors do not fabricate Demo content", async () => {
  const source = await demo.getDemoService("major-selection");
  const { ApiError } = load("api/error.ts");
  for (const getService of [async () => { throw new ApiError(404, "missing"); }, async () => ({ ...source, status: "DRAFT" })]) {
    const local = loader({ ...ui, "@/api/error": { ApiError }, "@/api/public-content": { getService } });
    await assert.rejects(local("app/services/[slug]/page.tsx").default({ params: Promise.resolve({ slug: "missing" }) }), /NOT_FOUND/);
    await assert.rejects(local("app/services/[slug]/page.tsx").generateMetadata({ params: Promise.resolve({ slug: "missing" }) }), /NOT_FOUND/);
  }
  const fail = loader({ ...ui, "@/api/public-content": { getService: async () => { throw Error("offline"); } } });
  const html = renderToStaticMarkup(await fail("app/services/[slug]/page.tsx").default({ params: Promise.resolve({ slug: "actual-slug" }) }));
  assert.ok(html.includes("تعذّر تحميل معلومات الخدمة"));
  assert.ok(html.includes("إعادة المحاولة"));
  assert.equal(html.includes("data-service-steps"), false);
});
test("metadata uses authoritative SEO fields and canonical slug without inventing claims", async () => {
  const source = await demo.getDemoService("major-selection");
  const service = { ...source, slug: "source-slug", seoTitleAr: "عنوان معتمد", seoDescriptionAr: "وصف معتمد" };
  let args;
  const local = loader({ ...ui, "@/api/public-content": { getService: async () => service }, "@/lib/seo": { createPageMetadata: (...value) => { args = value; return {}; } } });
  await local("app/services/[slug]/page.tsx").generateMetadata({ params: Promise.resolve({ slug: "source-slug" }) });
  assert.equal(args[0], service.seoTitleAr);
  assert.equal(args[1], service.seoDescriptionAr);
  assert.equal(args[2].pathname, "/services/source-slug");
});
test("hero and compact consultation keep contextual WhatsApp without a duplicate closing banner", async () => {
  const service = await demo.getDemoService("university-admissions");
  const local = loader(ui);
  const { ServiceDetails } = local("components/public/service-details.tsx");
  const html = renderToStaticMarkup(React.createElement(ServiceDetails, { service, extras: demoServiceDetails(service), related: [], relatedFailed: true, demo: true }));
  const { createWhatsappUrl } = local("lib/whatsapp.ts");
  const url = createWhatsappUrl(`مرحبًا، أود الاستفسار عن خدمة ${service.titleAr}.`);
  assert.equal(html.split(`href="${url}"`).length - 1, 2);
  assert.equal((html.match(/target="_blank" rel="noopener noreferrer"/g) ?? []).length, 2);
  assert.ok(html.includes('data-consultation-cta="contextual"'));
  assert.equal(html.includes('id="service-closing-title"'), false);
  assert.ok(html.includes('href="#about-service"'));
  assert.ok(html.includes('id="about-service" tabindex="-1"'));
  assert.ok(html.includes("يتعذر تحميل الخدمات الأخرى حاليًا"));
  assert.ok(html.includes("motion-reduce:transition-none"));
  assert.equal((html.match(/<summary/g) ?? []).length, 4);
  assert.equal((html.match(/open=""/g) ?? []).length, 1);
  assert.ok(fs.readFileSync(path.resolve(__dirname, "../components/public/service-details.tsx"), "utf8").includes("<FaqAccordion items={extras.faqs}"));
});

test("Live directory API failure shows shared retry state without static cards or fabricated slugs", async () => {
  const local = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "next/navigation": { useRouter: () => ({ refresh() {} }) }, "@/api/public-content": { getServices: async () => { throw Error("offline"); } } });
  const html = renderToStaticMarkup(await local("app/services/page.tsx").default({ searchParams: Promise.resolve({}) }));
  assert.equal((html.match(/data-service-card=/g) ?? []).length, 0);
  assert.ok(html.includes("تعذّر تحميل الخدمات"));
  assert.ok(html.includes("إعادة المحاولة"));
  assert.equal(html.includes('href="/services/university-admission"'), false);
});

const collection = (items = [], limit = 4, page = 1, total = items.length) => ({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });

test("Published service detail projections omit status safely, retain exact identity, and use real media rather than admission Demo art", async () => {
  const base = await demo.getDemoService("university-admissions");
  const raw = { ...base, status: undefined, imageUrl: "https://media.example.test/official.jpg", imageAltAr: "الصورة المعتمدة" };
  const local = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/public-content": { getService: async () => raw } });
  const parsed = await local("api/service-detail.ts").getPublishedServiceDetail(raw.slug);
  assert.equal(parsed.status, "PUBLISHED");
  assert.equal(parsed.titleAr, raw.titleAr);
  const media = local("lib/service-detail-live.ts").realServiceMedia(parsed);
  assert.equal(media.src, raw.imageUrl);
  assert.equal(local("lib/service-detail-live.ts").realServiceMedia({ ...parsed, imageUrl: null }), null);
  assert.equal(local("lib/service-detail-live.ts").realServiceMedia({ ...parsed, imageUrl: "javascript:alert(1)" }), null);
  const localUi = loader(ui);
  const html = renderToStaticMarkup(React.createElement(localUi("components/public/service-details.tsx").ServiceDetails, { service: parsed, extras: model.emptyServiceExtras(), related: [], relatedFailed: false, demo: false, liveFaq: { ok: true, data: collection([], 5) } }));
  assert.ok(html.includes(raw.imageUrl));
  assert.equal(html.includes("/images/services/university-admission-hero.png"), false);
});

test("Same-service temporary steps preserve original variable counts and never borrow from another slug or reuse directory process", async () => {
  const api = load("api/service-detail.ts");
  for (const slug of ["university-admissions", "major-selection"]) {
    const original = await demo.getDemoService(slug);
    const current = { ...original, id: "live-id", summaryAr: "", descriptionAr: "" };
    const result = api.unavailableServiceContent(current);
    const expected = demoServiceDetails(original);
    assert.equal(result.extras.steps.length, expected.steps.length);
    assert.equal(result.extras.benefits.length, expected.benefits.length);
    assert.equal(result.service.summaryAr, `${original.summaryAr} (غير متوفر حالياً)`);
    for (const step of result.extras.steps) { assert.ok(step.title.endsWith("(غير متوفر حالياً)")); assert.ok(step.description.endsWith("(غير متوفر حالياً)")); }
    const real = api.unavailableServiceContent({ ...current, summaryAr: "ملخص حقيقي", descriptionAr: "وصف حقيقي" });
    assert.equal(real.service.summaryAr, "ملخص حقيقي");
    assert.equal(real.service.descriptionAr, "وصف حقيقي");
    const unmatched = api.unavailableServiceContent({ ...current, slug: "unmatched-service" });
    assert.equal(unmatched.service.summaryAr, "ملخص الخدمة (غير متوفر حالياً)");
    assert.deepEqual(unmatched.extras.steps, [{ title: "مراحل الخدمة (غير متوفر حالياً)", description: "تفاصيل مراحل الخدمة (غير متوفر حالياً)" }]);
    assert.deepEqual(unmatched.extras.faqs, []);
  }
});

test("Invalid/unpublished/mismatched service records are rejected, and malformed alternatives are errors rather than empty content", async () => {
  let requested = 0;
  let raw = { ...(await demo.getDemoService("major-selection")), status: undefined };
  const scoped = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/public-content": { getService: async () => { requested++; return raw; } } });
  const api = scoped("api/service-detail.ts");
  for (const slug of ["../wrong", "", "Wrong", "x".repeat(121)]) await assert.rejects(api.getPublishedServiceDetail(slug), { status: 404 });
  assert.equal(requested, 0);
  for (const status of ["DRAFT", "ARCHIVED"]) { raw = { ...raw, status }; await assert.rejects(api.getPublishedServiceDetail("major-selection"), { status: 404 }); }
  raw = { ...raw, status: undefined, slug: "different-service" };
  await assert.rejects(api.getPublishedServiceDetail("major-selection"), /Invalid/);
  assert.throws(() => api.parseOtherServices({ items: [], pagination: { total: 4 } }));
  const base = { ...raw, slug: "other-service" };
  const related = api.parseOtherServices(collection([base]));
  assert.equal(model.otherPublishedServices(related.items, { id: "current", slug: "current-service" }).length, 1);
});

test("SERVICE FAQs use only the documented canonical parent and independent pages, rejecting other scopes, failures and Demo requests", async () => {
  let mode = false;
  let response = collection([{ id: "faq-one", scope: "SERVICE", questionAr: "سؤال الخدمة", answerAr: "إجابة الخدمة" }], 5);
  const calls = [];
  const scoped = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => mode }, "@/api/server-client": { serverApiClient: { get: async (url, config) => { calls.push({ url, config }); return { data: { success: true, data: response } }; } } } });
  const { loadServiceFaqs } = scoped("api/service-faq-actions.ts");
  const result = await loadServiceFaqs("actual-service");
  assert.equal(result.ok, true);
  assert.equal(result.data.items[0].question, "سؤال الخدمة");
  assert.deepEqual(calls[0], { url: "/services/actual-service/faqs", config: { params: { page: 1, limit: 5 }, timeout: 12000 } });
  response = collection([], 5);
  assert.equal((await loadServiceFaqs("actual-service")).data.pagination.total, 0);
  for (const scope of ["GLOBAL", "COUNTRY", "UNIVERSITY"]) { response = collection([{ id: "wrong", scope }], 5); assert.equal((await loadServiceFaqs("actual-service")).ok, false); }
  response = collection([], 5, 2);
  assert.equal((await loadServiceFaqs("actual-service", 2)).ok, true);
  const count = calls.length;
  assert.equal((await loadServiceFaqs("../bad")).ok, false);
  assert.equal((await loadServiceFaqs("actual-service", 0)).ok, false);
  mode = true;
  assert.equal((await loadServiceFaqs("actual-service")).ok, false);
  assert.equal(calls.length, count);
});

test("Live page isolates alternatives/FAQ failures while retaining real overview, original sections, media geometry and WhatsApp", async () => {
  const base = { ...(await demo.getDemoService("major-selection")), status: undefined, id: "live-id", imageUrl: null, descriptionAr: "الشرح الحقيقي فقط" };
  const scoped = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/public-content": { getService: async () => base, getServices: async () => { throw Error("offline alternatives"); } }, "@/api/service-faq-actions": { loadServiceFaqs: async () => ({ ok: false }) } });
  const html = renderToStaticMarkup(await scoped("app/services/[slug]/page.tsx").default({ params: Promise.resolve({ slug: base.slug }) }));
  for (const marker of ["data-service-detail-hero", "data-service-steps", "data-service-benefits", "data-service-faq", "الشرح الحقيقي فقط", "تعذّر تحميل أسئلة الخدمة", "يتعذر تحميل الخدمات الأخرى", "إعادة المحاولة", "صورة الخدمة (غير متوفر حالياً)", "md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]", "xl:grid-cols-[minmax(0,1fr)_17rem]"]) assert.ok(html.includes(marker), marker);
  assert.equal((html.match(/الشرح الحقيقي فقط/g) ?? []).length, 1, "Overview is not mined or duplicated in benefits/process");
  const { createWhatsappUrl } = scoped("lib/whatsapp.ts");
  assert.equal(html.split(`href="${createWhatsappUrl(`مرحبًا، أود الاستفسار عن خدمة ${base.titleAr}.`)}"`).length - 1, 2);
});

test("FAQ disclosure preserves empty/error/loading independently, appends pages and wires retries", () => {
  let options;
  let state;
  const scoped = loader({ ...ui, "@tanstack/react-query": { useInfiniteQuery: (value) => { options = value; return state ?? { data: value.initialData }; } } });
  const Component = scoped("components/public/service-live-faq.tsx").ServiceLiveFaq;
  const render = (initial) => renderToStaticMarkup(React.createElement(Component, { slug: "actual-service", initial }));
  assert.ok(render({ ok: true, data: collection([], 5) }).includes("لا توجد أسئلة منشورة لهذه الخدمة"));
  assert.ok(render({ ok: false }).includes("إعادة المحاولة"));
  state = { isFetching: true };
  const loading = render({ ok: false });
  assert.ok(loading.includes("جارٍ تحميل أسئلة الخدمة"));
  assert.equal(loading.includes("لا توجد أسئلة"), false);
  state = { data: { pages: [collection([{ id: "f1", question: "سؤال واحد", answer: "جواب واحد" }], 5), collection([{ id: "f1", question: "سؤال واحد", answer: "جواب واحد" }, { id: "f2", question: "سؤال ثان", answer: "جواب ثان" }], 5)] } };
  assert.equal((render({ ok: false }).match(/<summary/g) ?? []).length, 2);
  assert.equal(options.getNextPageParam(collection([], 5, 1, 11)), 2);
  assert.deepEqual(options.queryKey, ["service-detail-faq", "actual-service"]);
});
