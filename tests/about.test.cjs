/* eslint-disable @typescript-eslint/no-require-imports -- Test real TS/TSX with isolated Next runtime boundaries. */
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
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
    return instance.exports;
  }
  return load;
}
const ui = {
  "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/navigation": { useRouter: () => ({ refresh() {} }) },
};
const list = (items) => ({ items, pagination: { page: 1, limit: 3, total: items.length, totalPages: items.length ? 1 : 0 } });
const service = { id: "service-one", slug: "academic-guidance", titleAr: "خدمة منشورة", summaryAr: "ملخص حقيقي للخدمة", status: undefined };

test("Live uses only documented SiteSettings and bounded Services clients; it never guesses an About endpoint", async () => {
  const calls = [];
  const local = loader({
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "@/lib/api-client/server-client": { serverApiClient: { get: async (url) => { calls.push(url); assert.equal(url, "/site-settings"); return { data: { success: true, data: { academyNameAr: "اسم الجهة الحقيقي" } } }; } } },
    "@/lib/api-client/public-content": { getServices: async (params) => { calls.push(params); return list([service]); } },
  });
  const result = await local("lib/api-client/about-page.ts").loadAboutPage();
  assert.deepEqual(calls, ["/site-settings", { limit: 3, sort: "manual" }]);
  assert.equal(result.demo, false);
  assert.equal(result.profile.status, "unsupported");
  assert.equal(result.identity.value.academyNameAr, "اسم الجهة الحقيقي");
  assert.equal(result.services.value[0].titleAr, service.titleAr);
  assert.equal(result.services.value[0].status, "PUBLISHED");
});

test("Live errors, empty lists and invalid/unpublished services remain distinct with no Demo fallback", async () => {
  for (const raw of [list([]), list([{ ...service, status: "DRAFT" }]), list([{ ...service, slug: "../unsafe" }]), { items: [] }, Error("network")]) {
    const local = loader({
      "@/lib/public-content-mode": { isPublicDemoMode: () => false },
      "@/lib/api-client/site-settings": { getContactSettings: async () => { throw Error("identity offline"); } },
      "@/lib/api-client/public-content": { getServices: async () => { if (raw instanceof Error) throw raw; return raw; } },
    });
    const result = await local("lib/api-client/about-page.ts").loadAboutPage();
    assert.equal(result.identity.status, "rejected");
    assert.equal(result.profile.status, "unsupported");
    if (raw.items?.length === 0 && raw.pagination) { assert.equal(result.services.status, "fulfilled"); assert.deepEqual(result.services.value, []); }
    else assert.equal(result.services.status, "rejected");
  }
});

test("Demo uses the established Demo source, not Live settings, without an invented About success record", async () => {
  const local = loader({
    "@/lib/public-content-mode": { isPublicDemoMode: () => true },
    "@/lib/api-client/server-client": { serverApiClient: { get: async () => { throw Error("Demo must not request Live"); } } },
  });
  const result = await local("lib/api-client/about-page.ts").loadAboutPage();
  assert.equal(result.demo, true);
  assert.deepEqual(result.identity.value, {});
  assert.equal(result.profile.status, "unsupported");
  assert.ok(result.services.value.length > 0);
});

// These are presentation-slot tests, NOT fixtures for a nonexistent About API contract.
test("presentation slots prefer supplied content, preserve values order and never duplicate story into vision/mission", () => {
  const local = loader(ui);
  const { AboutProfile } = local("components/public/about-profile.tsx");
  const content = { introduction: "نبذة معتمدة", story: "قصة معتمدة", vision: "رؤية معتمدة", mission: "رسالة معتمدة", values: [{ title: "قيمة ثانية", description: "وصف ثان" }, { title: "قيمة أولى", description: "وصف أول" }] };
  const html = renderToStaticMarkup(React.createElement(AboutProfile, { profile: { status: "ready", content } }));
  for (const value of [content.story, content.vision, content.mission]) assert.equal(html.split(value).length - 1, 1);
  assert.equal(html.includes("غير متوفر حالياً"), false);
  assert.ok(html.indexOf("قيمة ثانية") < html.indexOf("قيمة أولى"));
  assert.ok(html.includes("data-balanced-cards"));
  assert.equal(html.includes("<img"), false, "No optional photo or unavailable-photo container is invented");
  const empty = renderToStaticMarkup(React.createElement(AboutProfile, { profile: { status: "ready", content: { values: [] } } }));
  assert.ok(empty.includes("القيم المعتمدة غير متاحة حالياً"));
  assert.equal(empty.includes("الشفافية (غير متوفر حالياً)"), false, "An explicit empty collection must not gain filler values");
});

test("unsupported, empty, partial and failed profile presentation remain honest and preserve section headings", () => {
  const { AboutProfile } = loader(ui)("components/public/about-profile.tsx");
  for (const profile of [{ status: "unsupported" }, { status: "empty" }, { status: "error" }, { status: "ready", content: { story: "النص المتاح" } }]) {
    const html = renderToStaticMarkup(React.createElement(AboutProfile, { profile }));
    for (const id of ["about-story-title", "about-direction-title", "about-values-title"]) assert.ok(html.includes(id));
    if (profile.status === "error") {
      assert.ok(html.includes("تعذّر تحميل نبذة الأكاديمية"));
      assert.ok(html.includes("إعادة المحاولة"));
      assert.equal(html.includes("الشفافية (غير متوفر حالياً)"), false, "Errors must not look like placeholder success");
    } else {
      assert.ok(html.includes("رؤيتنا"));
      assert.ok(html.includes("غير متوفر حالياً"));
      assert.ok(html.includes("ليست سياسات رسمية"));
      if (profile.status === "ready") assert.equal(html.includes("تفاصيل نشأة الأكاديمية"), false);
      else assert.ok(html.includes("الملف التعريفي غير متاح حالياً"));
    }
  }
});

test("page renders RTL brand composition, real service links, isolated failures, shared CTA and safe WhatsApp", async () => {
  for (const failed of [false, true]) {
    const local = loader({ ...ui,
      "@/lib/public-content-mode": { isPublicDemoMode: () => false },
      "@/lib/api-client/site-settings": { getContactSettings: async () => ({ academyNameAr: "اسم من الإعدادات" }) },
      "@/lib/api-client/public-content": { getServices: async () => { if (failed) throw Error("offline"); return list([service]); } },
    });
    const route = local("app/about/page.tsx");
    const html = renderToStaticMarkup(await route.default());
    for (const value of ['dir="rtl"', "about-title", "data-about-decoration", "about-story-title", "about-support-title", "اسم من الإعدادات", 'href="/contact"', 'href="/services"', "data-consultation-cta", 'rel="noopener noreferrer"', "motion-reduce:transition-none", "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"]) assert.ok(html.includes(value), value);
    assert.ok(html.includes(local("lib/whatsapp.ts").createWhatsappUrl()));
    assert.equal(html.includes(`href="/services/${service.slug}"`), !failed);
    assert.equal(html.includes("تعذّر تحميل الخدمات"), failed);
    assert.equal(html.includes("لا توجد خدمات منشورة حالياً"), false);
    assert.deepEqual(route.metadata.robots, { index: false, follow: false });
    assert.equal(html.includes("<img"), false);
  }
});

test("loading uses shared motion-safe Skeletons and one accessible pending announcement only", () => {
  const { default: Loading } = loader(ui)("app/about/loading.tsx");
  const html = renderToStaticMarkup(React.createElement(Loading));
  assert.ok(html.includes('aria-busy="true"'));
  assert.equal((html.match(/role="status"/g) ?? []).length, 1);
  assert.ok(html.includes("motion-safe:animate-pulse"));
  assert.ok(html.includes("motion-reduce:animate-none"));
  assert.ok(html.includes("md:grid-cols-2"));
});
