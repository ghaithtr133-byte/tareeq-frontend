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
function route(demo, country = data.publicDemoContent.countries[1], fail, faqPayload = { items: [], pagination: { total: 0 } }, calls = []) {
  return loader({ ...boundary,
    "@/lib/public-content-mode": { isPublicDemoMode: () => demo },
    "@/api/error": apiError,
    "@/api/server-client": { serverApiClient: { get: async (path, config) => { calls.push({ path, config }); if (faqPayload instanceof Error) throw faqPayload; return { data: { success: true, data: faqPayload } }; } } },
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
  assert.equal(html.includes('id="country-information-title"'), true);
  assert.equal(html.includes('id="country-faq-title"'), true);
  assert.equal(html.includes('id="country-guide-title"'), true);
  assert.equal((html.match(/data-country-fact/g) ?? []).length, 4);
  assert.equal((html.match(/data-country-guide-panel/g) ?? []).length, 3);
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

test("Demo retains approved overview artwork and credits; Live never substitutes it for a missing Admin image", async () => {
  const html = renderToStaticMarkup(await route(true).default(props));
  assert.ok(html.includes('src="/images/study-abroad/overview/turkey-overview.webp"'));
  assert.ok(html.includes('alt="بوابة جامعة إسطنبول التاريخية في تركيا"'));
  assert.ok(html.includes("Yair Haklai"));
  assert.ok(html.includes("https://creativecommons.org/licenses/by-sa/4.0/"));
  assert.ok(html.includes("تحويل واقتصاص للعرض"));
  const unmapped = renderToStaticMarkup(await route(false).default(props));
  assert.ok(unmapped.includes('id="country-overview-title"'));
  assert.equal(unmapped.includes("turkey-overview.webp"), false);
  assert.equal(unmapped.includes("صورة توضيحية (غير متوفر حالياً)"), false);
});

test("Optional overview media controls only its column; required Hero media always retains its container", async () => {
  const { CountryDetails } = loader(boundary)("components/public/country-details.tsx");
  const country = { ...data.publicDemoContent.countries[0], imageUrl: null };
  const missing = renderToStaticMarkup(React.createElement(CountryDetails, { country, demoDetails: null, overviewImage: null }));
  const overview = missing.match(/<section aria-labelledby="country-overview-title"[\s\S]*?<\/section>/)[0];
  assert.equal(overview.includes("<figure"), false);
  assert.equal(overview.includes("aspect-[2/1]"), false);
  assert.equal(overview.includes("غير متوفر حالياً"), false);
  assert.equal(overview.includes("md:grid-cols-"), false);
  assert.ok(overview.includes("max-w-4xl"));
  const hero = missing.match(/<section aria-labelledby="country-title"[\s\S]*?<\/section>/)[0];
  assert.ok(hero.includes("صورة الدولة (غير متوفر حالياً)"));
  assert.ok(hero.includes("md:w-[54%]"));
  const image = { src: "https://example.test/romania-overview.jpg", alt: "صورة رومانيا", source: "https://example.test/source", author: "المصدر", license: "ترخيص", licenseUrl: "https://example.test/license" };
  const populated = renderToStaticMarkup(React.createElement(CountryDetails, { country: { ...country, imageUrl: "https://example.test/romania-hero.jpg", imageAltAr: "صورة Hero الحقيقية" }, demoDetails: null, overviewImage: image }));
  const withImage = populated.match(/<section aria-labelledby="country-overview-title"[\s\S]*?<\/section>/)[0];
  assert.ok(withImage.includes("<figure"));
  assert.ok(withImage.includes("md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"));
  assert.ok(withImage.includes(image.src));
  assert.ok(populated.includes('src="https://example.test/romania-hero.jpg"'));
  assert.equal(populated.includes("صورة الدولة (غير متوفر حالياً)"), false);
  const unknownField = renderToStaticMarkup(await route(false, { ...country, overviewImageUrl: image.src }).default(props));
  assert.equal(unknownField.includes(image.src), false, "Do not consume an unapproved response field");
});

test("country CTA reuses the readable shared overlay and keeps the secondary action border", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../components/public/country-details.tsx"), "utf8");
  const cta = fs.readFileSync(path.resolve(__dirname, "../components/public/consultation-cta.tsx"), "utf8");
  assert.ok(cta.includes("md:bg-transparent md:bg-gradient-to-l"));
  assert.ok(source.includes('<ConsultationCta titleId="country-contact-title"'));
  assert.ok(source.includes('style={{ borderColor: "#B58C3C" }}'));
  assert.ok(source.includes('aspect-[2/1] overflow-hidden rounded-2xl'));
});

test("Study guide preserves its section on empty data and exposes independent native keyboard-accessible disclosures", () => {
  const { CountryStudyGuide } = loader(boundary)("components/public/country-study-guide.tsx");
  const empty = renderToStaticMarkup(React.createElement(CountryStudyGuide, { countryName: "تركيا", panels: [{ title: "غير متاح", introduction: " ", steps: [" "] }] }));
  assert.ok(empty.includes('id="country-guide-title"'));
  assert.ok(empty.includes("محتوى الدليل غير متاح حالياً"));
  const panels = fixtures.getDemoCountryDetails(data.publicDemoContent.countries[1]).guide;
  const html = renderToStaticMarkup(React.createElement(CountryStudyGuide, { countryName: "تركيا", panels }));
  assert.equal((html.match(/<details\b/g) ?? []).length, 3);
  assert.equal((html.match(/<summary\b/g) ?? []).length, 3);
  assert.equal(html.includes(' open=""'), false);
  assert.equal(html.includes(' name="'), false, "Guide panels may remain open independently");
  assert.ok(html.includes("motion-reduce:transition-none"));
});

test("Country information keeps all four original slots for zero to four available facts", () => {
  const local = loader(boundary);
  const { CountryDetails } = local("components/public/country-details.tsx");
  const { meaningfulCountryInformation } = local("components/public/country-information.tsx");
  const country = data.publicDemoContent.countries[1];
  const facts = fixtures.getDemoCountryDetails(country).facts;
  for (const count of [0, 1, 2, 3, 4]) {
    const html = renderToStaticMarkup(React.createElement(CountryDetails, { country, demoDetails: null, overviewImage: null, information: facts.slice(0, count) }));
    assert.equal((html.match(/data-country-fact/g) ?? []).length, 4);
    assert.equal(html.includes('id="country-information-title"'), true);
    assert.ok(html.includes("sm:grid-cols-2 xl:grid-cols-4"));
  }
  assert.equal(meaningfulCountryInformation([{ title: "", value: "x" }, { title: "x", value: " " }]).length, 0);
  assert.equal(meaningfulCountryInformation([facts[0], facts[0]]).length, 1);
});

test("Student facts and guide have distinct content, never extract unsupported facts from detailsAr", async () => {
  for (const country of data.publicDemoContent.countries) {
    const details = fixtures.getDemoCountryDetails(country);
    const guideText = details.guide.map((panel) => [panel.introduction, ...panel.steps].join(" ")).join(" ");
    for (const fact of details.facts) {
      assert.ok(fact.value.length < 110);
      assert.equal(guideText.includes(fact.value), false);
    }
  }
  const country = { ...data.publicDemoContent.countries[0], id: "live-country", imageUrl: null, introductionAr: null, detailsAr: "رسوم مزعومة 99999 ومواعيد مزعومة 2030-09-01" };
  const html = renderToStaticMarkup(await route(false, country).default(props));
  const facts = html.match(/<section aria-labelledby="country-information-title"[\s\S]*?<\/section>/)[0];
  const guide = html.match(/<section aria-labelledby="country-guide-title"[\s\S]*?<\/section>/)[0];
  for (const title of ["لغة الدراسة", "التكاليف الدراسية", "متطلبات القبول", "مواعيد التقديم"]) assert.ok(facts.includes(`${title} (غير متوفر حالياً)`));
  for (const fragment of [facts, guide]) {
    assert.equal(fragment.includes("99999"), false);
    assert.equal(fragment.includes("2030-09-01"), false);
    assert.equal(fragment.includes("٤٬٠٠٠"), false);
    assert.equal(fragment.includes("مارس ٢٠٢٧"), false);
    assert.equal(fragment.includes("الرومانية أو الإنجليزية بحسب التخصص التجريبي"), false);
  }
  assert.ok(guide.includes("غير متوفر حالياً"));
  assert.ok(html.includes("مقدمة الدولة (غير متوفر حالياً)"));
  assert.ok(html.includes("صورة الدولة (غير متوفر حالياً)"));
  const { completeCountryFacts, unavailableCountryGuide } = loader()("lib/country-detail-content.ts");
  const mapped = completeCountryFacts([{ title: "لغة الدراسة", value: "لغة موثقة" }]);
  assert.equal(mapped[0].value, "لغة موثقة");
  assert.equal(mapped.length, 4);
  assert.equal(unavailableCountryGuide("romania", "دولة مختلفة")[0].introduction, "إرشادات الدراسة (غير متوفر حالياً)");
});

test("Country FAQs use only the canonical current-country endpoint; empty, invalid scopes and failures are isolated", async () => {
  const country = { ...data.publicDemoContent.countries[0], id: "live-romania" };
  const faq = { id: "faq-1", scope: "COUNTRY", questionAr: "سؤال رومانيا المنشور؟", answerAr: "جواب موثق لرومانيا." };
  const calls = [];
  const html = renderToStaticMarkup(await route(false, country, undefined, { items: [faq], pagination: { total: 1 } }, calls).default(props));
  assert.deepEqual(calls, [{ path: "/countries/romania/faqs", config: { params: { limit: 6 }, timeout: 12000 } }]);
  assert.ok(html.includes(faq.questionAr));
  assert.ok(html.includes(faq.answerAr));
  assert.equal(html.includes("كيف أبدأ البحث عن جامعة"), false);
  const empty = renderToStaticMarkup(await route(false, country).default(props));
  assert.ok(empty.includes("لا توجد أسئلة منشورة لهذه الدولة حالياً"));
  assert.equal(empty.includes('role="alert"'), false);
  for (const bad of [Error("offline"), { items: [null], pagination: { total: 1 } }, { items: [{ ...faq, scope: "GLOBAL" }], pagination: { total: 1 } }, { items: [{ ...faq, countryId: "another-country" }], pagination: { total: 1 } }, { items: [], pagination: { total: 2 } }]) {
    const failed = renderToStaticMarkup(await route(false, country, undefined, bad).default(props));
    assert.ok(failed.includes("تعذر تحميل أسئلة هذه الدولة"));
    assert.ok(failed.includes("إعادة المحاولة"));
    assert.ok(failed.includes('id="country-overview-title"'));
    assert.ok(failed.includes('id="country-contact-title"'));
    assert.equal(failed.includes("لا توجد أسئلة منشورة لهذه الدولة حالياً"), false);
  }
});

test("Malformed essential data is an error; invalid/unknown/unpublished countries remain not-found", async () => {
  const draft = { ...data.publicDemoContent.countries[0], status: "DRAFT" };
  await assert.rejects(() => route(false, draft).default(props), /not-found/);
  await assert.rejects(() => route(false).default({ params: Promise.resolve({ slug: "../turkey" }) }), /not-found/);
  for (const country of [null, {}, { nameAr: "اسم فقط" }]) {
    const html = renderToStaticMarkup(await route(false, country).default(props));
    assert.ok(html.includes('role="alert"'));
    assert.ok(html.includes("إعادة المحاولة"));
    assert.equal(html.includes("data-country-fact"), false);
  }
});

test("Country loading reuses the shared skeleton with four facts, three guide panels and scoped FAQ geometry", () => {
  const { PublicPageSkeleton } = loader(boundary)("components/public/content-skeletons.tsx");
  const html = renderToStaticMarkup(React.createElement(PublicPageSkeleton, { page: "country" }));
  assert.ok(html.includes("data-country-guide-skeleton"));
  assert.ok(html.includes("data-country-faq-skeleton"));
  assert.ok(html.includes("xl:grid-cols-4"));
  assert.ok(html.includes("lg:grid-cols-3"));
  assert.ok(html.includes('aria-busy="true"'));
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
