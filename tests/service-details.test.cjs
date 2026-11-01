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
  "next/navigation": { notFound: () => { throw Error("NOT_FOUND"); } },
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
    "@/api/public-content": { getService: async () => service, getServices: async () => ({ items: [] }) },
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "@/lib/mocks/service-detail-fixtures": { demoServiceDetails: () => { fixtureCalls += 1; throw Error("must not call"); } },
  });
  const html = renderToStaticMarkup(await local("app/services/[slug]/page.tsx").default({ params: Promise.resolve({ slug: service.slug }) }));
  assert.equal(fixtureCalls, 0);
  for (const marker of ["data-service-steps", "data-service-benefits", "data-service-faq", "/university-admission-hero.png"]) assert.equal(html.includes(marker), false);
  assert.ok(html.includes("رسم توضيحي لخدمة خدمة منشورة جديدة"));
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
  assert.ok(html.includes("يتعذر تحميل المحتوى حاليًا"));
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
test("all three WhatsApp CTAs use the official helper and current service, and FAQ reuses Homepage disclosure styling", async () => {
  const service = await demo.getDemoService("university-admissions");
  const local = loader(ui);
  const { ServiceDetails } = local("components/public/service-details.tsx");
  const html = renderToStaticMarkup(React.createElement(ServiceDetails, { service, extras: demoServiceDetails(service), related: [], relatedFailed: true, demo: true }));
  const { createWhatsappUrl } = local("lib/whatsapp.ts");
  const url = createWhatsappUrl(`مرحبًا، أود الاستفسار عن خدمة ${service.titleAr}.`);
  assert.equal(html.split(`href="${url}"`).length - 1, 3);
  assert.equal((html.match(/target="_blank" rel="noopener noreferrer"/g) ?? []).length, 3);
  assert.ok(html.includes('href="#about-service"'));
  assert.ok(html.includes('id="about-service" tabindex="-1"'));
  assert.ok(html.includes("يتعذر تحميل الخدمات الأخرى حاليًا"));
  assert.ok(html.includes("motion-reduce:transition-none"));
  assert.equal((html.match(/<summary/g) ?? []).length, 4);
  assert.equal((html.match(/open=""/g) ?? []).length, 1);
  assert.ok(fs.readFileSync(path.resolve(__dirname, "../components/public/service-details.tsx"), "utf8").includes("<FaqAccordion items={extras.faqs}"));
});

test("directory API failure keeps pending CTAs honest without activating planned or fabricated slugs", async () => {
  const local = loader({ ...ui, "@/api/public-content": { getServices: async () => { throw Error("offline"); } } });
  const html = renderToStaticMarkup(await local("app/services/page.tsx").default());
  assert.equal((html.match(/disabled=""/g) ?? []).length, 5);
  assert.equal((html.match(/التفاصيل غير متاحة بعد/g) ?? []).length, 5);
  assert.equal(html.includes('href="/services/university-admission"'), false);
});
