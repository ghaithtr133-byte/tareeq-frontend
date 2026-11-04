/* eslint-disable @typescript-eslint/no-require-imports -- Render the shared server component with isolated CSS/alias boundaries. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");

function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, "..", relative);
  const instance = new Module(filename, module);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = instance.require.bind(instance);
  instance.require = (name) => name in overrides ? overrides[name] : original(name);
  instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
  return instance.exports;
}
const helper = load("lib/whatsapp.ts");
const { FloatingWhatsapp } = load("components/layout/floating-whatsapp.tsx", {
  "@/lib/whatsapp": helper,
  "./floating-whatsapp.module.css": { button: "floating-button", shine: "whatsapp-shine" },
});
const css = fs.readFileSync(path.resolve(__dirname, "../components/layout/floating-whatsapp.module.css"), "utf8");

test("one named, keyboard-accessible external link preserves the official destination and proper WhatsApp SVG", () => {
  const html = renderToStaticMarkup(FloatingWhatsapp());
  assert.equal((html.match(/<a\b/g) ?? []).length, 1);
  assert.ok(html.includes(`href="${helper.createWhatsappUrl()}"`));
  assert.ok(html.includes('aria-label="تواصل معنا عبر واتساب"'));
  assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(html.includes('draggable="false"'));
  assert.ok(html.includes('viewBox="0 0 32 32"'));
  assert.ok(html.includes("bg-[#25D366]"));
  assert.ok(html.includes("focus-visible:outline-3"));
  assert.equal(html.includes("tabindex=\"-1\""), false);
});

test("physical bottom-left placement uses safe areas and 52/56px touch targets below the shared Navbar", () => {
  assert.ok(css.includes("position: fixed"));
  assert.ok(css.includes("left: calc(1rem + env(safe-area-inset-left, 0px))"));
  assert.ok(css.includes("bottom: calc(1rem + env(safe-area-inset-bottom, 0px))"));
  assert.ok(css.includes("width: 3.25rem"));
  assert.ok(css.includes("height: 3.25rem"));
  assert.ok(css.includes("@media (min-width: 64rem)"));
  assert.ok(css.includes("left: calc(1.5rem + env(safe-area-inset-left, 0px))"));
  assert.ok(css.includes("bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px))"));
  assert.ok(css.includes("width: 3.5rem"));
  assert.ok(css.includes("height: 3.5rem"));
  assert.ok(css.includes("z-index: 30"));
});

test("only existing blocking-overlay states suppress the button; normal page scrolling never hides it", () => {
  assert.ok(css.includes('body:has(#mobile-navigation[aria-hidden="false"])'));
  assert.ok(css.includes("body:has(dialog[open])"));
  assert.ok(css.includes("display: none"));
  const source = fs.readFileSync(path.resolve(__dirname, "../components/layout/floating-whatsapp.tsx"), "utf8");
  for (const value of ["IntersectionObserver", "addEventListener", "useEffect", "scrollY", "touch-action", "user-select"]) assert.equal(source.includes(value) || css.includes(value), false);
  const layout = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8");
  assert.equal((layout.match(/<FloatingWhatsapp\s*\/>/g) ?? []).length, 1);
});

test("floating/shine motion stays inside a stable hit target and respects reduced motion", () => {
  const view = FloatingWhatsapp();
  assert.equal(view.props.className.includes("animate"), false);
  const html = renderToStaticMarkup(view);
  assert.ok(html.includes("whatsapp-float_4.8s"));
  assert.ok(html.includes('data-whatsapp-shine=""'));
  assert.ok(css.includes("animation: whatsapp-sweep 8s ease-in-out infinite"));
  assert.ok(css.includes("pointer-events: none"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes(".shine { animation: none; }"));
  const frames = css.match(/@keyframes whatsapp-sweep\s*\{[\s\S]*?\n\}/)[0];
  assert.ok(frames.includes("78%"));
  assert.ok(frames.includes("88%"));
  assert.equal(/\b(?:left|top|width|height|bottom):/.test(frames), false);
  assert.ok(html.includes("motion-reduce:animate-none"));
  assert.ok(html.includes("motion-reduce:transition-none"));
  assert.ok(html.includes("0_0_0_3px"));
  assert.equal(html.includes("0_0_0_8px"), false);
});

test("the existing mobile scholarship application bar retains its separate safe lane", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../components/public/scholarship-assistance.tsx"), "utf8");
  assert.ok(source.includes("left-24 right-4 z-30 lg:hidden"));
  // Below lg: the hover-scaled surface plus glow stops well before the bar's 96px left edge.
  assert.ok(16 + 52 * 1.05 + 4 < 96);
});
