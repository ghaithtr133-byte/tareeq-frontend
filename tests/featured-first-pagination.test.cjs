/* eslint-disable @typescript-eslint/no-require-imports -- isolated TypeScript loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

function load(relativePath, overrides = {}) {
  const filename = path.resolve(__dirname, "..", relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS }, fileName: filename,
  }).outputText;
  const instance = new Module(filename, module);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = instance.require.bind(instance);
  instance.require = (name) => name in overrides ? overrides[name] : originalRequire(name);
  instance._compile(compiled, filename);
  return instance.exports;
}

const { getFeaturedFirstPage } = load("lib/featured-first-pagination.ts");

function list(records, params) {
  const excluded = new Set((params.excludeIds ?? "").split(",").filter(Boolean));
  const filtered = records.filter((record) => !excluded.has(record.id) && (params.featured === undefined || String(record.featured) === params.featured));
  const page = params.page ?? 1, limit = params.limit ?? 4;
  return Promise.resolve({ items: filtered.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) } });
}

test("featured-first creates one deduplicated virtual sequence across page boundaries", async () => {
  const records = ["n1", "f1", "n2", "f2", "n3", "f3", "n4", "n5"].map((id) => ({ id, featured: id.startsWith("f") }));
  const first = await getFeaturedFirstPage({ page: 1, limit: 4 }, (params) => list(records, params));
  const second = await getFeaturedFirstPage({ page: 2, limit: 4 }, (params) => list(records, params));
  assert.deepEqual(first.items.map((item) => item.id), ["f1", "f2", "f3", "n1"]);
  assert.deepEqual(second.items.map((item) => item.id), ["n2", "n3", "n4", "n5"]);
  assert.equal(first.pagination.total, 8);
  assert.equal(second.pagination.totalPages, 2);
  assert.equal(new Set([...first.items, ...second.items].map((item) => item.id)).size, 8);
});

test("an explicit featured filter retains the Backend sequence without a redundant promotion request", async () => {
  const calls = [];
  const records = [{ id: "n1", featured: false }, { id: "n2", featured: false }];
  const result = await getFeaturedFirstPage({ page: 1, limit: 2, featured: "false" }, (params) => { calls.push(params); return list(records, params); });
  assert.deepEqual(result.items.map((item) => item.id), ["n1", "n2"]);
  assert.equal(calls.length, 1);
  calls.length = 0;
  await getFeaturedFirstPage({ page: 1, limit: 2, featured: "true" }, (params) => { calls.push(params); return list([{ id: "f1", featured: true }], params); });
  assert.equal(calls.length, 1);
});
