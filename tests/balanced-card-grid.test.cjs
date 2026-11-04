/* eslint-disable @typescript-eslint/no-require-imports -- Exercise TS/TSX with isolated Next runtime boundaries. */
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
    const original = instance.require.bind(instance);
    instance.require = (name) => {
      if (name in overrides) return overrides[name];
      if (name === "server-only") return {};
      if (name.endsWith(".module.css")) return new Proxy({}, { get: (_, key) => key === "__esModule" ? false : key });
      const target = name.startsWith("@/") ? path.resolve(__dirname, "..", name.slice(2)) : name.startsWith(".") ? path.resolve(path.dirname(filename), name) : null;
      if (target) for (const extension of [".tsx", ".ts"]) if (fs.existsSync(target + extension)) return load(path.relative(path.resolve(__dirname, ".."), target + extension));
      return original(name);
    };
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
    return instance.exports;
  }
  return load;
}
const local = loader();
const { BalancedCardGrid } = local("components/ui/balanced-card-grid.tsx");
test("balanced rows retain exactly the provided cards at every item count without filler cards", () => {
  for (const count of [0, 1, 2, 3, 4, 5, 7, 12]) {
    const cards = Array.from({ length: count }, (_, index) => React.createElement("a", { key: index, href: "/universities/item-" + index }, "بطاقة " + index));
    const html = renderToStaticMarkup(React.createElement(BalancedCardGrid, { columns: { sm: 2, lg: 3, xl: 4 } }, cards));
    assert.equal((html.match(/<a /g) ?? []).length, count);
    for (const token of ["justify-center", "flex-wrap", "grow-0", "max-w-[32rem]", "sm:[--card-columns:2]", "lg:[--card-columns:3]", "xl:[--card-columns:4]"]) assert.ok(html.includes(token), token);
    assert.equal(html.includes("justify-between"), false);
    assert.equal(html.includes("grid-cols"), false);
  }
});
test("spacing and attributes remain configurable without touching card content or navigation", () => {
  const html = renderToStaticMarkup(React.createElement(BalancedCardGrid, { gap: 4, id: "results", className: "mt-6", columns: { md: 2, xl: 5 } }, React.createElement("article", null, "بيانات منشورة")));
  assert.ok(html.includes('id="results"'));
  assert.ok(html.includes("--card-gap:1rem"));
  assert.ok(html.includes("md:[--card-columns:2]"));
  assert.ok(html.includes("xl:[--card-columns:5]"));
  assert.ok(html.includes("بيانات منشورة"));
});

