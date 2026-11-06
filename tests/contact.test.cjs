/* eslint-disable @typescript-eslint/no-require-imports -- Compile the real TS sources with isolated Next.js boundaries. */
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
const helpers = load("lib/contact.ts");
const valid = { fullName: " طالب تجريبي ", email: " student@example.test ", phone: " ", subject: " استفسار آخر ", message: " أود الاستفسار عن الخيارات الدراسية المتاحة. ", privacyAccepted: true, website: "" };

test("inquiry validation enforces trimmed minimums, email, consent and honeypot", () => {
  assert.deepEqual(helpers.validateInquiry(valid), {});
  assert.deepEqual(Object.keys(helpers.validateInquiry({ ...valid, fullName: "أ ", email: "bad", subject: "  أ ", message: " قصير ", privacyAccepted: false })), ["fullName", "email", "subject", "message", "privacyAccepted"]);
  assert.throws(() => helpers.inquiryPayload({ ...valid, website: "bot" }));
  assert.deepEqual(helpers.inquiryPayload(valid), { fullName: "طالب تجريبي", email: "student@example.test", phone: null, subject: "استفسار آخر", message: "أود الاستفسار عن الخيارات الدراسية المتاحة.", privacyAccepted: true, website: "" });
  assert.equal(helpers.inquiryPayload({ ...valid, phone: " +963 999 123 456 " }).phone, "+963 999 123 456");
});

test("Backend field validation survives the existing normalized API error cause", () => {
  const { normalizeApiError } = load("lib/api-client/error.ts");
  const original = { isAxiosError: true, response: { status: 422, data: { error: { details: { fields: { fullName: ["اسم غير صالح"], subject: ["موضوع غير صالح"], phone: "صيغة الهاتف غير مقبولة", privacyAccepted: "الموافقة مطلوبة", unknown: "ignore" } } } } } };
  const errors = helpers.inquiryFieldErrors(normalizeApiError(original));
  assert.deepEqual(errors, { fullName: "يرجى مراجعة الاسم الكامل.", phone: "يرجى مراجعة صيغة رقم الهاتف.", subject: "يرجى مراجعة موضوع الاستفسار.", privacyAccepted: "يرجى الموافقة على سياسة الخصوصية." });
  assert.deepEqual(helpers.inquiryFieldErrors(Error("offline")), {});
});

test("Live inquiry uses existing endpoint and confirms storage; Demo never calls the client", async () => {
  const calls = [];
  let status = 201;
  let data = { success: true, data: { message: "Submission received." } };
  let failure;
  const { submitInquiry } = loader({ "@/lib/api-client/client": { browserApiClient: { post: async (...args) => { calls.push(args); if (failure) throw failure; return { status, data }; } } } })("lib/api-client/contact.ts");
  const payload = helpers.inquiryPayload(valid);
  await submitInquiry(payload, true);
  assert.equal(calls.length, 0);
  await submitInquiry(payload, false);
  assert.deepEqual(calls, [["/inquiries", payload, { withCredentials: false, timeout: 15000 }]]);
  for (const malformed of [null, {}, { success: false }, { success: true }, { success: true, data: {} }, { success: true, data: { message: "" } }]) {
    data = malformed;
    await assert.rejects(submitInquiry(payload, false), /not confirmed/);
  }
  status = 200;
  await assert.rejects(submitInquiry(payload, false), /not confirmed/);
  failure = Error("offline");
  await assert.rejects(submitInquiry(payload, false), /offline/);
});

test("site settings only retain valid approved contact fields and safe URLs", () => {
  assert.deepEqual(helpers.contactSettings(null), {});
  assert.deepEqual(helpers.contactSettings({ contactEmail: "invalid", contactPhone: "not a phone", facebookUrl: "javascript:alert(1)", instagramUrl: "https://user:password@example.test", linkedinUrl: "", youtubeUrl: "data:video/test", unknown: "ignore" }), {});
  const settings = helpers.contactSettings({ academyNameAr: " طريق ", contactEmail: " info@example.test ", contactPhone: "+963 (999) 123-456", addressAr: " عنوان معتمد ", facebookUrl: "https://facebook.com/approved" });
  assert.equal(settings.academyNameAr, "طريق");
  assert.equal(settings.contactEmail, "info@example.test");
  assert.equal(settings.addressAr, "عنوان معتمد");
  assert.equal(settings.contactPhone, "+963 (999) 123-456");
});

test("site settings adapter is isolated in Demo, uses one Live GET, and rejects unsupported envelopes", async () => {
  const calls = [];
  let response = { success: true, data: { contactEmail: "info@example.test" } };
  const { getContactSettings } = loader({ "@/lib/api-client/server-client": { serverApiClient: { get: async (...args) => { calls.push(args); return { data: response }; } } } })("lib/api-client/site-settings.ts");
  assert.deepEqual(await getContactSettings(true), {});
  assert.equal(calls.length, 0);
  assert.deepEqual(await getContactSettings(false), { contactEmail: "info@example.test" });
  assert.deepEqual(calls, [["/site-settings"]]);
  response = { success: false };
  await assert.rejects(getContactSettings(false), /Invalid site settings/);
  for (const data of [[], {}, { contactEmail: 123 }, { contactPhone: {} }]) {
    response = { success: true, data };
    await assert.rejects(getContactSettings(false), /Invalid site settings/);
  }
  response = { success: true, data: { contactEmail: null, contactPhone: null } };
  assert.deepEqual(await getContactSettings(false), {});
});

test("contact card stays visible with clearly labeled non-clickable placeholders and four disabled socials", () => {
  const { ContactInformationCard } = loader()("components/public/contact-cards.tsx");
  for (const settings of [{}, { contactEmail: "invalid", contactPhone: "bad", instagramUrl: "javascript:alert(1)" }]) {
    const html = renderToStaticMarkup(React.createElement(ContactInformationCard, { settings, demo: true }));
    for (const text of ["معلومات التواصل الأخرى", "example@tareeq-academy.com", "+963 900 000 000", "عنوان تجريبي", "تابعنا على مواقع التواصل"]) assert.ok(html.includes(text), text);
    assert.equal((html.match(/بيانات تجريبية/g) ?? []).length, 3);
    assert.equal((html.match(/aria-disabled="true"/g) ?? []).length, 4);
    assert.equal(html.includes("<a "), false, "No placeholder value may be clickable");
  }
});

test("contact cards replace placeholders with configured values and link only real destinations", () => {
  const local = loader();
  const { ContactInformationCard, ContactWhatsappCard } = local("components/public/contact-cards.tsx");
  const settings = helpers.contactSettings({ contactEmail: "info@example.test", contactPhone: "+963 999 123 456", addressAr: "عنوان معتمد", instagramUrl: "https://instagram.com/approved" });
  const html = renderToStaticMarkup(React.createElement(ContactInformationCard, { settings }));
  for (const value of ['href="mailto:info@example.test"', 'href="tel:+963999123456"', 'href="https://instagram.com/approved"', "عنوان معتمد"]) assert.ok(html.includes(value), value);
  assert.equal((html.match(/aria-disabled="true"/g) ?? []).length, 3);
  assert.equal(html.includes("بيانات تجريبية"), false);
  const whatsapp = renderToStaticMarkup(React.createElement(ContactWhatsappCard));
  assert.ok(whatsapp.includes(local("lib/whatsapp.ts").createWhatsappUrl()));
  assert.ok(whatsapp.includes('target="_blank" rel="noopener noreferrer"'));
  assert.equal(whatsapp.includes("data-floating-whatsapp"), false);
  const partial = renderToStaticMarkup(React.createElement(ContactInformationCard, { settings: { contactEmail: "info@example.test" } }));
  assert.equal((partial.match(/غير متوفر حالياً/g) ?? []).length, 2);
  assert.ok(partial.includes('href="mailto:info@example.test"'));
  assert.equal(partial.includes('href="tel:'), false);
  const placeholdersFromSettings = helpers.contactInformation({ contactEmail: "example@tareeq-academy.com", contactPhone: "+963 900 000 000" });
  assert.equal(placeholdersFromSettings.email.href, undefined);
  assert.equal(placeholdersFromSettings.phone.href, undefined);
});

const boundary = {
  "next/link": (props) => React.createElement("a", props),
  "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
  "next/navigation": { useRouter: () => ({ refresh() {} }) },
};
test("contact route preserves reference structure, mobile order and settings-error independence", async () => {
  for (const fail of [false, true]) {
    const local = loader({ ...boundary, "@/lib/public-content-mode": { isPublicDemoMode: () => true }, "@/lib/api-client/site-settings": { getContactSettings: async (demo) => { assert.equal(demo, true); if (fail) throw Error("offline"); return {}; } }, "@/components/public/contact-inquiry-form": { ContactInquiryForm: () => React.createElement("form", { "data-inquiry": true }) } });
    const html = renderToStaticMarkup(await local("app/contact/page.tsx").default());
    for (const value of ["contact-title", "contact-whatsapp-title", "data-inquiry", "lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]", "lg:flex-col", "order-1", "order-2", "order-3", "sm:w-[58%]"]) assert.ok(html.includes(value), value);
    assert.equal(html.includes("data-consultation-cta"), false);
    assert.equal(html.includes("تعذر تحميل معلومات التواصل الإضافية"), fail);
    assert.equal(html.includes("info@tareeq"), false);
  }
});

function formHarness(demo = false, post) {
  const states = [], refs = [];
  let stateIndex = 0, refIndex = 0;
  const mutation = { isPending: false, mutateAsync: async () => {} };
  const local = loader({ ...boundary, ...(post ? { "@/lib/api-client/client": { browserApiClient: { post } } } : {}), react: { ...React, useState: (initial) => { const index = stateIndex++; if (!(index in states)) states[index] = initial; return [states[index], (next) => { states[index] = next; }]; }, useRef: (initial) => { const index = refIndex++; return refs[index] ?? (refs[index] = { current: initial }); } }, "@tanstack/react-query": { useMutation: (options) => { mutation.options = options; if (post) mutation.mutateAsync = options.mutationFn; return mutation; } } });
  const { ContactInquiryForm } = local("components/public/contact-inquiry-form.tsx");
  const render = () => { stateIndex = 0; refIndex = 0; return ContactInquiryForm({ demo }); };
  const findForm = (element) => {
    if (!React.isValidElement(element)) return null;
    if (element.type === "form") return element;
    for (const child of React.Children.toArray(element.props.children)) { const found = findForm(child); if (found) return found; }
    return null;
  };
  return { mutation, render, submit: (form) => findForm(render()).props.onSubmit({ preventDefault() {}, currentTarget: form }) };
}

test("actual form handler validates before submission, locks repeats, resets only on success and retains data on errors", async () => {
  const originalData = global.FormData, originalFrame = global.requestAnimationFrame;
  let values = { ...valid };
  global.FormData = class { get(key) { return key === "privacyAccepted" ? values[key] ? "on" : null : values[key]; } };
  global.requestAnimationFrame = (action) => { action(); return 0; };
  try {
    const h = formHarness();
    let reset = 0, calls = 0;
    const form = { reset() { reset++; }, querySelector() { return { focus() {} }; } };
    values = { ...valid, email: "bad" };
    await h.submit(form);
    assert.ok(renderToStaticMarkup(h.render()).includes("يرجى إدخال بريد إلكتروني صحيح"));
    assert.equal(reset, 0);
    values = { ...valid };
    let resolve;
    h.mutation.mutateAsync = async () => { calls++; await new Promise((done) => { resolve = done; }); };
    const pending = h.submit(form);
    await h.submit(form);
    assert.equal(calls, 1);
    h.mutation.isPending = true;
    const busy = renderToStaticMarkup(h.render());
    assert.ok(busy.includes('aria-busy="true"'));
    assert.ok(busy.includes("<fieldset disabled"));
    assert.ok(busy.includes("جارٍ إرسال الاستفسار"));
    resolve(); await pending;
    h.mutation.isPending = false;
    assert.equal(reset, 1);
    assert.ok(renderToStaticMarkup(h.render()).includes("تم تسجيل استفسارك بنجاح"));
    h.mutation.mutateAsync = async () => { throw { response: { data: { error: { details: { fields: { email: ["رفض الخادم هذا البريد"] } } } } } }; };
    await h.submit(form);
    const failed = renderToStaticMarkup(h.render());
    assert.ok(failed.includes("يرجى مراجعة البريد الإلكتروني"));
    assert.equal(failed.includes("رفض الخادم هذا البريد"), false);
    assert.ok(failed.includes('role="alert"'));
    assert.equal(failed.includes("تم تسجيل استفسارك بنجاح"), false);
    assert.equal(reset, 1, "Errors must not reset user input");
  } finally { global.FormData = originalData; global.requestAnimationFrame = originalFrame; }
});

test("form has required labels, subject strings, hidden honeypot, privacy link and truthful Demo state", () => {
  const { mutation, render } = formHarness();
  void mutation;
  const html = renderToStaticMarkup(render());
  for (const field of ["fullName", "email", "phone", "subject", "message", "privacyAccepted", "website"]) assert.ok(html.includes('name="' + field + '"'));
  assert.ok(html.includes('type="hidden" name="website" value=""'));
  assert.ok(html.includes('href="/privacy"'));
  assert.ok(html.includes('value="استفسار آخر"'));
  assert.match(html, /autocomplete="name"/i);
  assert.ok(html.includes("sm:grid-cols-2"));
  assert.equal(html.includes("<dialog"), false);
  assert.ok(renderToStaticMarkup(formHarness(true).render()).includes("لن تُرسل بياناتك أو تُحفظ"));
});

test("validation matches documented maxima and optional international phone syntax without adding fields", () => {
  for (const phone of ["", "  ", "+963 900 000 000", "1234567", "+1 (202) 555-0123"]) assert.equal(helpers.validateInquiry({ ...valid, phone }).phone, undefined, phone);
  for (const phone of ["123456", "12345678901234567890123456", "+" + "1".repeat(25), "++963900000000", "+963.900.000", "phone", "+1234567-"]) assert.ok(helpers.validateInquiry({ ...valid, phone }).phone, phone);
  for (const [field, max] of [["fullName", 150], ["subject", 200], ["message", 5000]]) {
    assert.equal(helpers.validateInquiry({ ...valid, [field]: "أ".repeat(max) })[field], undefined);
    assert.ok(helpers.validateInquiry({ ...valid, [field]: "أ".repeat(max + 1) })[field]);
  }
  assert.ok(helpers.validateInquiry({ ...valid, email: "a".repeat(250) + "@b.test" }).email);
  const html = renderToStaticMarkup(formHarness().render());
  for (const value of ['maxLength="150"', 'maxLength="254"', 'maxLength="25"', 'maxLength="5000"', 'dir="ltr"', 'aria-labelledby="inquiry-title"']) assert.ok(html.toLowerCase().includes(value.toLowerCase()), value);
});

test("Live contact card keeps every slot and disabled social glyph without fake business details", () => {
  const { ContactInformationCard } = loader()("components/public/contact-cards.tsx");
  const html = renderToStaticMarkup(React.createElement(ContactInformationCard, { settings: {}, demo: false }));
  for (const label of ["البريد الإلكتروني", "رقم الهاتف", "العنوان"]) assert.ok(html.includes(`${label} (غير متوفر حالياً)`));
  assert.equal((html.match(/aria-disabled="true"/g) ?? []).length, 4);
  for (const forbidden of ["example@tareeq-academy.com", "+963 900 000 000", "عنوان تجريبي", 'href="mailto:', 'href="tel:', "بيانات تجريبية"]) assert.equal(html.includes(forbidden), false);
});

test("rate limiting and transport failures provide safe Arabic feedback and retain documented retry guidance", () => {
  const { ApiError, normalizeApiError } = load("lib/api-client/error.ts");
  const limited = normalizeApiError({ isAxiosError: true, response: { status: 429, data: { error: { details: { retryAfterSeconds: 600 }, message: "private server details" } } } });
  assert.ok(helpers.inquiryFailureMessage(limited).includes("600 ثانية"));
  assert.equal(helpers.inquiryFailureMessage(limited).includes("private server details"), false);
  assert.ok(helpers.inquiryFailureMessage(new ApiError(429, "internal")).includes("عدد المحاولات"));
  assert.ok(helpers.inquiryFailureMessage(new ApiError(413, "internal")).includes("حجم الرسالة"));
  for (const failure of [new ApiError(500, "internal"), new ApiError(503, "internal"), Error("Network Error"), { code: "ECONNABORTED" }]) {
    const message = helpers.inquiryFailureMessage(failure);
    assert.ok(message.includes("تعذر إرسال"));
    assert.equal(message.includes("internal"), false);
  }
});

test("real form-to-client path never resets or reports success on malformed acceptance, validation, 429 or server failure", async () => {
  const originalData = global.FormData, originalFrame = global.requestAnimationFrame;
  global.FormData = class { get(key) { return key === "privacyAccepted" ? "on" : valid[key]; } };
  global.requestAnimationFrame = (action) => { action(); return 0; };
  try {
    const { normalizeApiError } = load("lib/api-client/error.ts");
    const attempts = [];
    let response = { status: 201, data: {} }, failure;
    const h = formHarness(false, async (...args) => { attempts.push(args); if (failure) throw failure; return response; });
    let resets = 0, focused;
    const form = { reset() { resets++; }, querySelector(selector) { return { focus() { focused = selector; } }; } };
    for (const error of [undefined, normalizeApiError({ isAxiosError: true, response: { status: 400, data: { error: { details: { fields: { email: ["Invalid input: sensitive diagnostic"] } } } } } }), normalizeApiError({ isAxiosError: true, response: { status: 429, data: { error: { details: { retryAfterSeconds: 600 } } } } }), Error("Network failure"), { status: 503 }]) {
      failure = error;
      const before = attempts.length;
      await h.submit(form);
      assert.equal(attempts.length, before + 1);
      const html = renderToStaticMarkup(h.render());
      assert.equal(resets, 0);
      assert.ok(html.includes('role="alert"'));
      assert.equal(html.includes("تم تسجيل استفسارك بنجاح"), false);
      assert.equal(html.includes("sensitive diagnostic"), false);
      if (error?.status === 429) assert.ok(html.includes("600 ثانية"));
    }
    assert.equal(focused, '[name="email"]');
    assert.equal(h.mutation.options.retry, 0);
    assert.deepEqual(attempts[0], ["/inquiries", helpers.inquiryPayload(valid), { withCredentials: false, timeout: 15000 }]);
    failure = undefined;
    response = { status: 201, data: { success: true, data: { message: "Submission received." } } };
    await h.submit(form);
    assert.equal(resets, 1);
    assert.ok(renderToStaticMarkup(h.render()).includes("تم تسجيل استفسارك بنجاح"));
    const demo = formHarness(true, async () => { throw Error("Demo must not submit"); });
    await demo.submit(form);
    assert.ok(renderToStaticMarkup(demo.render()).includes("اكتملت محاكاة الاستفسار"));
  } finally { global.FormData = originalData; global.requestAnimationFrame = originalFrame; }
});

test("Live route isolates settings errors with retry, preserves form and configured WhatsApp without mode changes", async () => {
  for (const failed of [false, true]) {
    const local = loader({ ...boundary,
      "@/lib/public-content-mode": { isPublicDemoMode: () => false },
      "@/lib/api-client/server-client": { serverApiClient: { get: async (path) => { assert.equal(path, "/site-settings"); if (failed) throw Error("offline"); return { data: { success: true, data: { contactEmail: null, contactPhone: null, addressAr: null } } }; } } },
      "@/components/public/contact-inquiry-form": { ContactInquiryForm: ({ demo }) => { assert.equal(demo, false); return React.createElement("form", { "data-live-inquiry": true }); } },
    });
    const html = renderToStaticMarkup(await local("app/contact/page.tsx").default());
    assert.ok(html.includes("data-live-inquiry"));
    assert.ok(html.includes(local("lib/whatsapp.ts").createWhatsappUrl()));
    assert.ok(html.includes("معلومات التواصل الأخرى"));
    assert.equal(html.includes("تعذر تحميل معلومات التواصل الإضافية"), failed);
    assert.equal(html.includes("إعادة المحاولة"), failed);
    assert.equal(html.includes("example@tareeq-academy.com"), false);
    assert.equal(html.includes("بيانات تجريبية"), false);
  }
});

