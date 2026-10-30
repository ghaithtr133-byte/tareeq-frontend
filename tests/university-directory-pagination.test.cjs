/* eslint-disable @typescript-eslint/no-require-imports -- isolated CommonJS loader substitutes test fixtures for Next.js aliases. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");

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
  instance.require = (name) => name in overrides ? overrides[name] : originalRequire(name);
  instance._compile(compiled, filename);
  return instance.exports;
}

const universities = Array.from({ length: 13 }, (_, index) => ({
  id: `university-${index}`, nameAr: `جامعة ${index}`, nameEn: null,
  officialName: `University ${index}`, overviewAr: "نموذج", cityAr: "بوخارست",
  country: { slug: index < 12 ? "romania" : "turkey" }, featured: true,
  publishedAt: `2026-10-${String(28 - index).padStart(2, "0")}`,
}));
const scholarships = Array.from({ length: 14 }, (_, index) => ({
  id: `scholarship-${index}`, universityId: `university-${index % 13}`,
  applicationStatus: index % 2 ? "CLOSED" : "OPEN",
}));
const { getDemoDirectory } = loadTypeScript("lib/university-directory-demo.ts", {
  "@/lib/mocks/public-demo-content": { publicDemoContent: { universities, scholarships } },
});
const { queryString, universitiesParams } = loadTypeScript("lib/public-search-params.ts");

test("filtered demo pagination keeps all matching university relationships across pages", () => {
  const first = getDemoDirectory({ country: "romania", page: 1, limit: 6, sort: "newest" }, {}, true);
  const second = getDemoDirectory({ country: "romania", page: 2, limit: 6, sort: "newest" }, {}, true);
  assert.equal(first.universities.pagination.totalPages, 2);
  assert.equal(first.universities.items.length, 6);
  assert.equal(second.universities.items.length, 6);
  assert.equal(new Set([...first.universities.items, ...second.universities.items].map((item) => item.id)).size, 12);
  assert.deepEqual(first.scholarships.map((item) => item.id), second.scholarships.map((item) => item.id));
  assert.equal(first.scholarships.length, 13);
  assert.ok(first.scholarships.every((item) => item.universityId !== "university-12"));
  assert.equal(getDemoDirectory({ page: 1, limit: 6 }, {}, false).scholarships.length, 0);
});

test("page URLs preserve filters and sorting, and parse on return", () => {
  const query = queryString({ search: "طب", country: "romania", major: "medicine", sort: "name" }, { page: "2" });
  const values = Object.fromEntries(new URLSearchParams(query));
  assert.deepEqual(values, { search: "طب", country: "romania", major: "medicine", sort: "name", page: "2" });
  assert.equal(universitiesParams(values).page, 2);
  assert.equal(universitiesParams(values).country, "romania");
});

test("the actual load-more component reveals four at a time and hides its button", () => {
  let count = 4;
  const mockedReact = { ...React, useState: () => [count, (update) => { count = update(count); }] };
  const { UniversityRelatedScholarships } = loadTypeScript("components/public/university-related-scholarships.tsx", { react: mockedReact });
  const cards = Array.from({ length: 10 }, (_, index) => React.createElement("span", { key: index }, index));
  const render = () => UniversityRelatedScholarships({ cards }).props.children;
  let view = render();
  assert.equal(view[0].props.children.length, 4);
  view[1].props.children.props.onClick();
  view = render();
  assert.equal(view[0].props.children.length, 8);
  view[1].props.children.props.onClick();
  view = render();
  assert.equal(view[0].props.children.length, 10);
  assert.equal(view[1], null);
  assert.equal(new Set(view[0].props.children.map((card) => card.key)).size, 10);
});
