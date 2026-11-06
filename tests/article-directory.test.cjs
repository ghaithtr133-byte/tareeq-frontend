/* eslint-disable @typescript-eslint/no-require-imports -- Exercise real TS/TSX with isolated Next.js runtime boundaries. */
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
    const originalRequire = instance.require.bind(instance);
    instance.require = (name) => {
      if (name in overrides) return overrides[name];
      if (name === "server-only") return {};
      if (name.startsWith("@/")) {
        const base = name.slice(2);
        return load(fs.existsSync(path.resolve(__dirname, "..", `${base}.tsx`)) ? `${base}.tsx` : `${base}.ts`);
      }
      if (name.startsWith(".")) {
        const target = path.resolve(path.dirname(filename), name);
        for (const extension of [".tsx", ".ts"]) if (fs.existsSync(`${target}${extension}`)) return load(path.relative(path.resolve(__dirname, ".."), `${target}${extension}`));
      }
      return originalRequire(name);
    };
    instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, filename);
    return instance.exports;
  }
  return load;
}
const load = loader();
const helpers = load("lib/article-directory.ts");
const demo = load("lib/mocks/public-demo-content.ts");
const { withDemoArticleDirectoryMedia } = load("lib/mocks/article-directory-fixtures.ts");

test("directory permits only supported criteria, enforces newest/12, and omits featured=false", () => {
  const params = helpers.directoryArticleParams({ search: " بحث ", country: "romania", featured: "false", sort: "popular", page: "2", limit: "50", category: "fake" });
  assert.deepEqual(params, { page: 2, limit: 12, search: "بحث", featured: undefined, country: "romania", sort: "newest" });
  assert.equal(helpers.directoryArticleParams({ page: "-1", country: "not a slug", featured: ["true"] }).page, 1);
  assert.equal(helpers.directoryArticleParams({ country: "not a slug" }).country, undefined);
  assert.equal(helpers.directoryArticleParams({ search: "x".repeat(500) }).search.length, 200);
});

test("URL construction preserves filters on pagination, resets to page one, and never emits unsupported parameters", () => {
  const values = { search: "تجهيز ملف", country: "romania", featured: "true" };
  const url = new URL(helpers.articleDirectoryHref(values, 2), "http://test.local");
  assert.equal(url.searchParams.get("page"), "2");
  for (const key of Object.keys(values)) assert.equal(url.searchParams.get(key), values[key]);
  assert.equal(url.searchParams.has("sort"), false);
  assert.equal(url.searchParams.has("category"), false);
  assert.equal(new URL(helpers.articleDirectoryHref(values), "http://test.local").searchParams.has("page"), false);
  assert.equal(helpers.articleDirectoryHref({ search: "", country: "", featured: "false" }), "/articles");
});

test("existing Demo records paginate 12 + 1 with no editorial duplicates or missing detail routes", async () => {
  const first = await demo.getDemoArticles({ page: 1, limit: 12, sort: "newest" });
  const second = await demo.getDemoArticles({ page: 2, limit: 12, sort: "newest" });
  assert.equal(first.items.length, 12);
  assert.equal(second.items.length, 1);
  assert.equal(first.pagination.total, 13);
  const split = helpers.editorialArticles(first.items);
  assert.equal(split.featured.length, 2);
  assert.ok(split.featured.every((item) => item.featured));
  const ids = [...split.featured, ...split.regular].map((item) => item.id);
  assert.equal(new Set(ids).size, 12);
  assert.deepEqual(new Set(ids), new Set(first.items.map((item) => item.id)));
  const fallback = helpers.editorialArticles([first.items[0], second.items[0]]);
  assert.equal(fallback.featured.length, 0);
  assert.equal(fallback.regular.length, 2);
  const { isDemoDetailSlug } = load("lib/mocks/public-demo-routes.ts");
  for (const item of [...first.items, ...second.items]) {
    assert.equal(isDemoDetailSlug("articles", item.slug), true);
    assert.equal((await demo.getDemoArticle(item.slug)).id, item.id);
  }
});

test("Demo search, country, combined featured and empty results use actual filtered counts", async () => {
  const country = await demo.getDemoArticles({ country: "romania", sort: "newest", limit: 12 });
  assert.ok(country.items.length > 0);
  assert.ok(country.items.every((item) => item.country?.slug === "romania"));
  const featured = await demo.getDemoArticles({ country: "romania", featured: "true", limit: 12 });
  assert.equal(featured.pagination.total, 2);
  assert.ok(featured.items.every((item) => item.featured));
  const search = await demo.getDemoArticles({ search: "IELTS", limit: 12 });
  assert.equal(search.items[0].slug, "ielts-and-admission-plan");
  assert.equal(search.pagination.total, 1);
  const empty = await demo.getDemoArticles({ search: "nonexistent-query-xyz", limit: 12 });
  assert.equal(empty.pagination.total, 0);
  assert.equal(empty.items.length, 0);
});

test("directory-only media fixtures preserve shared records, flags, pagination ids and missing-country examples", () => {
  const original = demo.publicDemoContent.articles;
  const before = JSON.stringify(original);
  const decorated = withDemoArticleDirectoryMedia(original);
  assert.equal(JSON.stringify(original), before);
  assert.deepEqual(decorated.map((item) => item.id), original.map((item) => item.id));
  assert.equal(decorated.find((item) => item.slug === "quiet-study-note").coverImageUrl, null);
  assert.equal(decorated.find((item) => item.slug === "quiet-study-note").country, null);
  assert.notEqual(decorated.filter((item) => item.featured)[0].coverImageUrl, decorated.filter((item) => item.featured)[1].coverImageUrl);
});

test("dates and image sources gracefully handle missing, malformed, and unsafe values", () => {
  assert.equal(helpers.articlePublicationDate(null), null);
  assert.equal(helpers.articlePublicationDate("invalid"), null);
  assert.ok(helpers.articlePublicationDate("2026-10-20T00:00:00.000Z"));
  for (const value of [null, "javascript:alert(1)", "//unapproved.test/img", "https://user:secret@example.test/img"]) assert.equal(helpers.articleImageSource(value), null);
  assert.equal(helpers.articleImageSource("/images/trust/library-globe.jpg"), "/images/trust/library-globe.jpg");
  assert.equal(helpers.articleImageSource("https://media.example.test/cover.jpg"), "https://media.example.test/cover.jpg");
});

const uiOverrides = {
  "next/link": ({ children, href, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/image": ({ src, alt, sizes, className, style }) => React.createElement("img", { src, alt, sizes, className, style }),
  "next/navigation": { useRouter: () => ({ push() {}, refresh() {} }), redirect: (href) => { throw new Error(`REDIRECT:${href}`); } },
};
const viewLoad = loader(uiOverrides);
test("article cards use one accessible detail link, real featured flag/date, and branded missing-image fallback", () => {
  const { ArticleDirectoryCard } = viewLoad("components/public/article-directory-card.tsx");
  const sample = { ...demo.publicDemoContent.articles[0], coverImageUrl: null, publishedAt: null, featured: false };
  const html = renderToStaticMarkup(React.createElement(ArticleDirectoryCard, { article: sample }));
  assert.equal((html.match(/<a /g) ?? []).length, 1);
  assert.ok(html.includes(`href="/articles/${sample.slug}"`));
  assert.ok(html.includes("رسم تعليمي بديل من أكاديمية طريق"));
  assert.equal(html.includes("<time"), false);
  assert.equal(html.includes("مقال مميز"), false);
  assert.equal(html.includes("دقائق قراءة"), false);
  assert.ok(html.includes("اقرأ المزيد"));
  assert.ok(html.includes("motion-safe:hover:-translate-y-0.5"));
  assert.ok(html.includes('draggable="false"'));
  assert.equal((html.match(/line-clamp-2/g) ?? []).length, 2);
  assert.equal(html.includes("line-clamp-3"), false);
  assert.ok(html.includes("group-focus-visible:underline"));
  const illustrated = renderToStaticMarkup(React.createElement(ArticleDirectoryCard, { article: demo.publicDemoContent.articles[0] }));
  assert.ok(illustrated.includes("motion-safe:group-hover:scale-[1.025]"));
});

test("numbered pagination keeps criteria, marks the current page, and hides single pages", () => {
  const { ArticleDirectoryPagination } = viewLoad("components/public/article-directory-pagination.tsx");
  const values = { search: "بحث", country: "romania", featured: "true" };
  const html = renderToStaticMarkup(React.createElement(ArticleDirectoryPagination, { values, pagination: { page: 3, totalPages: 10, total: 120, limit: 12 } }));
  assert.ok(html.includes('aria-current="page"'));
  assert.ok(html.includes('country=romania'));
  assert.ok(html.includes('featured=true'));
  assert.ok(html.includes('page=4#article-results'));
  assert.ok(html.includes("…"));
  assert.equal(renderToStaticMarkup(React.createElement(ArticleDirectoryPagination, { values, pagination: { page: 1, totalPages: 1, total: 1, limit: 12 } })), "");
});

test("toolbar uses only supported controls and a featured-only checkbox, with active reset chips", () => {
  const { ArticleDirectoryFilters } = viewLoad("components/public/article-directory-filters.tsx");
  const html = renderToStaticMarkup(React.createElement(ArticleDirectoryFilters, { values: { search: "IELTS", country: "romania", featured: "true" }, countries: [{ value: "romania", label: "رومانيا" }], optionError: false }, "results"));
  assert.equal((html.match(/<select /g) ?? []).length, 1);
  assert.ok(html.includes('type="checkbox"'));
  assert.ok(html.includes("مسح الكل"));
  assert.equal(html.includes("الأحدث أولاً"), false);
  for (const text of ["غير مميزة", "قصص نجاح", "category", "newsletter"]) assert.equal(html.includes(text), false);
});

test.skip("legacy server-rendered Articles route coverage; replaced by client-shell coverage", async () => {
  const calls = [];
  const local = loader({ ...uiOverrides,
    "@/lib/api-client/public-content": { getArticles: async (params) => { calls.push(params); return demo.getDemoArticles(params); }, getCountries: demo.getDemoCountries },
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
  });
  const page = local("app/articles/page.tsx").default;
  const html = renderToStaticMarkup(await page({ searchParams: Promise.resolve({}) }));
  const hero = html.match(/<section aria-labelledby="articles-title"[\s\S]*?<\/section>/)[0];
  assert.ok(fs.existsSync(path.resolve(__dirname, "../public/images/articles/articles-hero.png")));
  assert.ok(hero.includes('src="/images/articles/articles-hero.png"'));
  assert.ok(hero.includes("object-cover object-left"));
  assert.equal(hero.includes("<svg"), false);
  assert.ok(hero.includes("مقالات ونصائح"));
  assert.ok(hero.includes("اكتشف مقالاتنا التعليمية التي تساعدك في رحلتك الأكاديمية، وتقدم لك نصائح وخبرات مهمة للدراسة في الخارج."));
  assert.ok(html.includes('text-[#17669C]">13</strong> مقال'));
  assert.equal((html.match(/data-article-card=/g) ?? []).length, 12);
  assert.equal(calls[0].sort, "newest");
  assert.equal(calls[0].limit, 12);
});

test("Live adapter requests only the selected API page and propagates failure without Demo fallback", async () => {
  const calls = [];
  let failure = false;
  const local = loader({ "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/lib/api-client/server-client": { serverApiClient: { get: async (...args) => { calls.push(args); if (failure) throw new Error("offline"); return { data: { success: true, data: { items: [], pagination: { page: 2, limit: 12, total: 30, totalPages: 3 } } } }; } } } });
  const { getArticles } = local("lib/api-client/public-content.ts");
  const params = helpers.directoryArticleParams({ search: "بحث", country: "romania", featured: "true", page: "2" });
  const result = await getArticles(params);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], ["/articles", { params }]);
  assert.equal(result.pagination.page, 2);
  failure = true;
  await assert.rejects(getArticles(params), /offline/);
  assert.equal(calls.length, 2);
});

test.skip("legacy server-rendered Articles route coverage; replaced by client-shell coverage", async () => {
  let mode = "empty";
  const requests = [];
  const local = loader({ ...uiOverrides,
    "@/lib/api-client/public-content": { getArticles: async (params) => { requests.push(params); if (mode === "error") throw new Error("offline"); return { items: [], pagination: { page: params.page, limit: 12, total: mode === "range" ? 13 : 0, totalPages: mode === "range" ? 2 : 0 } }; }, getCountries: async () => ({ items: [] }) },
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
  });
  const { default: ArticlesPage } = local("app/articles/page.tsx");
  const props = { searchParams: Promise.resolve({ search: "بحث", country: "romania", page: "1" }) };
  const empty = renderToStaticMarkup(await ArticlesPage(props));
  assert.equal(empty.includes('id="articles-contact-title"'), false, "Directory keeps the reading journey free of a generic closing consultation banner");
  assert.ok(empty.includes("لا توجد مقالات تطابق بحثك"));
  mode = "error";
  const unavailable = renderToStaticMarkup(await ArticlesPage(props));
  assert.ok(unavailable.includes("يتعذر تحميل المقالات حالياً"));
  assert.equal(unavailable.includes("لا توجد مقالات تطابق بحثك"), false);
  assert.ok(unavailable.includes('value="romania" selected=""'), "Refresh retry retains the active country rather than replacing the URL");
  assert.equal(requests[0].limit, 12);
  mode = "range";
  await assert.rejects(ArticlesPage({ searchParams: Promise.resolve({ page: "999" }) }), /REDIRECT:\/articles\?page=2/);
});

const live = load("lib/article-directory-live.ts");
const articleList = (items = [], page = 1, total = items.length) => ({ items, pagination: { page, limit: 12, total, totalPages: Math.ceil(total / 12) } });
const liveArticle = { id: "live-one", slug: "published-article", titleAr: "مقال منشور", summaryAr: "ملخص من المصدر", featured: true, publishedAt: "2026-10-20T00:00:00Z", coverImageUrl: "https://media.example.test/cover.jpg", coverImageAltAr: "غلاف المقال الحقيقي" };
function liveRoute({ data = articleList([liveArticle]), failed = false, countriesFailed = false, totalCountries = 1 } = {}) {
  const calls = [];
  const scoped = loader({ ...uiOverrides, "@/lib/public-content-mode": { isPublicDemoMode: () => false }, "@/lib/api-client/server-client": { serverApiClient: { get: async (path, config) => {
    calls.push({ path, params: config.params });
    if ((path === "/articles" && failed) || (path === "/countries" && countriesFailed)) throw Error("offline");
    return { data: { success: true, data: path === "/articles" ? data : { items: [{ id: "c1", slug: "romania", nameAr: "رومانيا" }], pagination: { page: 1, limit: 50, total: totalCountries, totalPages: Math.ceil(totalCountries / 50) } } } };
  } } } });
  return { calls, page: scoped("app/articles/page.tsx").default };
}

test("Live article projection accepts omitted status, validates identity/pages and preserves partial slots without fake dates", () => {
  const parsed = live.parseArticleDirectory(articleList([liveArticle]), 1);
  assert.equal(parsed.items[0].titleAr, liveArticle.titleAr);
  for (const data of [null, {}, articleList([{ ...liveArticle, status: "DRAFT" }]), articleList([{ ...liveArticle, slug: "../bad" }]), articleList([liveArticle, liveArticle]), articleList([], 1, 4)]) assert.throws(() => live.parseArticleDirectory(data, 1));
  const partial = live.parseArticleDirectory(articleList([{ id: "partial", slug: "partial-article", coverImageUrl: "javascript:alert(1)", createdAt: "2026-01-01T00:00:00Z" }]), 1).items[0];
  const { ArticleDirectoryCard } = viewLoad("components/public/article-directory-card.tsx");
  const html = renderToStaticMarkup(React.createElement(ArticleDirectoryCard, { article: partial, live: true }));
  for (const label of ["عنوان المقال", "ملخص المقال", "تاريخ النشر", "صورة المقال"]) assert.ok(html.includes(`${label} (غير متوفر حالياً)`), label);
  assert.equal(html.includes("<time"), false);
  assert.equal(html.includes("2026-01-01"), false);
  assert.equal(html.includes("دقائق قراءة"), false);
  for (const date of [null, "invalid", "1", "2026-02-31T00:00:00Z"]) assert.equal(live.articleDirectoryDate(date), null);
  const original = demo.publicDemoContent.articles[0];
  assert.equal(live.parseArticleDirectory(articleList([{ ...original, summaryAr: "" }]), 1, [original]).items[0].summaryAr, `${original.summaryAr} (غير متوفر حالياً)`);
  assert.equal(live.parseArticleDirectory(articleList([{ ...original, slug: "different", summaryAr: "" }]), 1, [original]).items[0].summaryAr, "ملخص المقال (غير متوفر حالياً)");
});

test.skip("legacy server-rendered Articles route coverage; replaced by client-shell coverage", async () => {
  const route = liveRoute({ data: articleList([liveArticle, { ...liveArticle, id: "other", slug: "other-article", featured: false }], 2, 14) });
  const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({ page: "2", search: "بحث", country: "romania", featured: "true", category: "ignored", sort: "manual" }) }));
  assert.deepEqual(route.calls, [{ path: "/articles", params: { page: 2, limit: 12, search: "بحث", featured: "true", country: "romania", sort: "newest" } }, { path: "/countries", params: { limit: 50, sort: "manual" } }]);
  assert.equal((html.match(/data-article-card=/g) ?? []).length, 2);
  assert.equal((html.match(/data-prominent="true"/g) ?? []).length, 1);
  assert.ok(html.includes('href="/articles/published-article"'));
  assert.ok(html.includes('src="https://media.example.test/cover.jpg"'));
  assert.ok(html.includes('alt="غلاف المقال الحقيقي"'));
  assert.ok(html.includes('data-article-featured="true"') || html.includes("data-article-featured"));
  assert.ok(html.includes("data-balanced-cards"));
  const split = helpers.editorialArticles([liveArticle], true);
  assert.equal(split.featured.length, 1);
  assert.equal(split.regular.length, 0);
  const unfeatured = helpers.editorialArticles([{ ...liveArticle, featured: false }], true);
  assert.equal(unfeatured.featured.length, 0);
  assert.equal(unfeatured.regular.length, 1);
});

test.skip("legacy server-rendered Articles route coverage; replaced by client-shell coverage", async () => {
  for (const [config, filters, expected] of [[{ data: articleList() }, {}, "لا توجد مقالات منشورة حالياً"], [{ data: articleList() }, { search: "no-match" }, "لا توجد مقالات تطابق بحثك"], [{ failed: true }, {}, "يتعذر تحميل المقالات حالياً"], [{ data: { items: [], pagination: { total: 3 } } }, {}, "يتعذر تحميل المقالات حالياً"]]) {
    const route = liveRoute(config);
    const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve(filters) }));
    assert.ok(html.includes(expected));
    assert.ok(html.includes('id="articles-title"'));
    assert.ok(html.includes('aria-label="البحث وتصفية المقالات"'));
    assert.ok(html.includes('id="article-results"'));
    assert.equal((html.match(/data-article-card=/g) ?? []).length, 0);
    if (expected.includes("يتعذر")) { assert.ok(html.includes("إعادة المحاولة")); assert.equal(html.includes("لا توجد مقالات"), false); }
  }
  const route = liveRoute({ countriesFailed: true });
  const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({}) }));
  assert.ok(html.includes("مقال منشور"));
  assert.ok(html.includes("تعذّر تحميل خيارات الدول"));
  assert.ok(html.includes("إعادة المحاولة"));
  const limited = liveRoute({ totalCountries: 60 });
  assert.ok(renderToStaticMarkup(await limited.page({ searchParams: Promise.resolve({}) })).includes("أول 50 دولة"));
});

test.skip("legacy server-rendered Articles route coverage; replaced by client-shell coverage", async () => {
  for (const count of [1, 2, 3]) {
    const route = liveRoute({ data: articleList(Array.from({ length: count }, (_, index) => ({ ...liveArticle, id: `id-${index}`, slug: `article-${index}`, featured: false }))) });
    const html = renderToStaticMarkup(await route.page({ searchParams: Promise.resolve({}) }));
    assert.equal((html.match(/data-article-card=/g) ?? []).length, count);
    for (const token of ["justify-center", "xl:[--card-columns:4]", "[&amp;&gt;*]:grow-0", "aspect-[2/1]"]) assert.ok(html.includes(token));
  }
  const scoped = loader({ ...uiOverrides, "@/lib/public-content-mode": { isPublicDemoMode: () => true }, "@/lib/api-client/public-content": { getArticles: demo.getDemoArticles, getCountries: demo.getDemoCountries } });
  const html = renderToStaticMarkup(await scoped("app/articles/page.tsx").default({ searchParams: Promise.resolve({}) }));
  assert.equal((html.match(/data-article-card=/g) ?? []).length, 12);
  assert.equal((html.match(/data-prominent="true"/g) ?? []).length, 2);
});
