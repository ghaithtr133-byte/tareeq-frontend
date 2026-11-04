/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the real effect with isolated DOM event boundaries. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

function exerciseGuard(run) {
  const originalDocument = global.document;
  const originalElement = global.Element;
  const originalNode = global.Node;
  const listeners = new Map();
  let effect;
  const root = {
    addEventListener(name, callback, options) { assert.equal(options === true || options.capture, true); if (name.startsWith("pointer")) assert.equal(options.passive, true); listeners.set(name, callback); },
    removeEventListener(name, callback, capture) { assert.equal(capture, true); assert.equal(listeners.get(name), callback); listeners.delete(name); },
  };
  class Element {
    constructor({ input = false, editable, interactive = true, control } = {}) { this.input = input; this.editable = editable; this.interactive = interactive; this.control = control; }
    closest(selector) {
      if (selector === "input, textarea") return this.input ? this : null;
      if (selector === "[contenteditable]") return this.editable === undefined ? null : { isContentEditable: this.editable };
      return this.interactive ? this.control ?? this : null;
    }
    contains(target) { return target === this || target.control === this; }
  }
  global.Element = Element;
  global.Node = Element;
  global.document = { querySelector(selector) { assert.equal(selector, "[data-public-site]"); return root; } };
  try {
    const filename = path.resolve(__dirname, "../components/layout/native-drag-guard.tsx");
    const instance = new Module(filename, module);
    instance.filename = filename;
    instance.require = () => ({ useEffect: (callback) => { effect = callback; } });
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
    assert.equal(instance.exports.NativeDragGuard(), null);
    const cleanup = effect();
    const drag = (target) => {
      let prevented = false;
      listeners.get("dragstart")({ target, preventDefault() { prevented = true; } });
      return prevented;
    };
    const emit = (name, target, overrides = {}) => {
      const event = { target, pointerType: "mouse", pointerId: 1, isPrimary: true, button: 0, clientX: 0, clientY: 0, timeStamp: 0, detail: 1, prevented: false, stopped: false,
        preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; }, ...overrides };
      listeners.get(name)(event);
      return event;
    };
    assert.deepEqual([...listeners.keys()], ["dragstart", "pointerdown", "pointermove", "pointerup", "pointercancel", "click"]);
    run({ drag, Element, emit });
    cleanup();
    assert.equal(listeners.size, 0);
  } finally {
    if (originalDocument === undefined) delete global.document; else global.document = originalDocument;
    if (originalElement === undefined) delete global.Element; else global.Element = originalElement;
    if (originalNode === undefined) delete global.Node; else global.Node = originalNode;
  }
}

test("delegated dragstart cancels native UI and selected readable-text drags, including newly rendered targets", () => {
  exerciseGuard(({ drag, Element }) => {
    for (const target of ["Navbar logo", "Navbar link", "card", "image", "SVG path", "CTA", "selected paragraph text", "new route link"]) {
      assert.equal(drag(new Element()), true, target);
    }
    assert.equal(drag(null), false);
  });
});

test("native input/textarea editing and inherited editable content are exempt, but explicitly noneditable content is protected", () => {
  exerciseGuard(({ drag, Element }) => {
    assert.equal(drag(new Element({ input: true })), false);
    assert.equal(drag(new Element({ editable: true })), false);
    assert.equal(drag(new Element({ editable: false })), true);
  });
});

test("only the click following a mouse/pen drag over the same control is suppressed", () => {
  exerciseGuard(({ Element, emit }) => {
    const link = new Element();
    const child = new Element({ control: link });
    emit("pointerdown", child);
    assert.equal(emit("pointermove", child, { clientX: 25 }).prevented, false);
    assert.equal(emit("pointerup", child, { clientX: 25, timeStamp: 10 }).prevented, false);
    const dragged = emit("click", link, { timeStamp: 11 });
    assert.equal(dragged.prevented, true);
    assert.equal(dragged.stopped, true);
    // A fresh click after that drag is unaffected.
    emit("pointerdown", link);
    emit("pointerup", link, { clientX: 3, timeStamp: 20 });
    assert.equal(emit("click", link, { timeStamp: 21 }).prevented, false);
    for (const click of [{ detail: 0, timeStamp: 11 }, { timeStamp: 600 }, { target: new Element(), timeStamp: 11 }]) {
      emit("pointerdown", link, { pointerType: "pen" });
      emit("pointerup", link, { clientX: 30, timeStamp: 10 });
      assert.equal(emit("click", link, click).prevented, false);
    }
  });
});

test("touch swipes, editable selections, noninteractive text, cancelled gestures and nonprimary buttons are never intercepted", () => {
  exerciseGuard(({ Element, emit }) => {
    for (const { target, options } of [
      { target: new Element(), options: { pointerType: "touch" } },
      { target: new Element(), options: { button: 2 } },
      { target: new Element(), options: { isPrimary: false } },
      { target: new Element({ input: true }), options: {} },
      { target: new Element({ editable: true }), options: {} },
      { target: new Element({ interactive: false }), options: {} },
    ]) {
      assert.equal(emit("pointerdown", target, options).prevented, false);
      assert.equal(emit("pointermove", target, { ...options, clientX: 40 }).prevented, false);
      assert.equal(emit("pointerup", target, { ...options, clientX: 40 }).prevented, false);
      assert.equal(emit("click", target).prevented, false);
    }
    const link = new Element();
    emit("pointerdown", link);
    emit("pointermove", link, { clientX: 50 });
    emit("pointercancel", link);
    assert.equal(emit("click", link).prevented, false);
  });
});

test("guard is mounted once across the Public layout and CSS suppresses drag without changing selection, scrolling or carousel gestures", () => {
  const layout = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8");
  const css = fs.readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8");
  const guard = fs.readFileSync(path.resolve(__dirname, "../components/layout/native-drag-guard.tsx"), "utf8");
  const carousel = fs.readFileSync(path.resolve(__dirname, "../components/home/featured-universities-carousel.tsx"), "utf8");
  const carouselCss = fs.readFileSync(path.resolve(__dirname, "../components/home/featured-universities-carousel.module.css"), "utf8");
  assert.equal((layout.match(/<NativeDragGuard\s*\/>/g) ?? []).length, 1);
  assert.ok(layout.includes('<body data-public-site=""'));
  assert.match(css, /\[data-public-site\] :is\(a\[href\], img, svg, button\)\s*\{\s*-webkit-user-drag: none;/);
  assert.equal(/(?:user-select|touch-action)\s*:\s*none/.test(css), false);
  assert.equal(/stopImmediatePropagation|onPointerDown|onMouseDown|onTouchStart/.test(guard), false);
  assert.equal(/addEventListener\("(?:touch|mouse|wheel|select)/.test(guard), false);
  assert.equal(guard.includes("[drag-qa]"), false);
  assert.ok(carousel.includes("track.scrollTo"));
  assert.ok(carousel.includes('{ passive: true }'));
  assert.ok(carouselCss.includes("overflow-x: auto"));
  assert.ok(carouselCss.includes("scroll-snap-type: x mandatory"));
});
