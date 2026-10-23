import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("the fixture server refuses production mode", () => {
  const result = spawnSync(process.execPath, ["scripts/public-api-fixture-server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "production" },
    encoding: "utf8",
    timeout: 5_000,
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /development-only/i);
});
