/* eslint-disable @typescript-eslint/no-require-imports -- Isolate browser observers and Next.js components. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, "..", relative);
  const instance = new Module(filename, module);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = instance.require.bind(instance);
  instance.require = (name) => name in overrides ? overrides[name] : original(name);
  instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
  return instance.exports;
}

test("Scroll discovery follows actual overflow, fractional bottom tolerance, resize and content changes, and cleans up", () => {
  const originals = Object.fromEntries(["ResizeObserver", "requestAnimationFrame", "cancelAnimationFrame", "window"].map((name) => [name, global[name]]));
  const listeners = new Map();
  const frame = { clientHeight: 656 };
  const scrollCalls = [];
  let reducedMotion = false;
  const scroller = { clientHeight: 620, scrollHeight: 938, scrollTop: 0,
    scrollBy: (options) => scrollCalls.push(options),
    addEventListener: (name, callback, options) => { assert.equal(options.passive, true); listeners.set(name, callback); },
    removeEventListener: (name, callback) => { assert.equal(listeners.get(name), callback); listeners.delete(name); },
  };
  const content = { scrollHeight: 938 };
  const refs = [frame, scroller, content].map((current) => ({ current }));
  let refIndex = 0, state = { overflow: false, moreBelow: false }, effect, resize, disconnected = false;
  let queued, changes = 0;
  const observed = [];
  global.ResizeObserver = class {
    constructor(callback) { resize = callback; }
    observe(element) { observed.push(element); }
    disconnect() { disconnected = true; }
  };
  global.requestAnimationFrame = (callback) => { queued = callback; return 1; };
  global.cancelAnimationFrame = () => { queued = undefined; };
  global.window = { addEventListener: (name, callback) => listeners.set(name, callback), removeEventListener: (name) => listeners.delete(name), matchMedia: (query) => { assert.equal(query, "(prefers-reduced-motion: reduce)"); return { matches: reducedMotion }; } };
  const flush = () => { const callback = queued; queued = undefined; callback?.(); };
  try {
    const { UniversityFilterScrollArea } = load("components/public/university-filter-scroll-area.tsx", {
      react: { ...React, useId: () => "filter-scroll-test", useRef: () => refs[refIndex++], useState: () => [state, (update) => { const next = update(state); if (next !== state) changes++; state = next; }], useLayoutEffect: (callback) => { effect = callback; } },
      "./university-filter-scroll-area.module.css": { indicatorIcon: "indicatorIcon" },
    });
    const render = () => { refIndex = 0; return UniversityFilterScrollArea({ children: "filters" }); };
    render();
    const cleanup = effect();
    flush();
    assert.deepEqual(observed, [frame, scroller, content]);
    assert.deepEqual(state, { overflow: true, moreBelow: true });
    const button = () => render().props.children[1].props.children[1];
    assert.match(render().props.children[1].props.children[0].props.className, /pointer-events-none/);
    assert.match(render().props.children[1].props.children[0].props.className, /-top-8 h-8/);
    assert.match(button().props.className, /hover:bg-\[#FBF5E9\]/);
    assert.equal(button().props["aria-controls"], "filter-scroll-test");
    assert.ok(renderToStaticMarkup(render()).includes("عرض المزيد من الفلاتر"));
    button().props.onClick();
    assert.deepEqual(scrollCalls.pop(), { top: 403, behavior: "smooth" });
    reducedMotion = true;
    button().props.onClick();
    assert.deepEqual(scrollCalls.pop(), { top: 403, behavior: "auto" });
    const previousChanges = changes;
    listeners.get("scroll")(); flush();
    assert.equal(changes, previousChanges, "Unchanged measurements do not re-render");
    scroller.scrollTop = 317.2;
    listeners.get("scroll")(); flush();
    assert.deepEqual(state, { overflow: true, moreBelow: false });
    assert.equal(button().props["aria-hidden"], true);
    assert.equal(button().props.disabled, true);
    assert.equal(button().props.children[0], null, "Hidden hints unmount the animated icon");
    button().props.onClick();
    assert.equal(scrollCalls.length, 0);
    scroller.scrollTop = 100;
    listeners.get("scroll")(); flush();
    assert.equal(state.moreBelow, true);
    frame.clientHeight = scroller.clientHeight = 1000;
    resize(); flush();
    assert.deepEqual(state, { overflow: false, moreBelow: false });
    assert.equal(render().props.children[1], null);
    content.scrollHeight = scroller.scrollHeight = 1200;
    resize(); flush();
    assert.equal(state.moreBelow, true);
    frame.clientHeight = 0;
    resize(); flush();
    assert.equal(state.overflow, false, "Closed/hidden panels have no hint");
    cleanup();
    assert.equal(disconnected, true);
    assert.equal(listeners.size, 0);
    assert.equal(queued, undefined);
  } finally {
    for (const [name, value] of Object.entries(originals)) {
      if (value === undefined) delete global[name]; else global[name] = value;
    }
  }
});

test("Initial viewport fitting uses the actual frame top before paint and updates on scrolling, fonts and resize", () => {
  const names = ["ResizeObserver", "requestAnimationFrame", "cancelAnimationFrame", "window", "document"];
  const originals = Object.fromEntries(names.map((name) => [name, global[name]]));
  const listeners = new Map();
  const properties = new Map();
  let top = 207, effect, queued, resize, disconnected = false, refIndex = 0;
  let state = { overflow: false, moreBelow: false };
  const frame = { get clientHeight() { return Math.min(902, parseInt(properties.get("--university-filter-available-height") ?? "902", 10)); }, getBoundingClientRect: () => ({ top }), style: { getPropertyValue: (name) => properties.get(name), setProperty: (name, value) => properties.set(name, value) } };
  const scroller = { get clientHeight() { return frame.clientHeight - (state.overflow ? 48 : 0); }, scrollHeight: 902, scrollTop: 0, addEventListener: () => {}, removeEventListener: () => {} };
  const refs = [frame, scroller, { scrollHeight: 902 }].map((current) => ({ current }));
  const events = (prefix) => ({ addEventListener: (name, callback) => listeners.set(`${prefix}:${name}`, callback), removeEventListener: (name) => listeners.delete(`${prefix}:${name}`) });
  global.window = { innerHeight: 800, ...events("window") };
  global.document = { fonts: events("fonts") };
  global.ResizeObserver = class { constructor(callback) { resize = callback; } observe() {} disconnect() { disconnected = true; } };
  global.requestAnimationFrame = (callback) => { queued = callback; return 1; };
  global.cancelAnimationFrame = () => { queued = undefined; };
  const flush = () => { const callback = queued; queued = undefined; callback?.(); };
  try {
    const { UniversityFilterScrollArea } = load("components/public/university-filter-scroll-area.tsx", {
      react: { ...React, useId: () => "viewport-test", useRef: () => refs[refIndex++], useState: () => [state, (update) => { state = update(state); }], useLayoutEffect: (callback) => { effect = callback; } },
      "./university-filter-scroll-area.module.css": { viewportFrame: "viewportFrame" },
    });
    const tree = UniversityFilterScrollArea({ children: "filters", fitViewport: true });
    assert.match(tree.props.className, /viewportFrame/);
    const cleanup = effect();
    assert.equal(properties.get("--university-filter-available-height"), "577px");
    assert.deepEqual(state, { overflow: true, moreBelow: true }, "Initial hint needs no scroll event or delayed frame");
    assert.equal(queued, undefined);
    top = 96;
    listeners.get("window:scroll")(); flush();
    assert.equal(properties.get("--university-filter-available-height"), "688px");
    top = 215;
    listeners.get("fonts:loadingdone")(); flush();
    assert.equal(properties.get("--university-filter-available-height"), "569px");
    window.innerHeight = 1200;
    listeners.get("window:resize")(); flush();
    assert.equal(state.overflow, false, "Hint disappears when all filters fit");
    window.innerHeight = 800;
    resize(); flush();
    assert.equal(state.moreBelow, true);
    listeners.get("window:scroll")();
    cleanup();
    assert.equal(disconnected, true);
    assert.equal(listeners.size, 0);
    assert.equal(queued, undefined);
  } finally {
    for (const [name, value] of Object.entries(originals)) {
      if (value === undefined) delete global[name]; else global[name] = value;
    }
  }
});

test("Only the discovery icon animates subtly; reduced motion disables its scoped animation", () => {
  const css = fs.readFileSync(path.resolve(__dirname, "../components/public/university-filter-scroll-area.module.css"), "utf8");
  assert.ok(css.includes("translateY(2px)"));
  assert.ok(css.includes("3.6s ease-in-out infinite"));
  assert.ok(css.includes("prefers-reduced-motion: reduce"));
  assert.ok(css.includes("animation: none"));
});

const { DirectoryScholarshipCard } = load("components/public/university-directory-cards.tsx", {
  "@/lib/homepage-card-content": load("lib/homepage-card-content.ts"),
  "@/lib/university-directory-data": { directoryUniversityTypes: { PUBLIC: "حكومية", PRIVATE: "خاصة" } },
  "@/lib/homepage-data": { homeMetadataLabel: (value) => value },
  "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/image": () => null,
  "@/components/public/university-directory-image": { UniversityDirectoryImage: ({ src, alt, className }) => React.createElement("div", { "data-image": src, "data-alt": alt, className }) },
});
const scholarship = { slug: "linked-scholarship", titleAr: "منحة دراسية", applicationStatus: "CLOSED", effectiveApplicationStatus: "OPEN", studyLevel: "بكالوريوس", fundingType: "دعم رسوم", university: { nameAr: "جامعة تجريبية" }, country: { nameAr: "رومانيا", slug: "romania" } };

test("Related card retains image, effective status, full metadata, flag, and one accessible details link without spacer heights", () => {
  const html = renderToStaticMarkup(React.createElement(DirectoryScholarshipCard, { scholarship, university: { imageUrl: "/existing-image.jpg", nameAr: "جامعة تجريبية" } }));
  for (const value of ["/existing-image.jpg", "منحة دراسية", "جامعة تجريبية", "بكالوريوس", "دعم رسوم", "رومانيا", "عرض التفاصيل", "التقديم مفتوح"]) assert.ok(html.includes(value));
  assert.equal((html.match(/التقديم مفتوح/g) ?? []).length, 1);
  assert.equal(html.includes("التقديم مغلق"), false);
  assert.equal((html.match(/<a\b/g) ?? []).length, 1);
  assert.ok(html.includes('href="/scholarships/linked-scholarship"'));
  assert.ok(html.includes("<svg"));
  assert.ok(html.includes("flex-wrap"));
  assert.ok(html.includes("min-h-11"));
  assert.equal(html.includes("min-h-14"), false);
  assert.equal(html.includes("<button"), false);
});

test("Missing scholarship metadata stays absent, while the CLOSED badge remains accurate", () => {
  const html = renderToStaticMarkup(React.createElement(DirectoryScholarshipCard, { scholarship: { slug: "closed", titleAr: "منحة مغلقة", applicationStatus: "CLOSED" } }));
  assert.ok(html.includes("التقديم مغلق"));
  assert.equal(html.includes("دعم رسوم"), false);
  assert.equal(html.includes("تمويل"), false);
  assert.equal(html.includes("·"), false);
});
