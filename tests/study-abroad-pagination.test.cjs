/* eslint-disable @typescript-eslint/no-require-imports -- isolated CommonJS loader substitutes Next.js-only modules. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

function loadTypeScript(relativePath, overrides = {}) {
  const filename = path.resolve(__dirname, "..", relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  }).outputText;
  const instance = new Module(filename, module);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = instance.require.bind(instance);
  instance.require = (name) => (name in overrides ? overrides[name] : originalRequire(name));
  instance._compile(compiled, filename);
  return instance.exports;
}

class ApiError extends Error {}
const { getDemoCountries } = loadTypeScript("lib/mocks/public-demo-content.ts", {
  "server-only": {},
  "@/api/error": { ApiError },
});
const { queryString } = loadTypeScript("lib/public-search-params.ts");
const { paginationItems } = loadTypeScript("components/public/study-abroad-pagination.tsx", {
  "next/link": () => null,
  "lucide-react": { ChevronLeft: () => null, ChevronRight: () => null },
  "@/lib/public-search-params": { queryString },
});

test("demo countries use six-item pages and replace rather than duplicate results", async () => {
  const first = await getDemoCountries({ page: 1, limit: 6, sort: "manual" });
  const second = await getDemoCountries({ page: 2, limit: 6, sort: "manual" });

  assert.equal(first.pagination.limit, 6);
  assert.equal(first.pagination.total, 7);
  assert.equal(first.pagination.totalPages, 2);
  assert.equal(first.items.length, 6);
  assert.equal(second.items.length, 1);
  assert.equal(new Set([...first.items, ...second.items].map((country) => country.id)).size, 7);
});

test("country filters retain their criteria in selected pagination URLs", () => {
  const query = queryString(
    { search: "تركيا", featured: "true", sort: "newest" },
    { page: "2" },
  );
  assert.deepEqual(Object.fromEntries(new URLSearchParams(query)), {
    search: "تركيا",
    featured: "true",
    sort: "newest",
    page: "2",
  });
});

test("numbered pagination adds compact ellipses only for large result sets", () => {
  assert.deepEqual(paginationItems(2, 4), [1, 2, 3, 4]);
  assert.deepEqual(paginationItems(5, 12), [1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 12]);
  assert.deepEqual(paginationItems(11, 12), [1, "ellipsis-start", 8, 9, 10, 11, 12]);
});
