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
  const local = loader({ "@/lib/api-client/client": { browserApiClient: { post: async (...args) => { calls.push(args); if (failure) throw failure; return { status }; } } } });
  const { submitScholarshipAssistance } = local("lib/api-client/scholarship-assistance.ts");
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
  "next/navigation": { useRouter: () => ({ refresh() {} }) },
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
  for (const id of ["scholarship-context-cta", "scholarship-closing-cta"]) assert.ok(html.includes(`id="${id}"`), "Sticky assistance visibility targets remain intact");
  assert.ok(html.includes('data-consultation-cta="contextual"'));
  assert.equal(html.includes("تحتاج إلى استفسار سريع؟"), false, "General WhatsApp support remains global rather than competing with assistance");
});

test("Live ignores Demo extras/media, preserves paragraphs, and renders only verified data", () => {
  const html = render({ ...scholarship, descriptionAr: "وصف حقيقي\n\nفقرة أخرى", requirementsAr: "شروط منشورة\nوليست قائمة" }, false, { extras: getDemoScholarshipDetails(scholarship.slug), media: { src: "/demo-only.jpg", alt: "demo" } });
  assert.ok(html.includes("وصف حقيقي\n\nفقرة أخرى"));
  assert.ok(html.includes("شروط منشورة\nوليست قائمة"));
  for (const text of ["demo-only.jpg", "مثال توضيحي:", "مسار توضيحي خيالي"]) assert.equal(html.includes(text), false, text);
  for (const text of ["مزايا المنحة", "خطوات التقديم", "تغطية الرسوم الدراسية (غير متوفر حالياً)", "الوثائق المطلوبة (غير متوفر حالياً)", "خطوة التقديم الأولى (غير متوفر حالياً)", "صورة المنحة (غير متوفر حالياً)"]) assert.ok(html.includes(text), text);
});

test("scholarship information appears only in the preserved summary, not above the main image", () => {
  const html = render(scholarship, false);
  const summary = html.match(/<aside aria-labelledby="scholarship-summary-title"[\s\S]*?<\/aside>/)?.[0];
  assert.ok(summary);
  assert.ok(summary.includes("ملخص المنحة"));
  for (const label of ["الدولة", "المرحلة الدراسية", "نوع التمويل", "الموعد النهائي", "حالة التقديم"]) assert.ok(summary.includes(label), label);
  assert.equal((html.match(/<dl\b/g) ?? []).length, 1);
  assert.equal((summary.match(/<dl\b/g) ?? []).length, 1);
  assert.equal(html.slice(0, html.indexOf("data-scholarship-media")).includes("<dl"), false);
  assert.ok(summary.includes('id="scholarship-primary-assistance"'));
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
    "@/lib/api-client/public-content": { getScholarship: async (slug) => { requestedSlug = slug; if (failure) throw failure; return scholarship; } },
    "@/lib/api-client/error": { ApiError },
    "next/navigation": { useRouter: () => ({ refresh() {} }), notFound: () => { throw new Error("NOT_FOUND"); } },
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
  assert.ok(unavailable.includes("تعذّر تحميل معلومات المنحة"));
  assert.equal(unavailable.includes(scholarship.titleAr), false);
});

const detailHelpers = load("lib/scholarship-detail-live.ts");
const projected = { ...scholarship, status: undefined, country: undefined, university: undefined, universityId: null, countryId: null, slug: "real-scholarship", titleAr: "منحة منشورة", applicationStatus: "OPEN", effectiveApplicationStatus: "CLOSED", imageUrl: "https://media.example.test/scholarship.jpg", imageAltAr: "صورة المنحة الحقيقية" };

test("Live status is Backend-owned: future/missing/past dates never override effective or unknown application state", () => {
  for (const deadline of [null, "2000-01-01T00:00:00Z", "2099-01-01T00:00:00Z", "not-a-date"]) {
    const closed = detailHelpers.parseScholarshipDetail({ ...projected, verifiedDeadline: deadline }, projected.slug);
    const html = render(closed, false);
    assert.ok(html.includes("التقديم مغلق"));
    assert.equal(html.includes("<form"), false);
    assert.ok(html.includes("منحة منشورة"));
  }
  const open = detailHelpers.parseScholarshipDetail({ ...projected, effectiveApplicationStatus: "OPEN", verifiedDeadline: null }, projected.slug);
  assert.equal(helpers.canRequestScholarshipAssistance(open), true);
  const openHtml = render(open, false);
  assert.ok(openHtml.includes("التقديم مفتوح"));
  assert.ok(openHtml.includes("<form"));
  assert.ok(openHtml.includes("موعد التقديم (غير متوفر حالياً)"));
  const unknown = detailHelpers.parseScholarshipDetail({ ...projected, effectiveApplicationStatus: "invalid", applicationStatus: "OPEN" }, projected.slug);
  const unknownHtml = render(unknown, false);
  assert.ok(unknownHtml.includes("حالة التقديم (غير متوفر حالياً)"));
  assert.equal(unknownHtml.includes("التقديم مغلق"), false);
  assert.equal(unknownHtml.includes("التقديم مفتوح"), false);
  assert.equal(unknownHtml.includes("<form"), false);
  assert.ok(unknownHtml.includes('id="scholarship-context-cta"'));
  assert.ok(unknownHtml.includes("طلب المساعدة غير متاح حالياً"));
});

test("Detail source guard rejects Admin, unsafe and credential URLs; closed records retain safe informational sources", () => {
  for (const url of [null, "", "javascript:alert(1)", "data:text/plain,test", "https://user:secret@example.test", "https://admin.tareeq-academy.com/admin/scholarships/new", "https://example.test/%61dmin/new", "https://example.test/wp-admin", "http://localhost:3000/admin", "https://api.tareeq-academy.com/api/v1/admin"]) assert.equal(detailHelpers.scholarshipDetailSource(url), null, String(url));
  assert.equal(detailHelpers.scholarshipDetailSource("https://nawa.gov.pl/en/nawa/news/call-for-applications-banach-nawa-2026"), "https://nawa.gov.pl/en/nawa/news/call-for-applications-banach-nawa-2026");
  const testRecord = detailHelpers.parseScholarshipDetail({ ...projected, slug: "test", titleAr: "test", officialSourceUrl: "https://admin.tareeq-academy.com/admin/scholarships/new" }, "test");
  const html = render(testRecord, false);
  assert.ok(html.includes('id="scholarship-title"'));
  assert.ok(html.includes("test"));
  assert.ok(html.includes("المصدر الرسمي للمنحة (غير متوفر حالياً)"));
  assert.ok(html.includes('role="link" aria-disabled="true"'));
  assert.equal(html.includes("admin.tareeq-academy.com"), false);
  const source = render({ ...testRecord, officialSourceUrl: "https://nawa.gov.pl/en/nawa/news/call-for-applications-banach-nawa-2026" }, false);
  assert.ok(source.includes("المصدر الرسمي للمنحة"));
  assert.equal(source.includes(">التقديم الرسمي<"), false);
});

test("Live detail media and partial content keep all approved slots without borrowing Demo benefits, dates, images or documents", () => {
  const data = detailHelpers.parseScholarshipDetail({ ...projected, descriptionAr: "وصف مالي من المصدر لا يحوّل إلى مزايا", requirementsAr: "المتطلبات الأصلية المنشورة", fundingType: "GOVERNMENT_FUNDED", studyLevel: "BACHELOR_MASTER_PHD" }, projected.slug);
  const html = render(data, false, { extras: getDemoScholarshipDetails(scholarship.slug), media: { src: "/not-for-live.jpg", alt: "Demo" } });
  for (const text of ["بكالوريوس، ماجستير، دكتوراه", "تمويل حكومي", "مزايا المنحة", "المتطلبات الأصلية المنشورة", "خطوات التقديم", "https://media.example.test/scholarship.jpg", 'alt="صورة المنحة الحقيقية"']) assert.ok(html.includes(text), text);
  assert.equal(html.includes("تمويل حكومي كامل"), false);
  assert.equal(html.includes("not-for-live"), false);
  assert.equal(html.includes("مثال توضيحي"), false);
  assert.equal(html.includes("الجامعة / الجهة"), false, "A government scholarship need not have a university");
  const benefits = html.slice(html.indexOf("مزايا المنحة"), html.indexOf("شروط التقديم"));
  assert.equal(benefits.includes("وصف مالي من المصدر"), false);
  assert.equal((benefits.match(/غير متوفر حالياً/g) ?? []).length, 4);
  assert.ok(html.includes("grid-cols-2 gap-4 sm:grid-cols-4"));
  assert.ok(html.includes("lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]"));
  const partial = detailHelpers.parseScholarshipDetail({ ...projected, titleAr: null, descriptionAr: null, requirementsAr: null, studyLevel: null, fundingType: null, imageUrl: "javascript:alert(1)", verifiedDeadline: "2026-02-31T00:00:00Z" }, projected.slug);
  const missing = render(partial, false);
  for (const label of ["اسم المنحة", "نبذة المنحة", "شروط التقديم", "نوع التمويل", "المستوى الدراسي", "صورة المنحة", "موعد التقديم"]) assert.ok(missing.includes(`${label} (غير متوفر حالياً)`), label);
});

test("Published detail adapter uses the existing client and only necessary bounded real relationship lookups", async () => {
  const calls = [];
  let record = { ...projected, countryId: "c1" };
  let failLookup = false;
  let demoMode = false;
  const country = { id: "c1", slug: "romania", nameAr: "رومانيا" };
  const list = (items) => ({ items, pagination: { page: 1, limit: 50, total: items.length, totalPages: items.length ? 1 : 0 } });
  const local = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => demoMode }, "@/lib/api-client/public-content": {
    getScholarship: async (slug) => { calls.push(["scholarship", slug]); return record; },
    getCountries: async (params) => { calls.push(["countries", params]); if (failLookup) throw Error("offline"); return list([country]); },
    getUniversities: async (params) => { calls.push(["universities", params]); return list([{ id: "u1", slug: "actual-university", nameAr: "جامعة حقيقية" }]); },
  } });
  const api = local("lib/api-client/scholarship-detail.ts");
  const joined = await api.getPublishedScholarshipDetail(projected.slug);
  assert.equal(joined.status, "PUBLISHED");
  assert.equal(joined.country.nameAr, "رومانيا");
  assert.deepEqual(calls, [["scholarship", projected.slug], ["countries", { limit: 50, sort: "manual" }]]);
  calls.length = 0;
  record = { ...record, country, universityId: "u1" };
  const university = await api.getPublishedScholarshipDetail(projected.slug);
  assert.equal(university.university.nameAr, "جامعة حقيقية");
  assert.deepEqual(calls, [["scholarship", projected.slug], ["universities", { limit: 50, sort: "name" }]]);
  calls.length = 0;
  record = { ...record, country: undefined, universityId: null };
  failLookup = true;
  const failed = await api.getPublishedScholarshipDetail(projected.slug);
  assert.equal(failed.titleAr, projected.titleAr);
  assert.equal(failed.relationLookupFailed, true);
  const html = render(failed, false);
  assert.ok(html.includes("تعذّر تحميل بعض المعلومات المرتبطة"));
  assert.ok(html.includes("إعادة المحاولة"));
  assert.ok(html.includes(projected.titleAr));
  calls.length = 0;
  demoMode = true;
  await api.getPublishedScholarshipDetail(projected.slug);
  assert.deepEqual(calls, [["scholarship", projected.slug]], "Demo never performs Live lookups");
});

test("Invalid/unknown/unpublished scholarships are not substituted, and explicit malformed identity is an error", async () => {
  const { ApiError } = load("lib/api-client/error.ts");
  let record = projected;
  let error;
  let calls = 0;
  const local = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/lib/api-client/error": { ApiError }, "@/lib/api-client/public-content": { getScholarship: async () => { calls++; if (error) throw error; return record; } } });
  const api = local("lib/api-client/scholarship-detail.ts");
  for (const slug of ["../bad", "", "A-wrong", "x".repeat(121)]) await assert.rejects(api.getPublishedScholarshipDetail(slug), { status: 404 });
  assert.equal(calls, 0);
  for (const status of ["DRAFT", "ARCHIVED"]) { record = { ...projected, status }; await assert.rejects(api.getPublishedScholarshipDetail(projected.slug), { status: 404 }); }
  record = { ...projected, slug: "another-scholarship" };
  await assert.rejects(api.getPublishedScholarshipDetail(projected.slug), /identity/);
  error = new ApiError(404, "unknown");
  await assert.rejects(api.getPublishedScholarshipDetail("unknown-scholarship"), { status: 404 });
  error = new ApiError(503, "offline");
  await assert.rejects(api.getPublishedScholarshipDetail(projected.slug), { status: 503 });
});
