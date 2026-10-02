import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createJsonGrantStore } from "./json-store.ts";

const input = {
  provider: "bitlabs" as const,
  transactionId: "o100",
  visitorId: "11111111-1111-4111-8111-111111111111",
  revenue: "1.25",
};

test("json store grants once, ignores the duplicate, and drops the grant on reversal", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "courseunlock-"));
  try {
    const store = createJsonGrantStore(path.join(dir, "grants.json"));
    assert.equal(await store.isUnlocked(input.visitorId), false);
    assert.equal(await store.complete(input), "granted");
    assert.equal(await store.complete(input), "duplicate");
    assert.equal(await store.isUnlocked(input.visitorId), true);
    await store.reverse({ ...input, transactionId: "or100", revenue: "1.25" });
    assert.equal(await store.isUnlocked(input.visitorId), false);
    assert.equal(await store.complete(input), "duplicate");
    assert.equal(await store.isUnlocked(input.visitorId), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
