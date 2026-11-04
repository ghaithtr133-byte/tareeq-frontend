/* eslint-disable @typescript-eslint/no-require-imports -- Render real components with isolated Next.js boundaries. */
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
      const target = name.startsWith("@/") ? path.resolve(__dirname, "..", name.slice(2)) : name.startsWith(".") ? path.resolve(path.dirname(filename), name) : null;
      if (target) for (const extension of [".tsx", ".ts"]) if (fs.existsSync(target + extension)) return load(path.relative(path.resolve(__dirname, ".."), target + extension));
      return original(name);
    };
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
    return instance.exports;
  }
  return load;
}
const boundary = {
  "next/link": ({ children, ...props }) => React.createElement("a", props, children),
  "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
};
const load = loader(boundary);
const { PublicPageSkeleton, SkeletonResults } = load("components/public/content-skeletons.tsx");
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));

test("every audited inner route has the matching loading variant, rather than inheriting a directory for its detail", () => {
  const routes = { "study-abroad": "destinations", "study-abroad/[slug]": "country", universities: "universities", "universities/[slug]": "university", scholarships: "scholarships", "scholarships/[slug]": "scholarship", services: "services", "services/[slug]": "service", articles: "articles", "articles/[slug]": "article" };
  for (const [route, page] of Object.entries(routes)) {
    const Loading = load(`app/${route}/loading.tsx`).default;
    const html = render(Loading);
    assert.ok(html.includes(`data-public-skeleton="${page}"`), route);
    assert.ok(html.includes('aria-busy="true"'));
    assert.equal((html.match(/role="status"/g) ?? []).length, 1);
    assert.equal(/<(?:a|button|input|select)\b/.test(html), false, "Skeletons never impersonate interactive controls");
  }
});

test("card variants expose actual image/title/metadata/CTA geometry with safe responsive grids and reduced motion", () => {
  for (const kind of ["country", "university", "scholarship", "article", "service"]) {
    const html = render(SkeletonResults, { kind, count: 3 });
    assert.ok(html.includes(`data-skeleton-grid="${kind}"`));
    assert.equal((html.match(/flex min-w-0 flex-col overflow-hidden/g) ?? []).length, 3);
    assert.ok(html.includes("motion-safe:animate-pulse motion-reduce:animate-none"));
    assert.ok(html.includes('aria-hidden="true"'));
    assert.equal(/<(?:a|button|input|select)\b/.test(html), false);
  }
  assert.ok(render(PublicPageSkeleton, { page: "universities" }).includes("lg:grid-cols-[18rem_minmax(0,1fr)]"));
  assert.ok(render(PublicPageSkeleton, { page: "country" }).includes("md:grid-cols-[3fr_2fr]"));
  assert.ok(render(PublicPageSkeleton, { page: "scholarship" }).includes("lg:grid-cols-[1fr_2.2fr]"));
});

test("Homepage fallback reuses the actual static hero and never fabricates counts; other routes use a neutral shell", () => {
  const homeLoad = loader({ ...boundary, "next/navigation": { usePathname: () => "/" } })("app/loading.tsx").default;
  const html = render(homeLoad);
  assert.ok(html.includes('id="hero-title"'));
  assert.ok(html.includes("study-abroad-student-landmarks.png"));
  assert.ok(html.includes("طريقك نحو جامعة أحلامك يبدأ من هنا"));
  assert.ok(html.includes('href="/study-abroad"'));
  assert.ok(html.includes("lg:min-h-[29rem]"));
  assert.equal(html.includes("أرقام للعرض التجريبي فقط"), false);
  assert.equal((html.match(/data-home-loading-section=/g) ?? []).length, 6);
  assert.ok(html.includes('data-home-loading-section="faqs"'));
  assert.ok(html.includes("lg:grid-cols-4"));
  const other = loader({ ...boundary, "next/navigation": { usePathname: () => "/contact" } })("app/loading.tsx").default;
  assert.equal(render(other).includes('id="hero-title"'), false);
});

test("loading integration stays inside genuine pending states and does not add fetching or delays", () => {
  const read = (file) => fs.readFileSync(path.resolve(__dirname, "..", file), "utf8");
  for (const file of ["article-directory-filters", "scholarship-directory-filters", "study-abroad-filters"]) {
    const source = read(`components/public/${file}.tsx`);
    assert.ok(source.includes("SkeletonResults"));
    assert.ok(source.includes("children"));
  }
  const related = read("components/public/university-detail-scholarships.tsx");
  assert.ok(related.includes("query.isPending && !items.length"));
  assert.ok(related.includes("query.isError || query.isFetchNextPageError"));
  assert.ok(related.includes("query.isFetchingNextPage ?"));
  assert.equal(read("components/public/content-skeletons.tsx").includes("setTimeout"), false);
});

test("Ticker fetch no longer blocks the root loading shell; empty/error responses still omit it", async () => {
  const page = { items: [{ id: "example", title: "مقال", href: "/articles/study-guide" }], page: 1, totalPages: 1 };
  const tickerBoundary = { "@/components/layout/articles-ticker": { ArticlesTicker: ({ initialPage }) => React.createElement("div", { "data-ticker-items": initialPage.items.length }) } };
  for (const result of [page, { ...page, items: [] }, null]) {
    let calls = 0;
    const local = loader({ ...tickerBoundary, "@/lib/article-ticker-server": { getArticleTickerPage: async () => { calls++; if (!result) throw Error("offline"); return result; } } });
    const html = renderToStaticMarkup(await local("components/layout/async-articles-ticker.tsx").AsyncArticlesTicker());
    assert.equal(calls, 1);
    assert.equal(html.includes("data-ticker-items"), !!result?.items.length);
  }
  const layout = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8");
  assert.ok(layout.includes("<Suspense fallback="));
  assert.equal(layout.includes("await getArticleTickerPage"), false);
});

// Reuse the same real renderer for local, non-route visual fixtures when needed.
module.exports = { loader, boundary, render };
