/* eslint-disable @typescript-eslint/no-require-imports -- Isolated Next.js boundaries for route rendering. */
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
  "next/link": (props) => React.createElement("a", props),
  "next/image": ({ src, alt, className }) => React.createElement("img", { src, alt, className }),
  "next/navigation": { notFound: () => { throw Error("not-found"); } },
};
const data = loader()("lib/mocks/public-demo-content.ts");
const fixtures = loader()("lib/mocks/country-details-fixtures.ts");
const apiError = loader()("api/error.ts");
function route(demo, country = data.publicDemoContent.countries[1], fail) {
  return loader({ ...boundary,
    "@/lib/public-content-mode": { isPublicDemoMode: () => demo },
    "@/api/error": apiError,
    "@/api/public-content": { getCountry: async () => { if (fail) throw fail; return country; } },
  })("app/study-abroad/[slug]/page.tsx");
}
const props = { params: Promise.resolve({ slug: "requested-alias" }) };

test("every Demo country has associated facts/FAQs and its own image and filtered canonical actions", async () => {
  for (const country of data.publicDemoContent.countries) {
    const html = renderToStaticMarkup(await route(true, country).default(props));
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    for (const id of ["country-title", "country-overview-title", "country-information-title", "country-guide-title", "country-faq-title", "country-contact-title"]) assert.ok(html.includes(`id="${id}"`));
    assert.ok(html.includes(`/universities?country=${country.slug}`));
    assert.ok(html.includes(`/scholarships?country=${country.slug}`));
    assert.ok(html.includes(country.imageUrl.replaceAll("&", "&amp;")));
    assert.ok(fixtures.getDemoCountryDetails(country).faqs.every((faq) => faq.question.includes(country.nameAr)));
    assert.equal((html.match(/data-country-guide-panel/g) ?? []).length, 3);
    assert.ok(html.includes("خطة بحث توضيحية للعرض التجريبي"));
    assert.equal(fixtures.getDemoCountryDetails(country).facts.length, 4, "All four explicitly fictional Demo scenarios stay isolated from Live");
    assert.equal(html.includes("جامعات مرتبطة"), false);
    assert.equal(html.includes("منح مرتبطة"), false);
    assert.ok(html.includes("https://wa.me/963992277142?text="));
  }
});

test("Live renders only real fields, never Demo facts/FAQ; duplicated overview and missing images are handled safely", async () => {
  const country = { ...data.publicDemoContent.countries[1], slug: "تركيا-الدراسة", introductionAr: "نص واحد", detailsAr: "نص واحد", imageUrl: null };
  const html = renderToStaticMarkup(await route(false, country).default(props));
  assert.equal((html.match(/نص واحد/g) ?? []).length, 1);
  assert.equal(html.includes('id="country-information-title"'), false);
  assert.equal(html.includes('id="country-faq-title"'), false);
  assert.equal(html.includes('id="country-guide-title"'), false);
  assert.equal(html.includes("خطة بحث توضيحية"), false);
  assert.equal(html.includes("التركية أو الإنجليزية"), false);
  assert.ok(html.includes(`/universities?${new URLSearchParams({ country: country.slug })}`));
  const metadata = await route(false, country).generateMetadata(props);
  assert.equal(metadata.description, country.seoDescriptionAr);
  assert.equal(fixtures.getDemoCountryDetails({ ...country, id: "live-country" }), null);
});

test("404 stays not-found and connection failures show an error without sample fallback", async () => {
  const missing = route(false, undefined, new apiError.ApiError(404, "missing"));
  await assert.rejects(() => missing.default(props), /not-found/);
  await assert.rejects(() => missing.generateMetadata(props), /not-found/);
  const html = renderToStaticMarkup(await route(false, undefined, Error("offline")).default(props));
  assert.ok(html.includes("يتعذر"));
  assert.equal(html.includes("استكشف جامعات"), false);
});

test("FAQ initially shows five, reuses the Homepage accordion, and reveals remaining questions in-page", () => {
  let expanded = false;
  const mockReact = { ...React, useState: () => [expanded, (value) => { expanded = value; }] };
  const CountryFaq = loader({ react: mockReact })("components/public/country-faq.tsx").CountryFaq;
  const items = fixtures.getDemoCountryDetails(data.publicDemoContent.countries[1]).faqs;
  const render = () => CountryFaq({ items, name: "country-test" });
  let view = render();
  assert.equal(view.props.children[0].props.items.length, 5);
  let html = renderToStaticMarkup(view);
  assert.ok(html.includes('id="country-test-more" hidden=""'));
  assert.ok(html.includes('aria-controls="country-test-more"'));
  assert.equal((html.match(/ open=""/g) ?? []).length, 0, "Country FAQs start closed without changing the shared Homepage default");
  view.props.children[1].props.children[1].props.onClick();
  html = renderToStaticMarkup(render());
  assert.ok(html.includes('aria-expanded="true"'));
  assert.equal(html.includes('hidden=""'), false);
  assert.ok(html.includes(items[5].question));
});

test("metadata canonical uses the API-returned slug, not a requested alias, when the public origin is configured", async () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    const country = { ...data.publicDemoContent.countries[1], slug: "تركيا-الدراسة" };
    const metadata = await route(false, country).generateMetadata(props);
    assert.equal(metadata.alternates.canonical, `https://example.test/study-abroad/${encodeURIComponent(country.slug)}`);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("country cards expose one full-card details link, with no nested interactives or conflicting university link", () => {
  const Cards = loader(boundary)("components/public/study-abroad-country-cards.tsx").StudyAbroadCountryCards;
  const html = renderToStaticMarkup(React.createElement(Cards, { countries: data.publicDemoContent.countries }));
  assert.equal((html.match(/<a\b/g) ?? []).length, data.publicDemoContent.countries.length);
  assert.equal(html.includes("/universities?country="), false);
  assert.ok(html.includes('draggable="false"'));
  assert.ok(html.includes("استكشف الوجهة"));
});

test("country deep-link queries support canonical localized slugs, preserve other filters and reset page on change", async () => {
  const load = loader();
  const { universitiesParams, scholarshipsParams } = load("lib/public-search-params.ts");
  for (const parse of [universitiesParams, scholarshipsParams]) {
    assert.equal(parse({ country: "تركيا-الدراسة" }).country, "تركيا-الدراسة");
    for (const country of ["", "../turkey", "turkey?x=1", ["turkey"]]) assert.equal(parse({ country }).country, undefined);
  }
  for (const country of data.publicDemoContent.countries) {
    for (const get of [data.getDemoUniversities, data.getDemoScholarships]) {
      const result = await get({ country: country.slug, limit: 50 });
      assert.ok(result.items.every((item) => item.country?.slug === country.slug));
    }
  }
  const helper = load("lib/scholarship-directory.ts");
  const href = helper.scholarshipDirectoryHref({ country: "turkey", search: "بحث", applicationStatus: "OPEN", sort: "deadline" });
  const query = new URL(href, "http://local").searchParams;
  assert.equal(query.get("country"), "turkey");
  assert.equal(query.get("search"), "بحث");
  assert.equal(query.get("applicationStatus"), "OPEN");
  assert.equal(query.has("page"), false);
});

test("overview imagery is explicitly mapped to an existing country asset, with no universal fallback", () => {
  const load = loader();
  const { getCountryOverviewImage } = load("lib/country-overview-images.ts");
  const image = getCountryOverviewImage("turkey");
  assert.equal(image.src, "/images/study-abroad/overview/turkey-overview.webp");
  assert.ok(fs.existsSync(path.resolve(__dirname, "..", "public", image.src.slice(1))));
  assert.equal(image.author, "Yair Haklai");
  for (const slug of ["romania", "turkiye", "unknown-country", "../turkey", "__proto__"]) assert.equal(getCountryOverviewImage(slug), null);
  const missing = loader({ "node:fs": { existsSync: () => false } })("lib/country-overview-images.ts");
  assert.equal(missing.getCountryOverviewImage("turkey"), null);
  assert.equal(fixtures.getDemoCountryDetails(data.publicDemoContent.countries[1]).overviewImage.src, image.src);
  assert.equal(fixtures.getDemoCountryDetails(data.publicDemoContent.countries[0]).overviewImage, null);
});

test("Live Turkey uses only the explicit local image, credits its creator/license, and never acquires Demo facts or FAQs", async () => {
  const html = renderToStaticMarkup(await route(false).default(props));
  assert.ok(html.includes('src="/images/study-abroad/overview/turkey-overview.webp"'));
  assert.ok(html.includes('alt="بوابة جامعة إسطنبول التاريخية في تركيا"'));
  assert.ok(html.includes("Yair Haklai"));
  assert.ok(html.includes("https://creativecommons.org/licenses/by-sa/4.0/"));
  assert.ok(html.includes("تحويل واقتصاص للعرض"));
  assert.equal(html.includes('id="country-information-title"'), false);
  assert.equal(html.includes('id="country-faq-title"'), false);
  const unmapped = renderToStaticMarkup(await route(false, data.publicDemoContent.countries[0]).default(props));
  assert.ok(unmapped.includes('id="country-overview-title"'));
  assert.equal(unmapped.includes("turkey-overview.webp"), false);
});

test("country CTA reuses the readable shared overlay and keeps the secondary action border", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../components/public/country-details.tsx"), "utf8");
  const cta = fs.readFileSync(path.resolve(__dirname, "../components/public/consultation-cta.tsx"), "utf8");
  assert.ok(cta.includes("md:bg-transparent md:bg-gradient-to-l"));
  assert.ok(source.includes('<ConsultationCta titleId="country-contact-title"'));
  assert.ok(source.includes('style={{ borderColor: "#B58C3C" }}'));
  assert.ok(source.includes('aspect-[2/1] overflow-hidden rounded-2xl'));
});

test("Study guide omits empty panels and exposes independent native keyboard-accessible disclosures", () => {
  const { CountryStudyGuide } = loader(boundary)("components/public/country-study-guide.tsx");
  const empty = renderToStaticMarkup(React.createElement(CountryStudyGuide, { countryName: "تركيا", panels: [{ title: "غير متاح", introduction: " ", steps: [" "] }] }));
  assert.equal(empty, "");
  const panels = fixtures.getDemoCountryDetails(data.publicDemoContent.countries[1]).guide;
  const html = renderToStaticMarkup(React.createElement(CountryStudyGuide, { countryName: "تركيا", panels }));
  assert.equal((html.match(/<details\b/g) ?? []).length, 3);
  assert.equal((html.match(/<summary\b/g) ?? []).length, 3);
  assert.equal(html.includes(' open=""'), false);
  assert.equal(html.includes(' name="'), false, "Guide panels may remain open independently");
  assert.ok(html.includes("motion-reduce:transition-none"));
});

test("Country information adapts from zero to four meaningful facts, showing one only inside the overview", () => {
  const local = loader(boundary);
  const { CountryDetails } = local("components/public/country-details.tsx");
  const { meaningfulCountryInformation } = local("components/public/country-information.tsx");
  const country = data.publicDemoContent.countries[1];
  const facts = fixtures.getDemoCountryDetails(country).facts;
  for (const count of [0, 1, 2, 3, 4]) {
    const html = renderToStaticMarkup(React.createElement(CountryDetails, { country, demoDetails: null, overviewImage: null, information: facts.slice(0, count) }));
    assert.equal((html.match(/data-country-fact/g) ?? []).length, count);
    assert.equal(html.includes('id="country-information-title"'), count >= 2);
    if (count === 1) {
      const overview = html.match(/<section aria-labelledby="country-overview-title"[\s\S]*?<\/section>/)[0];
      assert.ok(overview.includes("data-country-fact"));
      assert.ok(overview.includes("w-fit max-w-full"));
    }
    if (count === 2) assert.ok(html.includes("max-w-3xl sm:grid-cols-2"));
    if (count === 3) assert.ok(html.includes("lg:grid-cols-3"));
    if (count === 4) assert.ok(html.includes("xl:grid-cols-4"));
  }
  assert.equal(meaningfulCountryInformation([{ title: "", value: "x" }, { title: "x", value: " " }]).length, 0);
  assert.equal(meaningfulCountryInformation([facts[0], facts[0]]).length, 1);
});

test("Inner-page hero tokens are opt-in and preserve the Homepage hero and disabled university intro", () => {
  const { innerPageHero } = loader()("lib/inner-page-hero.ts");
  assert.ok(innerPageHero.content.includes("md:min-h-[12.5rem]"));
  assert.ok(innerPageHero.content.includes("xl:min-h-[14.5rem]"));
  assert.equal(/(?:^|\s)(?:h|max-h)-/.test(innerPageHero.content), false, "Content can grow without clipping");
  const read = (relative) => fs.readFileSync(path.resolve(__dirname, "..", relative), "utf8");
  assert.equal(read("app/page.tsx").includes("innerPageHero"), false);
  assert.ok(read("app/universities/page.tsx").includes("{/* <section"));
  for (const file of ["app/study-abroad/page.tsx", "app/articles/page.tsx", "app/scholarships/page.tsx", "app/services/page.tsx", "app/universities/[slug]/page.tsx", "app/articles/[slug]/page.tsx", "components/public/country-details.tsx", "components/public/service-details.tsx", "components/public/scholarship-details.tsx"]) assert.ok(read(file).includes("innerPageHero.title"), file);
});
