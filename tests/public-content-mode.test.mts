import assert from "node:assert/strict";
import test from "node:test";

import { getPublicContentMode } from "../lib/public-content-mode.ts";

const originalMode = process.env.PUBLIC_CONTENT_MODE;

test("public content mode defaults safely to live and accepts only explicit demo", () => {
  try {
    delete process.env.PUBLIC_CONTENT_MODE;
    assert.equal(getPublicContentMode(), "live");

    process.env.PUBLIC_CONTENT_MODE = "unexpected";
    assert.equal(getPublicContentMode(), "live");

    process.env.PUBLIC_CONTENT_MODE = "demo";
    assert.equal(getPublicContentMode(), "demo");

    process.env.PUBLIC_CONTENT_MODE = "live";
    assert.equal(getPublicContentMode(), "live");
  } finally {
    if (originalMode === undefined) delete process.env.PUBLIC_CONTENT_MODE;
    else process.env.PUBLIC_CONTENT_MODE = originalMode;
  }
});
