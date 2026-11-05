/* eslint-disable @typescript-eslint/no-require-imports -- Render the route with isolated Next.js runtime boundaries. */
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

const { getDemoCountries } = loader()("lib/mocks/public-demo-content.ts");
function page(getCountries = getDemoCountries) {
  return loader({
    "next/link": ({ scroll, ...props }) => { void scroll; return React.createElement("a", props); },
    "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
    "next/navigation": { useRouter: () => ({ push() {} }), redirect: (href) => { throw Error(`redirect:${href}`); } },
    "@/api/public-content": { getCountries },
  })("app/study-abroad/page.tsx").default;
}
async function render(search = {}, getCountries) {
  return renderToStaticMarkup(await page(getCountries)({ searchParams: Promise.resolve(search) }));
}

async function liveRender(payload, search = {}, calls = []) {
  const local = loader({
    "next/link": ({ scroll, ...props }) => { void scroll; return React.createElement("a", props); },
    "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
    "next/navigation": { useRouter: () => ({ push() {} }), redirect: (href) => { throw Error(`redirect:${href}`); } },
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "@/lib/mocks/public-demo-content": new Proxy({}, { get() { throw Error("Live must never call Demo fixtures"); } }),
    "@/api/server-client": { serverApiClient: { get: async (path, config) => {
      calls.push({ path, config });
      if (payload instanceof Error) throw payload;
      return { data: { success: true, data: payload } };
    } } },
  });
  return renderToStaticMarkup(await local("app/study-abroad/page.tsx").default({ searchParams: Promise.resolve(search) }));
}
const liveCountry = (index) => ({ id: `live-${index}`, slug: `live-country-${index}`, nameAr: `وجهة حقيقية ${index}`, featured: false, introductionAr: "وصف منشور", imageUrl: null, imageAltAr: null });
const liveCollection = (items, pagination = {}) => ({ items, pagination: { page: 1, limit: 6, total: items.length, totalPages: Math.ceil(items.length / 6), ...pagination } });

test("Live uses the existing Countries client, preserves all filters and never activates Demo after failure", async () => {
  const calls = [];
  const html = await liveRender(liveCollection([liveCountry(1)]), { search: "وجهة", featured: "true", sort: "newest", page: "1" }, calls);
  assert.deepEqual(calls, [{ path: "/countries", config: { params: { search: "وجهة", featured: "true", sort: "newest", page: 1, limit: 6 } } }]);
  assert.ok(html.includes("وجهة حقيقية 1"));
  assert.ok(html.includes("/study-abroad/live-country-1"));
  assert.equal(html.includes("عرض تجريبي"), false);
  for (const failure of [Error("ENOTFOUND raw"), Error("ETIMEDOUT raw"), Error("HTTP 503 raw"), null, {}, { items: null }, liveCollection([null]), liveCollection([{ ...liveCountry(1), slug: "../bad" }]), liveCollection([{ ...liveCountry(1), status: "DRAFT" }])]) {
    const failed = await liveRender(failure);
    assert.ok(failed.includes('role="alert"'));
    assert.ok(failed.includes("إعادة المحاولة"));
    assert.equal(failed.includes("لا توجد وجهات منشورة حالياً"), false);
    assert.equal(failed.includes("ENOTFOUND"), false);
    assert.equal(failed.includes("<article"), false);
    assert.ok(failed.includes('id="destinations-title"'));
    assert.ok(failed.includes("طموحك يتجاوز القارات؟"));
  }
});

test("Live public projections retain partial fields, neutral media and approved same-country temporary copy", async () => {
  const html = await liveRender(liveCollection([
    { id: "turkey", slug: "turkey", nameAr: "تركيا", featured: true, introductionAr: null, imageUrl: "javascript:alert(1)" },
    { id: "different", slug: "malaysia", nameAr: "اسم مختلف", introductionAr: "", imageUrl: null },
    { id: "real", slug: "cyprus", nameAr: "قبرص", introductionAr: "مقدمة حقيقية", imageUrl: "https://example.test/real.jpg", imageAltAr: "وصف الصورة الحقيقي" },
  ]));
  assert.ok(html.includes("استكشف الدراسة والجامعات في تركيا (غير متوفر حالياً)"));
  assert.ok(html.includes("وصف الوجهة (غير متوفر حالياً)"));
  assert.equal(html.includes("تعرّف على خيارات الدراسة في ماليزيا"), false);
  assert.ok(html.includes("مقدمة حقيقية"));
  assert.equal(html.includes("اطّلع على خيارات الدراسة في قبرص (غير متوفر حالياً)"), false);
  assert.ok(html.includes('src="https://example.test/real.jpg"'));
  assert.ok(html.includes('alt="وصف الصورة الحقيقي"'));
  assert.ok(html.includes("صورة الوجهة (غير متوفر حالياً)"));
  assert.ok(html.includes("وجهة مميزة"));
  assert.equal(html.includes("javascript:"), false);
});

test("Zero to six Live records retain approved balanced grid, media proportions, flags, links and section states", async () => {
  for (let count = 0; count <= 6; count++) {
    const html = await liveRender(liveCollection(Array.from({ length: count }, (_, index) => liveCountry(index))));
    assert.equal((html.match(/<article\b/g) ?? []).length, count);
    assert.ok(html.includes('id="destination-results"'));
    if (!count) {
      assert.ok(html.includes("لا توجد وجهات منشورة حالياً"));
      assert.equal(html.includes('role="alert"'), false);
    } else {
      for (const token of ["justify-center", "md:[--card-columns:2]", "lg:[--card-columns:3]", "aspect-[16/9]", "min-w-0", "علم الدولة (غير متوفر حالياً)"]) assert.ok(html.includes(token), token);
    }
  }
  const filteredEmpty = await liveRender(liveCollection([]), { search: "missing" });
  assert.ok(filteredEmpty.includes("لا توجد وجهات تطابق البحث"));
  const lastPage = await liveRender(liveCollection([liveCountry(7)], { page: 2, total: 7, totalPages: 2 }), { page: "2", search: "وجهة" });
  assert.equal((lastPage.match(/<article\b/g) ?? []).length, 1);
  assert.ok(lastPage.includes("page=1"));
  assert.match(resultsCounters(lastPage)[0], />7<\/strong>/);
  await assert.rejects(() => liveRender(liveCollection([], { page: 99, total: 7, totalPages: 2 }), { page: "99", featured: "true" }), /redirect:\/study-abroad\?featured=true&page=2/);
});

test("Directory unavailable-media labels are opt-in and failed images recover when their source changes", () => {
  let failed = false;
  const local = loader({ react: { ...React, useState: () => [failed, (value) => { failed = value; }] } });
  const { StudyAbroadImage } = local("components/public/study-abroad-image.tsx");
  const props = { src: "https://example.test/image.jpg", alt: "صورة حقيقية", unavailableLabel: "صورة الوجهة (غير متوفر حالياً)" };
  const image = StudyAbroadImage(props);
  assert.equal(image.type, "img");
  image.props.onError();
  assert.ok(renderToStaticMarkup(StudyAbroadImage(props)).includes("صورة الوجهة (غير متوفر حالياً)"));
  assert.equal(renderToStaticMarkup(StudyAbroadImage({ src: null, alt: "" })).includes("غير متوفر حالياً"), false);
  const cards = fs.readFileSync(path.resolve(__dirname, "../components/public/study-abroad-country-cards.tsx"), "utf8");
  assert.ok(cards.includes("key={country.imageUrl}"));
});

// Identify the approved visible counter, not a legacy id or live-region wrapper.
function resultsCounters(html) {
  return html.match(/<p\b[^>]*>تم العثور على <strong\b[^>]*>\d+<\/strong> وجهات دراسية<\/p>/g) ?? [];
}

test("Compact destination hero uses the approved local artwork and preserves cards, routes and CTA", async () => {
  const calls = [];
  const html = await render({}, async (params) => { calls.push(params); return getDemoCountries(params); });
  assert.ok(fs.existsSync(path.resolve(__dirname, "../public/images/study-abroad/study-abroad-hero.png")));
  assert.ok(html.includes('src="/images/study-abroad/study-abroad-hero.png" alt=""'));
  assert.ok(html.includes("اكتشف الوجهات الدراسية المتاحة، وتعرّف على مميزات كل دولة لتبدأ رحلتك الأكاديمية بثقة."));
  assert.ok(html.indexOf('id="destinations-title"') < html.indexOf('aria-label="البحث وتصفية الوجهات الدراسية"'));
  assert.ok(html.indexOf('aria-label="البحث وتصفية الوجهات الدراسية"') < html.indexOf('id="destination-results"'));
  assert.equal((html.match(/<article\b/g) ?? []).length, 6);
  for (const country of (await getDemoCountries({ limit: 6, sort: "manual" })).items) {
    assert.ok(html.includes(`/study-abroad/${country.slug}`));
    assert.equal(html.includes(`/universities?country=${country.slug}`), false);
  }
  assert.ok(html.includes("/images/study-abroad/destinations-cta.png"));
  assert.match(html, /href="\/universities"[^>]*>استكشف الجامعات/);
  assert.deepEqual(calls, [{ search: undefined, featured: undefined, sort: "manual", page: undefined, limit: 6 }]);
});

test("Directory keeps filter values, six-item pagination and separate empty/error states", async () => {
  const html = await render({ sort: "newest", page: "2" });
  assert.equal((html.match(/<article\b/g) ?? []).length, 1);
  assert.ok(html.includes('href="/study-abroad?sort=newest&amp;page=1"'));
  assert.ok(html.includes('value="newest" selected=""'));
  const empty = await render({ search: "no-destination-matches" });
  assert.ok(empty.includes("لا توجد وجهات تطابق البحث"));
  assert.ok(empty.includes("مسح التصفية"));
  assert.equal(resultsCounters(empty).length, 1);
  assert.match(resultsCounters(empty)[0], /<strong[^>]*>0<\/strong> وجهات دراسية/);
  const failed = await render({ search: "تركيا", featured: "true", sort: "newest", page: "2" }, async () => { throw Error("offline"); });
  assert.ok(failed.includes('role="alert"'));
  assert.ok(failed.includes("يتعذر تحميل الوجهات حاليًا"));
  assert.equal(failed.includes("لا توجد وجهات تطابق البحث"), false);
  assert.equal(resultsCounters(failed).length, 0);
  assert.ok(failed.includes("featured=true&amp;sort=newest&amp;page=2"));
});

test("Out-of-range pagination still redirects to the last valid page with criteria intact", async () => {
  await assert.rejects(() => render({ page: "999", sort: "newest" }), /redirect:\/study-abroad\?sort=newest&page=2/);
});

test("One counter preserves approved RTL copy, total matches rather than page size, and the Articles blue", async () => {
  const layout = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8");
  assert.match(layout, /<html\b[^>]*dir="rtl"/);
  for (const search of [{}, { page: "2" }, { sort: "newest" }, { search: "تركيا" }, { featured: "true" }]) {
    const html = await render(search);
    const params = { page: search.page ? Number(search.page) : 1, limit: 6, sort: search.sort ?? "manual", search: search.search, featured: search.featured };
    const expected = await getDemoCountries(params);
    const counters = resultsCounters(html);
    assert.equal(counters.length, 1, "Exactly one counter uses the approved visible wording");
    const count = counters[0];
    assert.doesNotMatch(count, /(?:text-left|text-center|dir="ltr")/, "Keep the inherited RTL/right alignment");
    assert.ok(count.includes(`text-[#17669C]">${expected.pagination.total}</strong> وجهات دراسية`));
    assert.equal(html.includes("الوجهات المتاحة"), false);
    assert.equal(html.includes("دولة في النتائج"), false);
  }
});

test("Changing criteria hides stale results throughout debounce and pending navigation, without hiding equivalent trimmed criteria", () => {
  const values = { search: "", featured: false, sort: "manual" };
  function frame(draft, pending = false) {
    let stateIndex = 0;
    const mockReact = { ...React, useEffect() {}, useRef: () => ({ current: null }), useState: () => [stateIndex++ === 0 ? draft : JSON.stringify(values), () => {}], useTransition: () => [pending, (action) => action()] };
    const local = loader({ react: mockReact, "next/navigation": { useRouter: () => ({ push() {} }) } });
    return renderToStaticMarkup(local("components/public/study-abroad-filters.tsx").StudyAbroadFilters({ values, children: React.createElement("p", null, "previous results") }));
  }
  for (const draft of [{ ...values, search: "تركيا" }, { ...values, featured: true }, { ...values, sort: "newest" }]) {
    const html = frame(draft);
    assert.ok(html.includes('aria-busy="true"'));
    assert.ok(html.includes("جارٍ تحديث الوجهات الدراسية…"));
    assert.equal(html.includes("previous results"), false);
  }
  assert.equal(frame(values, true).includes("previous results"), false);
  assert.ok(frame(values).includes("previous results"));
  assert.ok(frame({ ...values, search: "   " }).includes("previous results"));
});
