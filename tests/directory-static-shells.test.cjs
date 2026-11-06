/* eslint-disable @typescript-eslint/no-require-imports -- Node's built-in test runner uses CommonJS in this suite. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const directories = ["articles", "scholarships", "services", "study-abroad", "universities"];

test("directory pages are static shells and retain Suspense boundaries for URL-driven client content", () => {
  for (const directory of directories) {
    const page = read(`app/${directory}/page.tsx`);
    assert.equal(page.includes('force-dynamic'), false, directory);
    assert.ok(page.includes("Suspense"), directory);
  }
});

test("directory client regions read browser URL state and use the public browser API adapters", () => {
  for (const component of ["articles-directory-live", "scholarships-directory-live", "study-abroad-directory-live", "universities-directory-live"]) {
    const source = read(`components/public/${component}.tsx`);
    assert.ok(source.includes("useSearchParams"), component);
    assert.ok(source.includes("useQuery"), component);
    assert.ok(source.includes("getBrowser"), component);
  }
  assert.ok(read("components/public/services-directory-live.tsx").includes("getBrowserServices"));
});

test("browser adapters retain bounded backend pagination and never introduce a Next proxy route", () => {
  const source = read("lib/api-client/public-content-browser.ts");
  for (const endpoint of ["/articles", "/scholarships", "/services", "/countries", "/universities"]) assert.ok(source.includes(endpoint));
  assert.equal(fs.existsSync(path.join(root, "app/api/public-content")), false);
  assert.ok(read("components/public/live-university-related-scholarships.tsx").includes("loadBrowserRelatedUniversityScholarships"));
});
