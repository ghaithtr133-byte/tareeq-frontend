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
  const { normalizeApiError } = load("api/error.ts");
  const original = { isAxiosError: true, response: { status: 422, data: { error: { details: { fields: { fullName: ["اسم غير صالح"], subject: ["موضوع غير صالح"], phone: "صيغة الهاتف غير مقبولة", privacyAccepted: "الموافقة مطلوبة", unknown: "ignore" } } } } } };
  const errors = helpers.inquiryFieldErrors(normalizeApiError(original));
  assert.deepEqual(errors, { fullName: "اسم غير صالح", phone: "صيغة الهاتف غير مقبولة", subject: "موضوع غير صالح", privacyAccepted: "الموافقة مطلوبة" });
  assert.deepEqual(helpers.inquiryFieldErrors(Error("offline")), {});
});

test("Live inquiry uses existing endpoint and confirms storage; Demo never calls the client", async () => {
  const calls = [];
  let status = 201;
  let failure;
  const { submitInquiry } = loader({ "@/api/client": { browserApiClient: { post: async (...args) => { calls.push(args); if (failure) throw failure; return { status }; } } } })("api/contact.ts");
  const payload = helpers.inquiryPayload(valid);
  await submitInquiry(payload, true);
  assert.equal(calls.length, 0);
  await submitInquiry(payload, false);
  assert.deepEqual(calls, [["/inquiries", payload]]);
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
  const { getContactSettings } = loader({ "@/api/server-client": { serverApiClient: { get: async (...args) => { calls.push(args); return { data: response }; } } } })("api/site-settings.ts");
  assert.deepEqual(await getContactSettings(true), {});
  assert.equal(calls.length, 0);
  assert.deepEqual(await getContactSettings(false), { contactEmail: "info@example.test" });
  assert.deepEqual(calls, [["/site-settings"]]);
  response = { success: false };
  await assert.rejects(getContactSettings(false), /Invalid site settings/);
});

test("contact card stays visible with clearly labeled non-clickable placeholders and four disabled socials", () => {
  const { ContactInformationCard } = loader()("components/public/contact-cards.tsx");
  for (const settings of [{}, { contactEmail: "invalid", contactPhone: "bad", instagramUrl: "javascript:alert(1)" }]) {
    const html = renderToStaticMarkup(React.createElement(ContactInformationCard, { settings }));
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
  assert.equal((partial.match(/بيانات تجريبية/g) ?? []).length, 2);
  assert.ok(partial.includes('href="mailto:info@example.test"'));
  assert.equal(partial.includes('href="tel:'), false);
  const placeholdersFromSettings = helpers.contactInformation({ contactEmail: "example@tareeq-academy.com", contactPhone: "+963 900 000 000" });
  assert.equal(placeholdersFromSettings.email.href, undefined);
  assert.equal(placeholdersFromSettings.phone.href, undefined);
});

const boundary = {
  "next/link": (props) => React.createElement("a", props),
  "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
};
test("contact route preserves reference structure, mobile order and settings-error independence", async () => {
  for (const fail of [false, true]) {
    const local = loader({ ...boundary, "@/lib/public-content-mode": { isPublicDemoMode: () => true }, "@/api/site-settings": { getContactSettings: async (demo) => { assert.equal(demo, true); if (fail) throw Error("offline"); return {}; } }, "@/components/public/contact-inquiry-form": { ContactInquiryForm: () => React.createElement("form", { "data-inquiry": true }) } });
    const html = renderToStaticMarkup(await local("app/contact/page.tsx").default());
    for (const value of ["contact-title", "contact-whatsapp-title", "data-inquiry", "lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]", "lg:flex-col", "order-1", "order-2", "order-3", "md:min-h-[12.5rem]", "xl:min-h-[14.5rem]"]) assert.ok(html.includes(value), value);
    assert.equal(html.includes("data-consultation-cta"), false);
    assert.equal(html.includes("تعذر تحميل معلومات التواصل الإضافية"), fail);
    assert.equal(html.includes("info@tareeq"), false);
  }
});

function formHarness(demo = false) {
  const states = [], refs = [];
  let stateIndex = 0, refIndex = 0;
  const mutation = { isPending: false, mutateAsync: async () => {} };
  const local = loader({ ...boundary, react: { ...React, useState: (initial) => { const index = stateIndex++; if (!(index in states)) states[index] = initial; return [states[index], (next) => { states[index] = next; }]; }, useRef: (initial) => { const index = refIndex++; return refs[index] ?? (refs[index] = { current: initial }); } }, "@tanstack/react-query": { useMutation: () => mutation } });
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
    assert.ok(failed.includes("رفض الخادم هذا البريد"));
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

