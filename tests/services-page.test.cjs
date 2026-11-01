/* eslint-disable @typescript-eslint/no-require-imports -- Exercise real TS/TSX with isolated Next.js runtime boundaries. */
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
      if (name.startsWith(".")) {
        const target = path.resolve(path.dirname(filename), name);
        for (const extension of [".tsx", ".ts"]) if (fs.existsSync(`${target}${extension}`)) return load(path.relative(path.resolve(__dirname, ".."), `${target}${extension}`));
      }
      return originalRequire(name);
    };
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, filename);
    return instance.exports;
  }
  return load;
}
const load = loader();
const config = load("lib/public-services.ts");
const demo = load("lib/mocks/public-demo-content.ts");

test("the five core services preserve Homepage terminology, summaries, and logical order", async () => {
  const homepage = await demo.getDemoServices({ limit: 5, sort: "manual" });
  assert.equal(config.publicServices.length, 5);
  assert.deepEqual(config.publicServices.map((item) => item.title), homepage.items.map((item) => item.titleAr));
  assert.deepEqual(config.publicServices.map((item) => item.homepageSummary), homepage.items.map((item) => item.summaryAr));
  assert.equal(new Set(config.publicServices.map((item) => item.slug)).size, 5);
});

test("planned paths are centralized and unavailable routes cannot produce working detail links", () => {
  assert.deepEqual(config.publicServices.map(config.plannedServiceHref), [
    "/services/university-admission", "/services/major-selection", "/services/scholarship-assistance",
    "/services/document-preparation", "/services/admission-follow-up",
  ]);
  for (const service of config.publicServices) {
    assert.equal(config.availableServiceHref(service), null);
  }
  const future = { ...config.publicServices[0], detailAvailable: true };
  assert.equal(config.availableServiceHref(future), "/services/university-admission");
});

test("all photographic/illustrative media are existing local files and unavailable subjects have distinct branded artwork", () => {
  const images = config.publicServices.flatMap((service) => service.image ? [service.image.src] : []);
  assert.equal(new Set(images).size, images.length);
  for (const src of ["/images/services/services-hero.png", ...images]) {
    assert.ok(src.startsWith("/images/"));
    assert.ok(fs.existsSync(path.resolve(__dirname, "..", "public", src.slice(1))));
  }
  assert.equal(config.publicServices.filter((service) => service.image === null).length, 3);
});

const ui = {
  "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/image": ({ src, alt, className, style }) => React.createElement("img", { src, alt, className, style }),
};
const viewLoad = loader(ui);
const { ServiceOverviewCard } = viewLoad("components/public/service-overview-card.tsx");

test("pending card CTA is visible, natively disabled, explained, and never links to a missing page", () => {
  const service = config.publicServices[1];
  const html = renderToStaticMarkup(React.createElement(ServiceOverviewCard, { service }));
  assert.ok(html.includes("اعرف المزيد"));
  assert.ok(html.includes("disabled="));
  assert.ok(html.includes("التفاصيل غير متاحة بعد"));
  assert.ok(html.includes('aria-describedby="service-pending-major-selection"'));
  assert.equal(html.includes("<a "), false);
  assert.ok(html.includes("رسم توضيحي لخدمة اختيار التخصص"));
  assert.ok(html.includes("motion-safe:hover:-translate-y-0.5"));
});

test("future available detail configuration activates the existing CTA without a card redesign or modal", () => {
  const service = { ...config.publicServices[0], detailAvailable: true };
  const html = renderToStaticMarkup(React.createElement(ServiceOverviewCard, { service }));
  assert.ok(html.includes('href="/services/university-admission"'));
  assert.equal(html.includes("disabled="), false);
  assert.equal(html.includes("التفاصيل غير متاحة بعد"), false);
  assert.equal(html.includes("<dialog"), false);
  assert.equal(html.includes("<details"), false);
});

test("Services page preserves its design and copy, resolving actual published navigation with one bounded request", async () => {
  let requests = 0;
  const local = loader({ ...ui, "@/api/public-content": { getServices: async (params) => { requests += 1; assert.deepEqual(params, { limit: 5, sort: "manual" }); return demo.getDemoServices(params); } } });
  const { default: ServicesPage } = local("app/services/page.tsx");
  const html = renderToStaticMarkup(await ServicesPage());
  assert.equal(requests, 1);
  assert.ok(html.includes('src="/images/services/services-hero.png"'));
  assert.equal((html.match(/data-service-card=/g) ?? []).length, 5);
  assert.equal((html.match(/التفاصيل غير متاحة بعد/g) ?? []).length, 0);
  assert.ok(html.includes('href="/services/university-admissions"'));
  assert.ok(html.includes('href="/services/scholarship-guidance"'));
  assert.ok(html.includes("كيف نعمل؟"));
  assert.equal(config.serviceProcess.length, 4);
  for (const step of config.serviceProcess) assert.ok(html.includes(step.title));
  for (const tag of ["<form", "<input", "<select", "<dialog", "<details"]) assert.equal(html.includes(tag), false);
  assert.ok(html.includes("ولا تضمن الخدمة القبول أو الحصول على منحة"));
});

test("the closing CTA uses only the configured official WhatsApp destination with safe external behavior", async () => {
  const local = loader({ ...ui, "@/api/public-content": { getServices: async () => ({ items: [] }) } });
  const { default: ServicesPage } = local("app/services/page.tsx");
  const { createWhatsappUrl } = viewLoad("lib/whatsapp.ts");
  const html = renderToStaticMarkup(await ServicesPage());
  assert.ok(html.includes(`href="${createWhatsappUrl()}"`));
  assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(html.includes("تواصل عبر واتساب"));
  assert.equal((html.match(/data-services-whatsapp/g) ?? []).length, 1);
});
