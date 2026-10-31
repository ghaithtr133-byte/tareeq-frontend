/* eslint-disable @typescript-eslint/no-require-imports -- Compile the real TS sources with isolated Next.js boundaries. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { QueryClient, QueryClientProvider } = require("@tanstack/react-query");

function loader(overrides = {}) {
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(__dirname, "..", relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const instance = new Module(filename, module);
    cache.set(filename, instance);
    instance.filename = filename;
    instance.paths = Module._nodeModulePaths(path.dirname(filename));
    const requireOriginal = instance.require.bind(instance);
    instance.require = (name) => {
      if (name in overrides) return overrides[name];
      if (name === "server-only") return {};
      if (name.startsWith(".")) {
        const target = path.resolve(path.dirname(filename), name);
        for (const extension of [".tsx", ".ts"]) {
          if (fs.existsSync(`${target}${extension}`)) return load(path.relative(path.resolve(__dirname, ".."), `${target}${extension}`));
        }
      }
      if (name.startsWith("@/")) {
        const base = name.slice(2);
        return load(fs.existsSync(path.resolve(__dirname, "..", `${base}.tsx`)) ? `${base}.tsx` : `${base}.ts`);
      }
      return requireOriginal(name);
    };
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, filename);
    return instance.exports;
  }
  return load;
}

const load = loader();
const helpers = load("lib/scholarship-assistance.ts");
const demo = load("lib/mocks/public-demo-content.ts");
const scholarship = { ...demo.publicDemoContent.scholarships[0], id: "c54dd018-ff73-4a80-b75a-2d4bec548193" };
const valid = { fullName: " طالب تجريبي ", email: " student@example.test ", phone: " ", message: " أحتاج مساعدة في قراءة المتطلبات. ", privacyAccepted: true, website: "" };

test("assistance uses the loaded id, approved payload, nullable phone, and trimmed fields", () => {
  const payload = helpers.scholarshipAssistancePayload(scholarship, valid);
  assert.deepEqual(payload, { applicationType: "SCHOLARSHIP_ASSISTANCE", scholarshipId: scholarship.id, fullName: "طالب تجريبي", email: "student@example.test", phone: null, message: "أحتاج مساعدة في قراءة المتطلبات.", privacyAccepted: true, website: "" });
  assert.notEqual(payload.scholarshipId, scholarship.slug);
  assert.equal(helpers.scholarshipAssistancePayload(scholarship, { ...valid, phone: "+123456789" }).phone, "+123456789");
});

test("required fields, invalid email, privacy and honeypot are validated", () => {
  assert.deepEqual(Object.keys(helpers.validateAssistance({ ...valid, fullName: " ", email: "invalid", message: "", privacyAccepted: false })), ["fullName", "email", "message", "privacyAccepted"]);
  assert.throws(() => helpers.scholarshipAssistancePayload(scholarship, { ...valid, website: "bot" }));
  assert.throws(() => helpers.scholarshipAssistancePayload(scholarship, { ...valid, privacyAccepted: false }));
});

test("effective closed and unpublished records never permit associated requests", () => {
  for (const record of [{ ...scholarship, effectiveApplicationStatus: "CLOSED" }, { ...scholarship, status: "DRAFT" }, { ...scholarship, status: "ARCHIVED" }]) {
    assert.equal(helpers.canRequestScholarshipAssistance(record), false);
    assert.throws(() => helpers.scholarshipAssistancePayload(record, valid));
  }
  assert.equal(helpers.canRequestScholarshipAssistance({ ...scholarship, effectiveApplicationStatus: undefined, applicationStatus: "CLOSED" }), false);
});

test("Demo submission is isolated and Live only accepts HTTP 201 without falling back", async () => {
  const calls = [];
  let status = 201;
  let failure;
  const local = loader({ "@/api/client": { browserApiClient: { post: async (...args) => { calls.push(args); if (failure) throw failure; return { status }; } } } });
  const { submitScholarshipAssistance } = local("api/scholarship-assistance.ts");
  const payload = helpers.scholarshipAssistancePayload(scholarship, valid);
  await submitScholarshipAssistance(payload, true);
  assert.equal(calls.length, 0);
  await submitScholarshipAssistance(payload, false);
  assert.deepEqual(calls[0], ["/applications", payload]);
  status = 200;
  await assert.rejects(submitScholarshipAssistance(payload, false), /not confirmed/);
  failure = new Error("offline");
  await assert.rejects(submitScholarshipAssistance(payload, false), /offline/);
  assert.equal(calls.length, 3);
});

test("Backend error.details.fields survives the existing normalized Axios error", () => {
  const error = new Error("validation", { cause: { response: { data: { error: { details: { fields: { email: ["البريد غير صحيح"], message: "الرسالة مطلوبة", ignored: "unknown" } } } } } } });
  assert.deepEqual(helpers.assistanceFieldErrors(error), { email: "البريد غير صحيح", message: "الرسالة مطلوبة" });
  assert.deepEqual(helpers.assistanceFieldErrors(new Error("offline")), {});
});

test("official source is not mislabeled as application; unsafe and absent URLs are omitted", () => {
  // Non-routable URLs are test inputs only; no invented external destinations enter UI fixtures.
  assert.deepEqual(helpers.scholarshipOfficialLink("https://source.example.test/info"), { href: "https://source.example.test/info", label: "المصدر الرسمي للمنحة" });
  assert.deepEqual(helpers.scholarshipOfficialLink("https://source.example.test/info", "https://apply.example.test/form"), { href: "https://apply.example.test/form", label: "التقديم الرسمي" });
  assert.equal(helpers.scholarshipOfficialLink(null), null);
  assert.equal(helpers.scholarshipOfficialLink("javascript:alert(1)", "data:text/html,bad"), null);
  assert.equal(helpers.scholarshipOfficialLink("https://name:secret@example.test"), null);
});

const viewLoad = loader({
  "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/image": ({ src, alt, sizes, className, style }) => React.createElement("img", { src, alt, sizes, className, style }),
});
const { ScholarshipDetails } = viewLoad("components/public/scholarship-details.tsx");
const { getDemoScholarshipDetails } = viewLoad("lib/mocks/scholarship-detail-fixtures.ts");
function render(record, isDemo, props = {}) {
  return renderToStaticMarkup(React.createElement(QueryClientProvider, { client: new QueryClient() }, React.createElement(ScholarshipDetails, { scholarship: record, demo: isDemo, ...props })));
}

test("open Demo renders three triggers and one associated form with clearly fictional rich content", () => {
  const html = render(scholarship, true, { extras: getDemoScholarshipDetails(scholarship.slug), media: { src: "/images/trust/library-globe.jpg", alt: "صورة توضيحية" } });
  assert.equal((html.match(/aria-controls="scholarship-assistance-dialog"/g) ?? []).length, 3);
  assert.equal((html.match(/<form /g) ?? []).length, 1);
  assert.equal((html.match(/<dialog /g) ?? []).length, 1);
  for (const text of ["نبذة عن المنحة", "مزايا المنحة", "شروط التقديم", "خطوات التقديم", "أمثلة خيالية", "الموعد غير محدد", scholarship.titleAr]) assert.ok(html.includes(text), text);
  assert.ok(html.includes('/images/trust/library-globe.jpg'));
  assert.ok(html.indexOf('id="scholarship-primary-assistance"') < html.indexOf('id="scholarship-about"'));
});

test("Live ignores Demo extras/media, preserves paragraphs, and renders only verified data", () => {
  const html = render({ ...scholarship, descriptionAr: "وصف حقيقي\n\nفقرة أخرى", requirementsAr: "شروط منشورة\nوليست قائمة" }, false, { extras: getDemoScholarshipDetails(scholarship.slug), media: { src: "/demo-only.jpg", alt: "demo" } });
  assert.ok(html.includes("وصف حقيقي\n\nفقرة أخرى"));
  assert.ok(html.includes("شروط منشورة\nوليست قائمة"));
  for (const text of ["مزايا المنحة", "خطوات التقديم", "demo-only.jpg", "مثال توضيحي:"]) assert.equal(html.includes(text), false, text);
  assert.ok(html.includes("رسم أكاديمي بديل"));
});

test("closed and missing-field fixtures retain details without assistance or fabricated organization", () => {
  const closed = render({ ...scholarship, effectiveApplicationStatus: "CLOSED", country: null, university: null, studyLevel: "", fundingType: "", verifiedDeadline: "not-a-date" }, true);
  assert.equal(closed.includes("<form"), false);
  assert.equal(closed.includes('aria-controls="scholarship-assistance-dialog"'), false);
  assert.ok(closed.includes("استشارة عامة"));
  assert.ok(closed.includes("التقديم مغلق"));
  assert.ok(closed.includes("الموعد غير محدد"));
  assert.equal(closed.includes("الجامعة / الجهة"), false);
  assert.ok(closed.includes('href="/contact"'));
  const closedWithApplication = render({ ...scholarship, effectiveApplicationStatus: "CLOSED" }, true, { extras: { ...getDemoScholarshipDetails(scholarship.slug), applicationUrl: "https://apply.example.test/form" } });
  assert.equal(closedWithApplication.includes("https://apply.example.test/form"), false);
});

test("valid official links render distinctly with secure external-link behavior", () => {
  const html = render({ ...scholarship, officialSourceUrl: "https://source.example.test/info" }, false);
  assert.ok(html.includes("المصدر الرسمي للمنحة"));
  assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert.equal(html.includes(">التقديم الرسمي<"), false);
  const application = render(scholarship, true, { extras: { ...getDemoScholarshipDetails(scholarship.slug), applicationUrl: "https://apply.example.test/form" } });
  assert.ok(application.includes("التقديم الرسمي"));
});

test("detail route loads the actual slug, preserves metadata, 404, and API-unavailable behavior", async () => {
  let failure;
  let requestedSlug;
  class ApiError extends Error { constructor(status) { super("API failure"); this.status = status; } }
  const routeLoad = loader({
    "@/api/public-content": { getScholarship: async (slug) => { requestedSlug = slug; if (failure) throw failure; return scholarship; } },
    "@/api/error": { ApiError },
    "next/navigation": { notFound: () => { throw new Error("NOT_FOUND"); } },
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "@/lib/seo": { createPageMetadata: (title, description, options) => ({ title, description, ...options }) },
    "@/components/public/page-components": { ContentSection: "section" },
    "@/components/public/public-content": { ApiUnavailable: "api-unavailable" },
  });
  const route = routeLoad("app/scholarships/[slug]/page.tsx");
  const params = { params: Promise.resolve({ slug: scholarship.slug }) };
  const page = await route.default(params);
  assert.equal(requestedSlug, scholarship.slug);
  assert.equal(page.props.scholarship.id, scholarship.id);
  assert.equal(page.props.demo, false);
  assert.equal((await route.generateMetadata(params)).pathname, `/scholarships/${scholarship.slug}`);
  failure = new ApiError(404);
  await assert.rejects(route.default(params), /NOT_FOUND/);
  failure = new ApiError(503);
  const unavailable = renderToStaticMarkup(await route.default(params));
  assert.ok(unavailable.includes("api-unavailable"));
  assert.equal(unavailable.includes(scholarship.titleAr), false);
});
