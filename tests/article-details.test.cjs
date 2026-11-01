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

test("Live related scholarships resolve only the confirmed id/slug once and ignore pending multi-relations", async () => {
  const calls = [];
  const record = demo.publicDemoContent.scholarships.find((item) => item.id === original.scholarshipId);
  const resolve = async (slug) => { calls.push(slug); return record; };
  const related = await helpers.articleRelatedScholarships({ ...original, relatedScholarships: [demo.publicDemoContent.scholarships[2]] }, resolve);
  assert.equal(calls.length, 1);
  assert.deepEqual(related.map((item) => item.id), [original.scholarshipId]);
  for (const article of [{ ...original, scholarship: null }, { ...original, scholarshipId: null }, { ...original, scholarship: { ...original.scholarship, id: "unrelated" } }]) assert.deepEqual(await helpers.articleRelatedScholarships(article, resolve), []);
  assert.equal(calls.length, 1);
  assert.deepEqual(await helpers.articleRelatedScholarships(original, async () => ({ ...record, id: "unrelated" })), []);
  assert.deepEqual(await helpers.articleRelatedScholarships(original, async () => ({ ...record, status: "DRAFT" })), []);
  assert.deepEqual(await helpers.articleRelatedScholarships(original, async () => { throw new Error("offline"); }), []);
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
  const html = renderToStaticMarkup(React.createElement(ArticleConsultation));
  assert.ok(html.includes(createWhatsappUrl()));
  assert.ok(html.includes("تواصل عبر واتساب"));
  assert.equal(html.includes("قدّم الآن"), false);
  assert.equal(html.includes("<form"), false);
  assert.ok(html.includes('rel="noopener noreferrer"'));
});

test("Live route uses one bounded latest query and one exact scholarship detail lookup; errors remain distinct", async () => {
  const calls = [];
  let failure;
  class ApiError extends Error { constructor(status) { super("API failure"); this.status = status; } }
  const local = loader({ ...ui,
    "@/api/public-content": {
      getArticle: async (slug) => { if (failure) throw failure; assert.equal(slug, original.slug); return original; },
      getArticles: async (params) => { calls.push(["latest", params]); return { items: demo.publicDemoContent.articles.slice(0, 4) }; },
      getScholarship: async (slug) => { calls.push(["scholarship", slug]); return demo.publicDemoContent.scholarships.find((item) => item.slug === slug); },
    },
    "@/api/error": { ApiError },
    "@/lib/public-content-mode": { isPublicDemoMode: () => false },
    "next/navigation": { notFound: () => { throw new Error("NOT_FOUND"); } },
  });
  const route = local("app/articles/[slug]/page.tsx");
  const props = { params: Promise.resolve({ slug: original.slug }) };
  const html = renderToStaticMarkup(await route.default(props));
  assert.deepEqual(calls, [["latest", { limit: 4, sort: "newest" }], ["scholarship", original.scholarship.slug]]);
  assert.ok(html.includes(original.titleAr));
  assert.ok(html.includes('data-related-scholarship="' + original.scholarshipId + '"'));
  assert.equal(html.includes("قدّم الآن"), false);
  assert.equal(html.includes("<form"), false);
  assert.equal(html.includes("محتوى تجريبي توضيحي"), false);
  failure = new ApiError(404);
  await assert.rejects(route.default(props), /NOT_FOUND/);
  failure = new ApiError(503);
  const error = renderToStaticMarkup(await route.default(props));
  assert.ok(error.includes("يتعذر تحميل المحتوى"));
  assert.equal(error.includes(original.titleAr), false);
});
