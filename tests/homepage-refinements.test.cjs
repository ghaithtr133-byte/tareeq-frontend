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
const base = loader();
const demo = base("lib/mocks/public-demo-content.ts");
const ui = {
  "next/navigation": { useRouter: () => ({ refresh() {} }) },
  "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/image": ({ src, alt, className, draggable }) => React.createElement("img", { src, alt, className, draggable }),
};
function homeLoader(services, calls = []) {
  const methods = { getCountries: demo.getDemoCountries, getUniversities: demo.getDemoUniversities, getScholarships: demo.getDemoScholarships, getServices: services ?? demo.getDemoServices, getArticles: demo.getDemoArticles };
  return loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => true }, "@/api/public-content": Object.fromEntries(Object.entries(methods).map(([name, fn]) => [name, (...args) => { calls.push({ name, args }); return fn(...args); }])) });
}
async function renderHome(local = homeLoader()) {
  return renderToStaticMarkup(await local("app/page.tsx").default());
}
function section(html, id) {
  return html.match(new RegExp(`<section[^>]*aria-labelledby="${id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1] ?? "";
}

test("Hero uses one fully interactive internal link with the actual admission slug and keeps the destination CTA", async () => {
  const calls = [];
  const html = await renderHome(homeLoader(undefined, calls));
  const hero = html.match(/<section[^>]*id="intro"[\s\S]*?<\/section>/)[0];
  assert.ok(hero.includes('href="/services/university-admissions"'));
  assert.ok(hero.includes('href="/study-abroad"'));
  assert.ok(hero.includes("ابدأ رحلتك"));
  assert.ok(hero.includes("استكشف الوجهات"));
  assert.ok(hero.includes("cursor-pointer"));
  assert.ok(hero.includes("focus-visible:ring-2"));
  assert.equal(hero.includes("disabled="), false);
  assert.equal(hero.includes("wa.me"), false);
  assert.equal(hero.includes("<button"), false);
  assert.equal(html.includes('href="/start"'), false);
  assert.equal(calls.length, 5);
  assert.deepEqual(calls.find((item) => item.name === "getServices").args, [{ limit: 5, sort: "manual" }]);
});

test("Hero honors an arbitrary canonical published slug and falls back safely for absent, duplicate, draft, or failed data", async () => {
  const item = await demo.getDemoService("university-admissions");
  const html = await renderHome(homeLoader(async () => ({ items: [{ ...item, slug: "backend-canonical-admissions" }], pagination: { total: 1 } })));
  assert.ok(html.includes('href="/services/backend-canonical-admissions"'));
  for (const getServices of [
    async () => ({ items: [], pagination: { total: 0 } }),
    async () => ({ items: [{ ...item, status: "DRAFT" }], pagination: { total: 1 } }),
    async () => ({ items: [item, { ...item, slug: "duplicate-title" }], pagination: { total: 2 } }),
    async () => { throw Error("offline"); },
  ]) {
    const fallback = await renderHome(homeLoader(getServices));
    const hero = fallback.match(/<section[^>]*id="intro"[\s\S]*?<\/section>/)[0];
    assert.ok(hero.includes('href="/services"'));
    assert.equal(hero.includes('href="/services/university-admission"'), false);
    assert.equal(hero.includes("wa.me"), false);
  }
});

test("Homepage native image and link dragging is disabled without selection, touch or pointer suppression", async () => {
  const html = await renderHome();
  for (const match of html.matchAll(/<(?:a|img)\b[^>]*>/g)) assert.ok(match[0].includes('draggable="false"'), match[0]);
  assert.equal(html.includes("select-none"), false);
  assert.equal(html.includes("touch-none"), false);
  const carousel = fs.readFileSync(path.resolve(__dirname, "../components/home/featured-universities-carousel.tsx"), "utf8");
  const css = fs.readFileSync(path.resolve(__dirname, "../components/home/featured-universities-carousel.module.css"), "utf8");
  assert.ok(carousel.includes("track.scrollTo"));
  assert.ok(carousel.includes('addEventListener("scroll"'));
  assert.ok(css.includes("overflow-x: auto"));
  assert.ok(css.includes("scroll-snap-type: x mandatory"));
  assert.equal(/onPointerDown|onMouseDown|onDragStart/.test(carousel), false);
});

test("Journey keeps all four ordered steps and its artwork, with no competing CTA", async () => {
  const journey = section(await renderHome(), "journey-title");
  assert.ok(journey.length);
  const titles = ["اختيار الوجهة", "اختيار الجامعة", "تقديم الطلب", "بدء الرحلة"];
  assert.equal((journey.match(/<li/g) ?? []).length, 4);
  assert.deepEqual(titles.map((title) => journey.indexOf(title)), [...titles.map((title) => journey.indexOf(title))].sort((a, b) => a - b));
  for (const text of ["حدّد ما يناسب خطتك الدراسية.", "اقرأ الخيارات المنشورة بوضوح.", "رتّب وثائقك وخطوتك التالية.", "تابع مسارك بمعلومات موثوقة."]) assert.ok(journey.includes(text));
  assert.equal(journey.includes("غير متوفر حالياً"), false);
  assert.ok(journey.includes("/images/journey/journey-background.png"));
  assert.equal(journey.includes("ابدأ رحلتك"), false);
  assert.equal(journey.includes("<a "), false);
  assert.ok(journey.includes("lg:grid-cols-4"));
});

test("Statistics, article hierarchy, existing FAQ and closing WhatsApp content are preserved", async () => {
  const html = await renderHome();
  const { demoTrustMetrics } = base("lib/mocks/home-trust-metrics.ts");
  for (const metric of demoTrustMetrics) assert.equal(html.includes(metric.value), false);
  assert.equal(html.includes('aria-label="مؤشرات توضيحية غير مؤكدة"'), false);
  const trust = section(html, "trust-experience-title");
  assert.ok(trust.includes("/images/trust/library-globe.jpg"));
  assert.ok(trust.includes("استكشف الجامعات"));
  assert.equal(trust.includes("min-h-[24rem]"), false);
  assert.equal(trust.includes("min-h-[29rem]"), false);
  assert.equal((trust.match(/data-trust-value=/g) ?? []).length, 4);
  for (const label of ["سنوات من الخبرة", "جامعة في عدة دول", "وجهات دراسية", "طالب وطالبة سجلوا معنا"]) assert.ok(trust.includes(label));
  assert.equal((trust.match(/غير متوفر حالياً/g) ?? []).length, 4);
  assert.ok(trust.includes("grid-cols-2 sm:grid-cols-4"));
  assert.ok(trust.includes("lucide-map-pinned"));
  assert.equal(trust.includes("ووجهات دراسية"), false);
  assert.ok(trust.includes("lucide-trophy"));
  assert.ok(trust.includes("lucide-graduation-cap"));
  assert.ok(trust.includes("lucide-users-round"));
  assert.ok(trust.includes("border-s border-[#E2E8F0]"));
  assert.ok(trust.includes("my-3 border-t"));
  const articles = section(html, "articles-title");
  const records = await demo.getDemoArticles({ limit: 6, sort: "newest" });
  for (const item of records.items) assert.ok(articles.includes(`/articles/${item.slug}`));
  assert.ok(articles.includes(records.items[0].summaryAr));
  assert.ok(articles.includes("lg:grid-cols-[1.3fr_0.7fr]"));
  assert.ok(articles.includes("lg:min-h-[25.5rem]"));
  assert.equal((section(html, "home-faq-title").match(/<summary/g) ?? []).length, 6);
  const closing = section(html, "consultation-title");
  const { createWhatsappUrl } = base("lib/whatsapp.ts");
  assert.ok(closing.includes(createWhatsappUrl("مرحبًا، أود الاستفسار عن خيارات الدراسة المتاحة.")));
  assert.ok(closing.includes("/images/footer/footer-skyline.png"));
  assert.ok(closing.includes("min-h-12"));
});

test("Trust replaces only values when verified data becomes available, preserving the same slots", () => {
  const { TrustExperience } = loader(ui)("components/home/trust-experience.tsx");
  const missing = renderToStaticMarkup(React.createElement(TrustExperience));
  const populated = renderToStaticMarkup(React.createElement(TrustExperience, { statistics: { experience: "قيمة موثقة", universities: "عدد موثق", destinations: "وجهات موثقة", students: "إجمالي موثق" } }));
  assert.equal(populated.includes("غير متوفر حالياً"), false);
  for (const key of ["experience", "universities", "destinations", "students"]) {
    assert.ok(missing.includes(`data-trust-value="${key}"`));
    assert.ok(populated.includes(`data-trust-value="${key}"`));
  }
  for (const icon of ["lucide-trophy", "lucide-graduation-cap", "lucide-map-pinned", "lucide-users-round"]) assert.ok(populated.includes(icon));
});

test("Homepage spacing stays compact without replacing approved artwork or removing statistic slots", async () => {
  const html = await renderHome();
  const trust = section(html, "trust-experience-title");
  assert.ok(trust.includes("px-6 py-5"));
  assert.ok(trust.includes("sm:py-5"));
  assert.ok(trust.includes("gap-1.5 px-2 py-2"));
  assert.ok(trust.includes("my-3 border-t"));
  assert.ok(trust.includes("جامعة في عدة دول"));
  const hero = html.match(/<section[^>]*id="intro"[\s\S]*?<\/section>/)[0];
  assert.ok(hero.includes("pb-6 pt-6"));
  assert.ok(hero.includes("/images/hero/study-abroad-student-landmarks.png"));
  assert.equal((hero.match(/<strong/g) ?? []).length, 4);
  assert.ok(section(html, "journey-title").includes("/images/journey/journey-background.png"));
});

test("Widescreen expansion is Homepage-only and shared Container defaults remain unchanged", () => {
  const local = loader(ui);
  const { HomeContainer } = local("components/home/home-primitives.tsx");
  const { Container } = local("components/layout/container.tsx");
  assert.ok(renderToStaticMarkup(React.createElement(HomeContainer)).includes("2xl:max-w-[112rem]"));
  const shared = renderToStaticMarkup(React.createElement(Container));
  assert.ok(shared.includes("2xl:max-w-[100rem]"));
  assert.equal(shared.includes("112rem"), false);
  for (const file of ["app/page.tsx", "components/home/trust-experience.tsx", "components/home/home-faq.tsx"]) {
    assert.ok(fs.readFileSync(path.resolve(__dirname, "..", file), "utf8").includes("HomeContainer as Container"));
  }
});

test("Shared Footer has two coherent groups, unique routes and one official WhatsApp action, preserving legal links", () => {
  const local = loader(ui);
  const html = renderToStaticMarkup(React.createElement(local("components/layout/site-footer.tsx").SiteFooter));
  for (const href of ["/", "/study-abroad", "/universities", "/scholarships", "/articles", "/about", "/services", "/contact", "/privacy", "/terms"]) {
    assert.equal(html.split(`href="${href}"`).length - 1, 1, href);
    const file = href === "/" ? "app/page.tsx" : `app${href}/page.tsx`;
    assert.ok(fs.existsSync(path.resolve(__dirname, "..", file)));
  }
  assert.ok(html.includes("استكشف"));
  assert.ok(html.includes("طريق الأكاديمية"));
  assert.equal(html.includes("الخدمات التعليمية"), false);
  assert.equal(html.includes("عن طريق الأكاديمية"), false);
  assert.equal(html.includes('href="/faq"'), false);
  assert.equal(html.includes(">الرئيسية<"), false);
  assert.equal((html.match(/href="https:\/\/wa.me\//g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 2);
  assert.ok(html.includes("©"));
  assert.ok(html.includes("min-h-11"));
});
