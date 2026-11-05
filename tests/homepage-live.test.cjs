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
      if (name.endsWith(".module.css")) return new Proxy({}, { get: (_, key) => key === "__esModule" ? false : key });
      const target = name.startsWith("@/") ? path.resolve(__dirname, "..", name.slice(2)) : name.startsWith(".") ? path.resolve(path.dirname(filename), name) : null;
      if (target) for (const extension of [".tsx", ".ts"]) if (fs.existsSync(target + extension)) return load(path.relative(path.resolve(__dirname, ".."), target + extension));
      return original(name);
    };
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
    return instance.exports;
  }
  return load;
}
const ui = {
  "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
  "next/navigation": { useRouter: () => ({ refresh() {} }) },
};
const base = loader(ui);
const helpers = base("lib/homepage-data.ts");
const records = {
  countries: [{ id: "country-live", slug: "romania", nameAr: "رومانيا", introductionAr: null, imageUrl: null }],
  universities: [{ id: "university-live", slug: "live-university", nameAr: "جامعة من السجل", countryId: "country-live", cityAr: "مدينة قديمة", city: { nameAr: "مدينة من السجل" }, universityType: "PUBLIC" }],
  scholarships: [{ id: "scholarship-live", slug: "live-scholarship", titleAr: "منحة من السجل", countryId: "country-live", studyLevel: "MASTER", fundingType: null, applicationStatus: "OPEN", effectiveApplicationStatus: "CLOSED" }],
  services: [{ id: "service-live", slug: "admissions-published", titleAr: "القبول الجامعي", summaryAr: null }],
  articles: [{ id: "article-live", slug: "published-reading", titleAr: "مقال من السجل", summaryAr: null, publishedAt: "invalid-date", coverImageUrl: "javascript:alert(1)" }],
  faqs: [{ id: "faq-live", scope: "GLOBAL", questionAr: "سؤال منشور من الخادم؟", answerAr: "إجابة منشورة من الخادم." }],
};
const collection = (items) => ({ items, pagination: { page: 1, limit: 12, total: items.length, totalPages: items.length ? 1 : 0 } });
function liveLoader(overrides = {}, calls = []) {
  return loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/public-content": new Proxy({}, { get() { throw Error("Live must not load Demo content"); } }),
    "@/api/server-client": { serverApiClient: { get: async (path, config) => {
      calls.push({ path, config });
      const section = path.slice(1);
      const value = section in overrides ? overrides[section] : collection(records[section]);
      if (value instanceof Error) throw value;
      return { data: { success: true, data: value } };
    } } },
  });
}
async function home(local) { return renderToStaticMarkup(await local("app/page.tsx").default()); }

test("Live Homepage uses six bounded published endpoints, never Demo data, and preserves canonical service navigation", async () => {
  const calls = [], local = liveLoader({}, calls);
  const html = await home(local);
  assert.equal(calls.length, 6);
  assert.deepEqual(calls.map((x) => x.path), ["/countries", "/universities", "/scholarships", "/services", "/articles", "/faqs"]);
  assert.deepEqual(calls.find((x) => x.path === "/faqs").config.params, { scope: "GLOBAL", limit: 6 });
  for (const call of calls) assert.equal(call.config.timeout, 12000);
  for (const path of ["/services/admissions-published", "/universities/live-university", "/scholarships/live-scholarship", "/articles/published-reading"]) assert.ok(html.includes('href="' + path + '"'), path);
  assert.ok(html.includes("سؤال منشور من الخادم؟"));
  assert.equal(html.includes("كيف أختار الجامعة المناسبة؟"), false);
  assert.equal(html.includes("أرقام للعرض التجريبي"), false);
  assert.equal(html.includes("أرقام توضيحية"), false);
  const hero = html.match(/<section[^>]*id="intro"[\s\S]*?<\/section>/)[0];
  assert.equal((hero.match(/<strong/g) ?? []).length, 3);
  assert.equal(hero.includes("خدمات تعليمية"), false);
  assert.ok(hero.includes(">1</strong>"));
  assert.equal((hero.match(/العدد \(غير متوفر حالياً\)/g) ?? []).length, 2);
});

test("every approved section and heading stays visible with contextual empty states and no fake content", async () => {
  const empty = Object.fromEntries(Object.keys(records).map((key) => [key, collection([])]));
  const html = await home(liveLoader(empty));
  assert.ok(html.includes("لا توجد وجهات منشورة حالياً"));
  assert.ok(html.includes("لا توجد خدمات منشورة حالياً"));
  for (const id of ["destinations-title", "services-title", "universities-title", "scholarships-title", "articles-title", "home-faq-title"]) assert.equal(html.includes('id="' + id + '"'), true, id);
  for (const text of ["لا توجد جامعات مميزة حالياً", "لا توجد منح مميزة حالياً", "لا توجد مقالات منشورة حالياً", "لا توجد أسئلة شائعة منشورة حالياً"]) assert.ok(html.includes(text), text);
  assert.ok(html.includes("عرض جميع المنح"));
  assert.ok(html.includes("عرض جميع المقالات"));
  assert.equal(html.includes('role="alert"'), false);
  assert.equal(html.includes("animate-pulse"), false);
  assert.ok(html.includes('id="hero-title"'));
  assert.ok(html.includes('id="journey-title"'));
  assert.ok(html.includes('id="consultation-title"'));
  const hero = html.match(/<section[^>]*id="intro"[\s\S]*?<\/section>/)[0];
  assert.ok(hero.includes(">0</strong>"));
});

test("network, timeout, 5xx and invalid response failures are isolated with retry and no raw errors", async () => {
  for (const failure of [Error("ENOTFOUND raw network"), Error("ETIMEDOUT raw timeout"), Error("HTTP 503 stack trace"), { items: null, pagination: { total: 10 } }]) {
    const html = await home(liveLoader({ universities: failure }));
    assert.ok(html.includes("تعذّر تحميل الجامعات المميزة"));
    assert.ok(html.includes("إعادة المحاولة"));
    assert.ok(html.includes("منحة من السجل"));
    assert.ok(html.includes("مقال من السجل"));
    for (const text of ["ENOTFOUND", "ETIMEDOUT", "503", "stack trace", "undefined", "N/A"]) assert.equal(html.includes(text), false);
  }
  const allFailed = Object.fromEntries(Object.keys(records).map((key) => [key, Error("offline")]));
  const html = await home(liveLoader(allFailed));
  assert.equal((html.match(/role="alert"/g) ?? []).length, 6);
  assert.ok(html.includes('id="hero-title"'));
  assert.ok(html.includes('id="consultation-title"'));
});

test("public projections keep unavailable field slots, join country ids without N+1 and preserve authoritative status", async () => {
  const calls = [];
  const html = await home(liveLoader({}, calls));
  assert.ok(html.includes("حكومية"));
  assert.ok(html.includes("مدينة من السجل"));
  assert.ok(html.includes("رومانيا"));
  assert.ok(html.includes("ماجستير"));
  assert.ok(html.includes("التقديم مغلق"));
  assert.equal(html.includes("التقديم مفتوح"), false);
  assert.equal(html.includes("تمويل كامل"), false);
  assert.equal(html.includes("javascript:"), false);
  assert.equal(html.includes("Invalid Date"), false);
  assert.equal(calls.length, 6);
  assert.ok(html.includes("غير متوفر حالياً"));
  assert.ok(html.includes("ملخص المقال (غير متوفر حالياً)"));
  assert.equal((html.match(/data-trust-value=/g) ?? []).length, 4);
  assert.ok(html.includes('aria-label="شعار الجامعة (غير متوفر حالياً)"'));
});

test("missing card fields use approved same-record text or descriptive labels, never a neighbour's content", async () => {
  const calls = [];
  const html = await home(liveLoader({
    countries: collection([{ ...records.countries[0], slug: "turkey", nameAr: "تركيا" }]),
    universities: collection([
      { id: "warsaw", slug: "university-of-warsaw", nameAr: "جامعة وارسو", cityAr: null, universityType: null },
      { id: "unknown", slug: "unknown-university", nameAr: "جامعة أخرى" },
      { id: "different", slug: "istanbul-university", nameAr: "مؤسسة مختلفة" },
    ]),
    services: collection([{ ...records.services[0], slug: "university-admissions" }]),
    scholarships: collection([{ ...records.scholarships[0], countryId: null, studyLevel: null, applicationStatus: null, effectiveApplicationStatus: null }]),
  }, calls));
  for (const text of ["حكومية (غير متوفر حالياً)", "وارسو (غير متوفر حالياً)", "بولندا (غير متوفر حالياً)", "نوع الجامعة (غير متوفر حالياً)", "المدينة (غير متوفر حالياً)", "الدولة (غير متوفر حالياً)", "استكشف الدراسة والجامعات في تركيا (غير متوفر حالياً)", "مساعدتك في القبول والتسجيل (غير متوفر حالياً)", "نوع التمويل (غير متوفر حالياً)", "المرحلة الدراسية (غير متوفر حالياً)", "حالة التقديم (غير متوفر حالياً)", "دولة المنحة (غير متوفر حالياً)", "تاريخ النشر (غير متوفر حالياً)", "الصورة (غير متوفر حالياً)"]) assert.ok(html.includes(text), text);
  assert.equal(html.includes("إسطنبول (غير متوفر حالياً)"), false);
  assert.equal(calls.length, 6);
  const { homeCardText, approvedHomeCardCopy } = base("lib/homepage-card-content.ts");
  assert.equal(approvedHomeCardCopy("universities", "university-of-warsaw", "جامعة أخرى"), undefined);
  assert.equal(approvedHomeCardCopy("universities", "unknown", "جامعة وارسو"), undefined);
  assert.equal(approvedHomeCardCopy("universities", "constructor", "جامعة أخرى"), undefined);
  assert.equal(homeCardText(" خاصة ", "نوع الجامعة", "حكومية"), "خاصة");
  assert.equal(homeCardText(" ", "نوع الجامعة"), "نوع الجامعة (غير متوفر حالياً)");
  const populated = await home(liveLoader({
    universities: collection([{ id: "warsaw", slug: "university-of-warsaw", nameAr: "جامعة وارسو", cityAr: "مدينة حقيقية", universityType: "PRIVATE", country: { slug: "poland", nameAr: "دولة حقيقية" } }]),
    services: collection([{ ...records.services[0], slug: "university-admissions", summaryAr: "وصف حقيقي" }]),
  }));
  for (const text of ["مدينة حقيقية", "دولة حقيقية", "وصف حقيقي", "خاصة"]) assert.ok(populated.includes(text));
  for (const text of ["حكومية (غير متوفر حالياً)", "وارسو (غير متوفر حالياً)", "مساعدتك في القبول والتسجيل (غير متوفر حالياً)"]) assert.equal(populated.includes(text), false);
});

test("Live Journey restores approved editorial copy, marks only missing steps and preserves real-value priority", async () => {
  const calls = [];
  const html = await home(liveLoader({}, calls));
  const journey = html.match(/<section[^>]*aria-labelledby="journey-title"[^>]*>([\s\S]*?)<\/section>/)[1];
  assert.equal(calls.length, 6);
  assert.equal((journey.match(/<li/g) ?? []).length, 4);
  for (const number of ["01", "02", "03", "04"]) assert.ok(journey.includes(number));
  for (const token of ["journey-background.png", "lg:grid-cols-4", "md:grid-cols-2", "rounded-full", "border-s", "md:border-t"]) assert.ok(journey.includes(token));
  assert.equal((journey.match(/\(غير متوفر حالياً\)/g) ?? []).length, 8);
  for (const text of ["رحلتك الدراسية", "خطوات الرحلة", "اختيار الوجهة", "اختيار الجامعة", "تقديم الطلب", "بدء الرحلة", "حدّد ما يناسب", "نرتّب الخيارات بوضوح"]) assert.ok(journey.includes(text), text);
  assert.equal(journey.includes("رحلتك الدراسية (غير متوفر حالياً)"), false);
  assert.equal(journey.includes("خطوات الرحلة (غير متوفر حالياً)"), false);
  const { getHomeJourney } = base("lib/homepage-journey.ts");
  const partial = getHomeJourney(false, { title: "عنوان حقيقي", steps: [{ title: "خطوة حقيقية" }] });
  assert.equal(partial.title, "عنوان حقيقي");
  assert.equal(partial.steps.length, 4);
  assert.equal(partial.steps[0].title, "خطوة حقيقية");
  assert.equal(partial.steps[0].description, "حدّد ما يناسب خطتك الدراسية. (غير متوفر حالياً)");
  assert.equal(partial.steps[3].title, "بدء الرحلة (غير متوفر حالياً)");
  const approved = base("lib/homepage-content.ts").approvedHomeJourney;
  const populated = getHomeJourney(false, approved);
  assert.equal(JSON.stringify(populated).includes("غير متوفر حالياً"), false);
  const demo = getHomeJourney(true);
  assert.equal(JSON.stringify(demo).includes("غير متوفر حالياً"), false);
  const whitespace = getHomeJourney(false, { steps: [{ title: "  ", description: "وصف حقيقي" }] });
  assert.equal(whitespace.steps[0].title, "اختيار الوجهة (غير متوفر حالياً)");
  assert.equal(whitespace.steps[0].description, "وصف حقيقي");
});

test("essential-invalid records cannot crash a section, partial records remain and malformed collections differ from empty", async () => {
  const mixed = collection([records.countries[0], { ...records.countries[0], id: "bad", slug: "../invalid", nameAr: "bad" }, null]);
  const state = helpers.parseHomeList("countries", mixed);
  assert.equal(state.kind, "partial");
  assert.equal(state.invalidRecords, 2);
  assert.equal(state.items.length, 1);
  const html = await home(liveLoader({ countries: mixed }));
  assert.ok(html.includes("/study-abroad/romania"));
  assert.equal(html.includes("../invalid"), false);
  const unusable = await home(liveLoader({ countries: collection([{ id: "invalid", slug: "missing-name" }]) }));
  assert.ok(unusable.includes("تعذّر تحميل الوجهات الدراسية"));
  assert.equal(unusable.includes("لا توجد وجهات منشورة"), false);
  for (const value of [null, {}, { items: [], pagination: null }, { items: [], pagination: { total: -1 } }, { items: [], pagination: { total: 3 } }]) assert.throws(() => helpers.parseHomeList("countries", value));
});

test("FAQ scope and essential text are validated; successful empty FAQs never revive static questions", async () => {
  const result = helpers.parseHomeList("faqs", collection([records.faqs[0], { ...records.faqs[0], id: "country-faq", scope: "COUNTRY" }, { ...records.faqs[0], id: "empty-answer", answerAr: "" }]));
  assert.equal(result.items.length, 1);
  assert.equal(result.kind, "partial");
  const empty = await home(liveLoader({ faqs: collection([]) }));
  assert.ok(empty.includes("home-faq-title"));
  assert.ok(empty.includes("لا توجد أسئلة شائعة منشورة حالياً"));
  assert.equal(empty.includes("كيف أختار الجامعة المناسبة؟"), false);
});

test("media rejects unsafe URLs, unavailable optional labels are omitted and code labels do not invent facts", () => {
  for (const value of [undefined, "", "javascript:alert(1)", "data:image/png,unsafe", "https://user:secret@example.test/image.jpg"]) assert.equal(helpers.homeImageUrl(value), undefined);
  assert.equal(helpers.homeImageUrl("/images/local.png"), "/images/local.png");
  assert.equal(helpers.homeMetadataLabel(null), undefined);
  assert.equal(helpers.homeMetadataLabel("UNKNOWN_INTERNAL_CODE"), undefined);
  assert.equal(helpers.homeMetadataLabel("GOVERNMENT_FUNDED"), "تمويل حكومي");
  assert.equal(helpers.homeMetadataLabel("وصف التمويل المنشور"), "وصف التمويل المنشور");
});

test("shared EmptyState and ErrorState support compact/section layouts, custom actions and an accessible retry callback", () => {
  const { EmptyState, ErrorState } = base("components/ui/content-state.tsx");
  const empty = renderToStaticMarkup(React.createElement(EmptyState, { title: "لا توجد نتائج", description: "شرح", variant: "section", icon: React.createElement("svg"), action: React.createElement("a", { href: "/study-abroad" }, "استكشف") }));
  assert.ok(empty.includes("sm:p-8"));
  assert.ok(empty.includes('dir="rtl"'));
  assert.ok(empty.includes('href="/study-abroad"'));
  assert.equal(empty.includes('role="alert"'), false);
  let retries = 0;
  const state = ErrorState({ title: "تعذر التحميل", description: "حاول مجددًا", onRetry: () => { retries++; } });
  state.props.action.props.children[0].props.onClick();
  assert.equal(retries, 1);
  const error = renderToStaticMarkup(React.createElement(ErrorState, { title: "تعذر التحميل", description: "حاول مجددًا", retrying: true, onRetry() {} }));
  assert.ok(error.includes('role="alert"'));
  assert.ok(error.includes('disabled=""'));
  assert.ok(error.includes("جارٍ إعادة المحاولة"));
});

test("failed content images keep their geometry and recover when a new source is supplied", () => {
  let failed = null;
  const local = loader({ react: { ...React, useState: () => [failed, (value) => { failed = value; }] } });
  const { HomeImage } = local("components/home/home-image.tsx");
  let view = HomeImage({ src: "/missing.jpg", className: "absolute inset-0" });
  assert.equal(view.type, "img");
  view.props.onError();
  view = HomeImage({ src: "/missing.jpg", className: "absolute inset-0" });
  assert.equal(view.type, "div");
  assert.ok(view.props.className.includes("h-full w-full"));
  assert.equal(HomeImage({ src: "/new-image.jpg" }).type, "img");
});

// Allows one explicit, read-only seeded-Live verification through the real page renderer.
module.exports = { loader, ui, home };

