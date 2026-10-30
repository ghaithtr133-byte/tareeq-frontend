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
  assert.match(source, /relative block lg:w-80 lg:shrink-0/);
  assert.match(source, /pr-12 lg:w-80/);
  assert.doesNotMatch(source, /lg:grid-cols-\[/);
});

test("mobile and tablet retain width-filling grid controls before the desktop breakpoint", () => {
  assert.match(source, /grid gap-3 md:grid-cols-2/);
  assert.match(source, /lg:w-52 lg:shrink-0/);
});
