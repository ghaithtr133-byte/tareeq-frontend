import assert from "node:assert/strict";
import test from "node:test";

import { createArticleTickerRail, mergeArticleTickerItems, tickerPage, toArticleTickerItems } from "../lib/article-ticker.ts";

test("the article ticker keeps published records and never repeats a later page", () => {
  const firstPage = toArticleTickerItems([
    { id: "one", slug: "one", titleAr: "المقال الأول", publishedAt: "2026-10-03T00:00:00.000Z", status: "PUBLISHED" },
    { id: "draft", slug: "draft", titleAr: "مسودة", publishedAt: null, status: "DRAFT" },
  ]);
  const merged = mergeArticleTickerItems(firstPage, [
    { id: "one", slug: "one", titleAr: "المقال الأول", publishedAt: "2026-10-03T00:00:00.000Z" },
    { id: "two", slug: "two", titleAr: "المقال الثاني", publishedAt: "2026-10-02T00:00:00.000Z" },
  ]);

  assert.deepEqual(merged.map((item) => item.id), ["one", "two"]);
});

test("the article ticker accepts only positive bounded page parameters", () => {
  assert.equal(tickerPage("3"), 3);
  assert.equal(tickerPage("0"), 1);
  assert.equal(tickerPage("not-a-page"), 1);
  assert.equal(tickerPage("10001"), 1);
});

test("the marquee keeps each article link in the primary rail and gives its seamless copy a stable identity", () => {
  const items = [
    { id: "four", slug: "article-four", titleAr: "المقال الرابع", publishedAt: null },
    { id: "five", slug: "article-five", titleAr: "المقال الخامس", publishedAt: null },
  ];

  const rail = createArticleTickerRail(items);
  assert.deepEqual(rail.map((item) => `${item.id}-${item.copy}`), ["four-0", "five-0", "four-1", "five-1"]);
  assert.deepEqual(rail.filter((item) => item.copy === 0).map((item) => item.slug), ["article-four", "article-five"]);
});
