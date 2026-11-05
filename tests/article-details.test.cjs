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
const demo = load("lib/mocks/public-demo-content.ts");
const helpers = load("lib/article-details.ts");
const { buildArticleToc } = load("lib/article-toc.ts");
const { demoArticleDetails } = load("lib/mocks/article-detail-fixtures.ts");
const original = demo.publicDemoContent.articles[0];

test("Live related scholarships follow the documented projection, Admin order, media and authoritative status", () => {
  const { parseArticleScholarships } = load("lib/article-detail-live.ts");
  const rows = demo.publicDemoContent.scholarships.slice(0, 2).map((row) => ({ ...row, status: undefined, imageUrl: "https://example.com/cover.jpg", effectiveApplicationStatus: "CLOSED" }));
  const result = parseArticleScholarships(rows);
  assert.deepEqual(result.map((row) => row.id), rows.map((row) => row.id));
  assert.equal(result[0].status, "PUBLISHED");
  assert.equal(result[0].effectiveApplicationStatus, "CLOSED");
  assert.equal(result[0].imageUrl, rows[0].imageUrl);
  assert.deepEqual(parseArticleScholarships([]), []);
  for (const value of [null, undefined, {}, [{ ...rows[0], status: "DRAFT" }], [{ ...rows[0], slug: "../unsafe" }], [rows[0], rows[0]]]) assert.throws(() => parseArticleScholarships(value));
  assert.equal(parseArticleScholarships([{ ...rows[0], effectiveApplicationStatus: null }])[0].effectiveApplicationStatus, null);
});

test("latest recommendations exclude the current article, unpublished and duplicate records", () => {
  const articles = demo.publicDemoContent.articles;
  const result = helpers.latestOtherArticles([original, articles[1], articles[1], { ...articles[2], status: "DRAFT" }, articles[3], articles[4], articles[5]], original.id);
  assert.equal(result.length, 3);
  assert.deepEqual(result.map((item) => item.id), [articles[1].id, articles[3].id, articles[4].id]);
});

test("isolated Demo fixtures cover multiple/single/no relations, repeated headings and missing media without mutating shared content", () => {
  const before = JSON.stringify(demo.publicDemoContent);
  const rich = demoArticleDetails(original);
  assert.equal(rich.scholarships.length, 3);
  assert.ok(rich.scholarships.every((item) => item.status === "PUBLISHED"));
  assert.ok(rich.scholarships.some((item) => item.applicationStatus === "CLOSED"));
  const toc = buildArticleToc(rich.article.bodyAr);
  assert.equal(new Set(toc.map((item) => item.id)).size, toc.length);
  assert.ok(toc.filter((item) => item.text === "تجهيز الوثائق").length > 1);
  assert.equal(demoArticleDetails(demo.publicDemoContent.articles[1]).scholarships.length, 1);
  const short = demoArticleDetails(demo.publicDemoContent.articles.find((item) => item.slug === "quiet-study-note"));
  assert.equal(short.scholarships.length, 0);
  assert.equal(short.article.coverImageUrl, null);
  assert.deepEqual(buildArticleToc(short.article.bodyAr), []);
  assert.equal(JSON.stringify(demo.publicDemoContent), before);
});

const ui = {
  "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  "next/image": ({ src, alt, className, style }) => React.createElement("img", { src, alt, className, style }),
};
const viewLoad = loader(ui);
test("rich-text renderer shares stable TOC ids, groups sequential list blocks and safely escapes text", () => {
  const { ArticleBlocks } = viewLoad("components/public/public-content.tsx");
  const blocks = [...demoArticleDetails(original).article.bodyAr, { type: "paragraph", text: '<script>alert("unsafe")</script>' }];
  const html = renderToStaticMarkup(React.createElement(ArticleBlocks, { blocks }));
  for (const item of buildArticleToc(blocks)) assert.ok(html.includes(`id="${item.id}"`));
  assert.equal((html.match(/<ol /g) ?? []).length, 2);
  assert.equal((html.match(/<ul /g) ?? []).length, 1);
  assert.equal((html.match(/<li(?:\s|>)/g) ?? []).length, 7);
  assert.ok(html.includes("<blockquote"));
  assert.equal(html.includes("<script>"), false);
  assert.ok(html.includes("&lt;script&gt;"));
});

test("mobile TOC is collapsed by default, uses actual heading hrefs, and omits headingless navigation", () => {
  const { ArticleTableOfContents } = viewLoad("components/public/article-toc.tsx");
  const items = buildArticleToc(original.bodyAr);
  const html = renderToStaticMarkup(React.createElement(ArticleTableOfContents, { items, variant: "mobile" }));
  assert.ok(html.includes("<details"));
  assert.equal(html.includes(" open="), false);
  for (const item of items) assert.ok(html.includes(`href="#${item.id}"`));
  assert.equal(renderToStaticMarkup(React.createElement(ArticleTableOfContents, { items: [], variant: "desktop" })), "");
});

test("recommendation cards omit unpublished scholarships and preserve closed status without fabricated funding", () => {
  const { ScholarshipRecommendationList, ArticleRecommendationList } = viewLoad("components/public/article-recommendations.tsx");
  const closed = { ...demo.publicDemoContent.scholarships[0], effectiveApplicationStatus: "CLOSED" };
  const html = renderToStaticMarkup(React.createElement(ScholarshipRecommendationList, { scholarships: [closed, { ...closed, id: "draft", status: "DRAFT" }] }));
  assert.equal((html.match(/data-related-scholarship=/g) ?? []).length, 1);
  assert.ok(html.includes("التقديم مغلق"));
  assert.equal(html.includes("تمويل كامل"), false);
  assert.ok(html.includes("رسم أكاديمي بديل"));
  assert.equal(html.includes("عرض جميع المنح"), false);
  const latest = renderToStaticMarkup(React.createElement(ArticleRecommendationList, { articles: [{ ...original, publishedAt: null, coverImageUrl: null }] }));
  assert.equal(latest.includes("<time"), false);
  assert.ok(latest.includes("رسم أكاديمي بديل"));
});

test("all consultation links use the configured WhatsApp destination and have no application form", () => {
  const { ArticleConsultation } = viewLoad("components/public/article-consultation.tsx");
  const { createWhatsappUrl } = viewLoad("lib/whatsapp.ts");
  const html = renderToStaticMarkup(React.createElement(ArticleConsultation, { titleId: "article-test-consultation" }));
  assert.ok(html.includes(createWhatsappUrl()));
  assert.ok(html.includes("تواصل عبر واتساب"));
  assert.equal(html.includes("قدّم الآن"), false);
  assert.equal(html.includes("<form"), false);
  assert.ok(html.includes('rel="noopener noreferrer"'));
});

test("Live route uses documented relatedScholarships without per-scholarship calls, bounded ID lookups and independent states", async () => {
  const calls = [];
  let failure;
  let latestFailure = false;
  let relationFailure = false;
  let record = { ...original, status: undefined, relatedScholarships: [{ ...demo.publicDemoContent.scholarships[0], status: undefined, effectiveApplicationStatus: "CLOSED", imageUrl: "https://example.com/real-cover.jpg" }] };
  class ApiError extends Error { constructor(status) { super("API failure"); this.status = status; } }
  const local = loader({ ...ui,
    "@/api/public-content": {
      getArticle: async (slug) => { if (failure) throw failure; assert.equal(slug, original.slug); return record; },
      getArticles: async (params) => { calls.push(["latest", params]); if (latestFailure) throw Error("offline"); return { items: demo.publicDemoContent.articles.slice(0, 4).map((row) => ({ ...row, status: undefined })), pagination: { page: 1, limit: 4, total: 4, totalPages: 1 } }; },
      getScholarship: async () => { throw Error("N+1 must not be called"); },
      getCountries: async (params) => { calls.push(["countries", params]); if (relationFailure) throw Error("offline"); return { items: [original.country], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } }; },
      getUniversities: async (params) => { calls.push(["universities", params]); return { items: [original.university], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } }; },
    },
    "@/api/error": { ApiError },
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "next/navigation": { notFound: () => { throw new Error("NOT_FOUND"); }, useRouter: () => ({ refresh() {} }) },
  });
  const route = local("app/articles/[slug]/page.tsx");
  const props = { params: Promise.resolve({ slug: original.slug }) };
  const html = renderToStaticMarkup(await route.default(props));
  assert.ok(html.includes('data-article-cover'));
  assert.ok(html.includes('aspect-[2/1]'));
  assert.ok(html.includes('xl:aspect-[16/5]'));
  assert.ok(html.includes('dir="rtl"'));
  assert.deepEqual(calls, [["latest", { limit: 4, sort: "newest" }], ["countries", { limit: 50, sort: "manual" }], ["universities", { limit: 50, sort: "name" }]]);
  assert.ok(html.includes(original.titleAr));
  assert.ok(html.includes('data-related-scholarship="' + record.relatedScholarships[0].id + '"'));
  assert.ok(html.includes("https://example.com/real-cover.jpg"));
  assert.ok(html.includes("التقديم مغلق"));
  assert.ok(html.includes(`/study-abroad/${original.country.slug}`));
  assert.ok(html.includes(`/universities/${original.university.slug}`));
  assert.equal(html.includes("قدّم الآن"), false);
  assert.equal(html.includes("<form"), false);
  assert.equal(html.includes("محتوى تجريبي توضيحي"), false);
  latestFailure = true; relationFailure = true;
  const isolated = renderToStaticMarkup(await route.default(props));
  assert.ok(isolated.includes(original.titleAr));
  assert.ok(isolated.includes("تعذّر تحميل أحدث المقالات"));
  assert.ok(isolated.includes("تعذّر تحميل الروابط المرتبطة"));
  assert.ok(isolated.includes("إعادة المحاولة"));
  latestFailure = false; relationFailure = false;
  record = { ...record, bodyAr: [], countryId: null, universityId: null, relatedScholarships: [], publishedAt: null, coverImageUrl: null };
  const partial = renderToStaticMarkup(await route.default(props));
  assert.ok(partial.includes("محتوى المقال غير متوفر حالياً"));
  assert.ok(partial.includes("لا توجد منح مرتبطة حالياً"));
  assert.ok(partial.includes("تاريخ النشر (غير متوفر حالياً)"));
  assert.ok(partial.includes("الصورة (غير متوفر حالياً)"));
  record = { ...record, bodyAr: "<p>not blocks</p>", relatedScholarships: undefined };
  const invalid = renderToStaticMarkup(await route.default(props));
  assert.ok(invalid.includes("تعذّر تحميل محتوى المقال"));
  assert.ok(invalid.includes("تعذّر تحميل المنح المرتبطة"));
  record = { ...record, status: "DRAFT" };
  await assert.rejects(route.default(props), /NOT_FOUND/);
  failure = new ApiError(404);
  await assert.rejects(route.default(props), /NOT_FOUND/);
  failure = new ApiError(503);
  const error = renderToStaticMarkup(await route.default(props));
  assert.ok(error.includes("تعذّر تحميل المقال"));
  assert.equal(error.includes(original.titleAr), false);
});

test("Live article parsing validates identity/publication and treats unsupported rich text as an error, not HTML", () => {
  const { parsePublishedArticle, parseArticleBody, parseLatestArticles, validArticleSlug } = load("lib/article-detail-live.ts");
  const parsed = parsePublishedArticle({ ...original, status: undefined, publishedAt: "2026-02-30T12:00:00Z", coverImageUrl: "javascript:alert(1)" }, original.slug);
  assert.equal(parsed.status, "PUBLISHED");
  assert.equal(parsed.publishedAt, null);
  assert.equal(parsed.coverImageUrl, null);
  assert.equal(parsed.country, null);
  assert.equal(parsed.university, null);
  for (const row of [null, {}, { ...original, status: "DRAFT" }, { ...original, status: "ARCHIVED" }, { ...original, id: "" }, { ...original, slug: "wrong-slug" }]) assert.throws(() => parsePublishedArticle(row, original.slug));
  assert.equal(validArticleSlug("../secret"), false);
  assert.equal(validArticleSlug("a"), false);
  assert.deepEqual(parseArticleBody(null), { blocks: [], failed: false });
  for (const value of ["<p>HTML</p>", [{ type: "html", text: "unsafe" }], [{ type: "paragraph", text: "", href: "javascript:bad" }], [{ type: "paragraph", text: "hello", marks: ["bold"] }]]) assert.equal(parseArticleBody(value).failed, true);
  const body = [{ type: "heading2", text: "العنوان" }, { type: "paragraph", text: '<img src=x onerror="alert(1)">' }];
  assert.deepEqual(parseArticleBody(body), { blocks: body, failed: false });
  const { ArticleBlocks } = viewLoad("components/public/public-content.tsx");
  const html = renderToStaticMarkup(React.createElement(ArticleBlocks, { blocks: body }));
  assert.ok(html.includes("&lt;img"));
  assert.equal(html.includes("<img"), false);
  const list = { items: [original], pagination: { page: 1, limit: 4, total: 1, totalPages: 1 } };
  assert.deepEqual(parseLatestArticles(list, original.id, original.slug), []);
  assert.throws(() => parseLatestArticles({ ...list, items: [original, original] }, "other", "other"));
  assert.throws(() => parseLatestArticles({ items: [] }, "other", "other"));
  assert.deepEqual(parseLatestArticles({ items: [], pagination: { page: 1, limit: 4, total: 0, totalPages: 0 } }, "other", "other"), []);
});

test("Live metadata uses the same article's real SEO and date, while invalid/unpublished routes never index", async () => {
  let raw = { ...original, status: undefined, relatedScholarships: [], seoTitleAr: "عنوان حقيقي", seoDescriptionAr: "وصف حقيقي", publishedAt: "2026-11-05T12:00:00Z" };
  let requested = 0;
  const local = loader({ ...ui,
    "@/api/public-content": { getArticle: async () => { requested++; return raw; } },
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "next/navigation": { notFound: () => { throw Error("NOT_FOUND"); } },
  });
  const route = local("app/articles/[slug]/page.tsx");
  const props = { params: Promise.resolve({ slug: original.slug }) };
  const metadata = await route.generateMetadata(props);
  assert.equal(metadata.title, raw.seoTitleAr);
  assert.equal(metadata.description, raw.seoDescriptionAr);
  assert.equal(metadata.openGraph.publishedTime, raw.publishedAt);
  assert.equal(metadata.openGraph.type, "article");
  assert.equal(metadata.robots, undefined);
  if (metadata.alternates?.canonical) assert.ok(metadata.alternates.canonical.endsWith(`/articles/${original.slug}`));
  raw = { ...raw, seoTitleAr: null, seoDescriptionAr: null, summaryAr: "", publishedAt: null, coverImageUrl: null };
  const partial = await route.generateMetadata(props);
  assert.equal(partial.description, raw.titleAr);
  assert.equal(partial.openGraph.publishedTime, undefined);
  assert.equal(partial.openGraph.images, undefined);
  const count = requested;
  await assert.rejects(route.generateMetadata({ params: Promise.resolve({ slug: "../invalid" }) }), /NOT_FOUND/);
  assert.equal(requested, count);
  raw = { ...raw, status: "ARCHIVED" };
  await assert.rejects(route.generateMetadata(props), /NOT_FOUND/);
  raw = { ...raw, status: undefined, slug: "unrelated-article" };
  await assert.rejects(route.generateMetadata(props), /NOT_FOUND/);
});

test("Demo route retains approved body fixtures, related cards, media and disclosure without Live lookups", async () => {
  const local = loader({ ...ui,
    "@/api/public-content": {
      getArticle: async () => original,
      getArticles: async () => ({ items: demo.publicDemoContent.articles.slice(0, 4) }),
      getCountries: async () => { throw Error("Demo must not request Live relations"); },
      getUniversities: async () => { throw Error("Demo must not request Live relations"); },
    },
    "@/lib/public-content-mode": { isPublicDemoMode: () => true },
    "next/navigation": { notFound: () => { throw Error("NOT_FOUND"); } },
  });
  const html = renderToStaticMarkup(await local("app/articles/[slug]/page.tsx").default({ params: Promise.resolve({ slug: original.slug }) }));
  assert.ok(html.includes("محتوى تجريبي توضيحي"));
  assert.equal((html.match(/data-related-scholarship=/g) ?? []).length, 3);
  assert.ok(html.includes("خطتك قبل التواصل"));
  assert.equal(html.includes("تعذّر تحميل"), false);
});
