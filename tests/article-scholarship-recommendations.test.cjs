/* eslint-disable @typescript-eslint/no-require-imports -- isolated TypeScript loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

function load(overrides) {
  const filename = path.resolve(__dirname, "../lib/article-scholarship-recommendations.ts");
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS }, fileName: filename }).outputText;
  const instance = new Module(filename, module);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = instance.require.bind(instance);
  instance.require = (name) => name in overrides ? overrides[name] : originalRequire(name);
  instance._compile(compiled, filename);
  return instance.exports;
}

const item = (id, effectiveApplicationStatus = "OPEN") => ({ id, slug: `scholarship-${id}`, titleAr: id, status: "PUBLISHED", effectiveApplicationStatus, country: null });

test("article scholarship recommendations preserve open manual order, deduplicate, and use bounded open fallbacks", async () => {
  const calls = [];
  const { recommendArticleScholarships } = load({
    "server-only": {},
    "@/lib/article-detail-live": { parseArticleScholarships: (rows) => rows },
    "@/lib/api-client/public-content": {
      getScholarships: async (params) => {
        calls.push(params);
        if (params.country) return { items: [item("closed-country", "CLOSED"), item("country")], pagination: {} };
        return { items: [item("country"), item("global-featured")], pagination: {} };
      },
    },
  });
  const result = await recommendArticleScholarships([item("closed-manual", "CLOSED"), item("manual"), item("manual")], "romania");
  assert.deepEqual(result.scholarships.map((row) => row.id), ["manual", "country", "global-featured"]);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0], { country: "romania", applicationStatus: "OPEN", limit: 2, excludeIds: "manual" });
  assert.deepEqual(calls[1], { featured: "true", applicationStatus: "OPEN", limit: 1, excludeIds: "manual,country" });
});
