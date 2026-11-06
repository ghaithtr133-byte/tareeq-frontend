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
  "next/navigation": { useRouter: () => ({ refresh() {} }), redirect: (url) => { throw Error(`REDIRECT:${url}`); } },
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
  const local = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => true }, "@/api/public-content": { getServices: async (params) => { requests += 1; assert.deepEqual(params, { limit: 5, sort: "manual" }); return demo.getDemoServices(params); } } });
  const { default: ServicesPage } = local("app/services/page.tsx");
  const html = renderToStaticMarkup(await ServicesPage({ searchParams: Promise.resolve({}) }));
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
  const local = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/public-content": { getServices: async () => ({ items: [], pagination: { page: 1, limit: 5, total: 0, totalPages: 0 } }) } });
  const { default: ServicesPage } = local("app/services/page.tsx");
  const { createWhatsappUrl } = viewLoad("lib/whatsapp.ts");
  const html = renderToStaticMarkup(await ServicesPage({ searchParams: Promise.resolve({}) }));
  assert.ok(html.includes(`href="${createWhatsappUrl()}"`));
  assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(html.includes("تواصل عبر واتساب"));
  assert.equal((html.match(/data-services-whatsapp/g) ?? []).length, 1);
  const closing = html.match(/<section[^>]*data-consultation-cta="closing"[\s\S]*?<\/section>/)?.[0];
  assert.ok(closing);
  assert.ok(closing.indexOf("services-contact-title") < closing.indexOf("data-services-whatsapp"));
  assert.ok(closing.includes('class="mt-3 flex min-w-0 flex-wrap gap-2"'));
  assert.equal(closing.includes("justify-between"), false, "Action stays with the message, not on the opposite side");
  assert.equal(closing.includes("min-h-["), false, "Banner height follows its content");
});

test("compact consultation variant retains semantic labeling, scoped actions and reduced-motion focus styles", () => {
  const { ConsultationCta, consultationActionClass } = viewLoad("components/public/consultation-cta.tsx");
  const html = renderToStaticMarkup(React.createElement(ConsultationCta, {
    as: "aside", variant: "contextual", titleId: "context-test", title: "استشارة", description: "إرشاد مناسب للطالب",
    action: React.createElement("a", { href: "/contact", className: consultationActionClass }, "تواصل معنا"),
  }));
  assert.ok(html.startsWith('<aside data-consultation-cta="contextual" aria-labelledby="context-test"'));
  assert.ok(html.includes('id="context-test"'));
  for (const token of ["min-h-12", "bg-[#C8A253]", "bg-none", "focus-visible:outline-white", "motion-reduce:transition-none"]) assert.ok(html.includes(token), token);
  assert.equal(html.includes('md:w-[72%]'), false, "Sidebar content uses its available column");
  assert.equal((html.match(/<a /g) ?? []).length, 1);
});

test("all five published service CTAs use scoped navy/gold interactions and retain full-width bottom alignment", async () => {
  const published = (await demo.getDemoServices({ limit: 5, sort: "manual" })).items;
  const { publishedServiceHref } = viewLoad("lib/service-details.ts");
  for (const service of config.publicServices) {
    const href = publishedServiceHref(service.title, published);
    assert.ok(href);
    const html = renderToStaticMarkup(React.createElement(ServiceOverviewCard, { service, publishedHref: href }));
    assert.ok(html.includes(`href="${href}"`));
    assert.equal((html.match(/<a\b/g) ?? []).length, 1);
    assert.ok(html.includes('class="mt-auto pt-1"'));
    for (const style of ["min-h-11 w-full", "rounded-lg", "border-primary bg-primary", "text-white", "hover:bg-accent hover:text-primary", "active:bg-[#B68A3E] active:text-primary", "transition-colors duration-200", "focus-visible:outline-offset-4 focus-visible:outline-primary", "motion-reduce:transition-none", "size-4 shrink-0"]) assert.ok(html.includes(style), style);
    assert.ok(html.includes("اعرف المزيد"));
    assert.equal(html.includes("disabled="), false);
  }
});

const live = load("lib/services-directory-live.ts");
const liveList = (items = [], page = 1, total = items.length) => ({ items, pagination: { page, limit: 5, total, totalPages: Math.ceil(total / 5) } });
const liveService = { id: "live-service", slug: "real-service-slug", titleAr: "خدمة منشورة", summaryAr: "ملخص حقيقي", descriptionAr: "تفصيل حقيقي", imageUrl: "https://media.example.test/service.jpg", imageAltAr: "صورة الخدمة المنشورة", displayOrder: 3 };
function liveRoute(data = liveList([liveService]), failure) {
  const calls = [];
  const scoped = loader({ ...ui, "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/api/server-client": { serverApiClient: { get: async (url, options) => {
    calls.push({ url, params: options.params }); if (failure) throw failure; return { data: { success: true, data } };
  } } } });
  return { page: scoped("app/services/page.tsx").default, calls };
}

test("Live renders real published records, actual slugs/media and Backend ordering in the original cards", async () => {
  const route = liveRoute(liveList([{ ...liveService, displayOrder: 20 }, { ...liveService, id: "second", slug: "second-service", titleAr: "الخدمة الثانية", displayOrder: 1 }]));
  const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({}) }));
  assert.deepEqual(route.calls, [{ url: "/services", params: { limit: 5, sort: "manual", page: 1 } }]);
  assert.equal((html.match(/data-service-card=/g) ?? []).length, 2);
  assert.ok(html.indexOf('data-service-card="real-service-slug"') < html.indexOf('data-service-card="second-service"'), "Do not re-sort or restore static service order");
  for (const text of ["خدمة منشورة", "ملخص حقيقي", 'href="/services/real-service-slug"', 'src="https://media.example.test/service.jpg"', 'alt="صورة الخدمة المنشورة"', "hover:bg-accent hover:text-primary", "data-balanced-cards", "xl:[--card-columns:5]"]) assert.ok(html.includes(text), text);
  assert.equal(html.includes('data-service-card="university-admission"'), false);
  assert.equal(html.includes("نساعدك في اختيار الجامعات المناسبة"), false);
});

test("Live empty, failed and malformed collections preserve Hero, static editorial process and closing CTA without fake services", async () => {
  for (const [data, failure, expected] of [[liveList(), undefined, "لا توجد خدمات منشورة حالياً"], [null, Error("offline"), "تعذّر تحميل الخدمات"], [{ items: [], pagination: { total: 2 } }, undefined, "تعذّر تحميل الخدمات"], [liveList([{ ...liveService, status: "DRAFT" }]), undefined, "تعذّر تحميل الخدمات"]]) {
    const route = liveRoute(data, failure);
    const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({}) }));
    assert.ok(html.includes(expected));
    assert.equal((html.match(/data-service-card=/g) ?? []).length, 0);
    assert.ok(html.includes('id="services-title"'));
    assert.ok(html.includes('id="services-process-title"'));
    assert.ok(html.includes("جاهز تبدأ رحلتك الدراسية؟"));
    for (const step of config.serviceProcess) assert.ok(html.includes(step.title));
    if (expected.includes("تعذّر")) { assert.ok(html.includes("إعادة المحاولة")); assert.equal(html.includes("لا توجد خدمات"), false); }
  }
});

test("Partial records use available real text then exact same-service temporary copy, never another service or name-only icon inference", () => {
  const matching = { ...liveService, slug: "major-selection", titleAr: "اختيار التخصص", summaryAr: "", descriptionAr: "", imageUrl: null };
  const original = live.serviceOverviewFromLive(matching);
  assert.equal(original.icon, "major");
  assert.equal(original.description, `${config.publicServices[1].description} (غير متوفر حالياً)`);
  assert.equal(live.serviceOverviewFromLive({ ...matching, summaryAr: "بيان حقيقي" }).description, "بيان حقيقي");
  assert.equal(live.serviceOverviewFromLive({ ...matching, descriptionAr: "تفصيل منشور" }).description, "تفصيل منشور");
  const unrelated = live.serviceOverviewFromLive({ ...matching, slug: "another-slug" });
  assert.equal(unrelated.icon, "general");
  assert.equal(unrelated.description, "وصف الخدمة (غير متوفر حالياً)");
  const missing = live.serviceOverviewFromLive({ ...matching, titleAr: null, imageUrl: "javascript:alert(1)" });
  assert.equal(missing.title, "اسم الخدمة (غير متوفر حالياً)");
  assert.equal(missing.image, null);
  const html = renderToStaticMarkup(React.createElement(ServiceOverviewCard, { service: original, publishedHref: "/services/major-selection", live: true }));
  assert.ok(html.includes("صورة الخدمة (غير متوفر حالياً)"));
  assert.ok(html.includes("رسم توضيحي لخدمة اختيار التخصص"));
  assert.equal(html.includes("/images/services/"), false);
});

test("Live page counts remain balanced and pagination stays server-side with no all-catalog fetch", async () => {
  for (const count of [1, 2, 3, 4, 5]) {
    const route = liveRoute(liveList(Array.from({ length: count }, (_, index) => ({ ...liveService, id: `id-${index}`, slug: `service-${index}` }))));
    const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({}) }));
    assert.equal((html.match(/data-service-card=/g) ?? []).length, count);
    assert.ok(html.includes("justify-center"));
    assert.ok(html.includes("[&amp;&gt;*]:grow-0"));
    assert.equal(route.calls.length, 1);
  }
  const route = liveRoute(liveList([liveService], 2, 6));
  const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({ page: "2", sort: "newest", featured: "true" }) }));
  assert.deepEqual(route.calls, [{ url: "/services", params: { page: 2, limit: 5, sort: "manual" } }]);
  assert.ok(html.includes('href="/services?page=1"'));
  const out = liveRoute(liveList([], 9, 6));
  await assert.rejects(out.page({ searchParams: Promise.resolve({ page: "9" }) }), /REDIRECT:\/services\?page=2/);
  for (const value of [undefined, [], "-1", "0", "1.5", "x", "9007199254740992"]) assert.equal(live.servicesDirectoryPage(value), 1);
});
