/* eslint-disable @typescript-eslint/no-require-imports -- Node's built-in test runner is intentionally CommonJS here. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.resolve(__dirname, "..", "components/public/study-abroad-filters.tsx"),
  "utf8",
);

test("desktop country search uses an explicit, non-growing 20rem wrapper", () => {
  assert.match(source, /lg:flex lg:flex-wrap lg:items-center lg:justify-start/);
  assert.match(source, /relative col-span-2 block min-w-0 lg:w-80 lg:shrink-0/);
  assert.match(source, /pr-12 lg:w-80/);
  assert.doesNotMatch(source, /lg:grid-cols-\[/);
});

test("mobile and tablet use a full-width search above two compact, touch-friendly controls", () => {
  assert.match(source, /grid grid-cols-2 gap-2/);
  assert.match(source, /min-h-11/);
  assert.match(source, /lg:w-52 lg:shrink-0/);
});
