import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node's strip-types test runner requires the explicit extension.
import { buildArticleToc } from "../lib/article-toc.ts";

test("buildArticleToc creates unique anchors for repeated Arabic and mixed-language headings", () => {
  const items = buildArticleToc([
    { type: "heading2", text: "تجهيز الوثائق!" },
    { type: "paragraph", text: "نص" },
    { type: "heading3", text: "IELTS & القبول" },
    { type: "heading2", text: "تجهيز الوثائق" },
  ]);

  assert.deepEqual(items.map(({ blockIndex, id, level }) => ({ blockIndex, id, level })), [
    { blockIndex: 0, id: "article-تجهيز-الوثايق", level: 2 },
    { blockIndex: 2, id: "article-ielts-القبول", level: 3 },
    { blockIndex: 3, id: "article-تجهيز-الوثايق-2", level: 2 },
  ]);
});

test("buildArticleToc omits articles without structured headings", () => {
  assert.deepEqual(buildArticleToc([{ type: "paragraph", text: "مقال قصير" }]), []);
});
