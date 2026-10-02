import assert from "node:assert/strict";
import { createHmac, createHash } from "node:crypto";
import test from "node:test";
import { decideBitlabs, decideLootably } from "./decide.ts";
import { isAllowedCountry, normalizeCountry } from "./geo.ts";

const UID = "11111111-1111-4111-8111-111111111111";
const BITLABS_SECRET = "bitlabs-test-secret";
const LOOTABLY_SECRET = "lootably-test-secret";

function signedBitlabs(query: string, secret = BITLABS_SECRET): Request {
  const unsigned = `https://courseunlock.example/api/postback/bitlabs?${query}`;
  const hash = createHmac("sha1", secret).update(unsigned).digest("hex");
  return new Request(`${unsigned}&hash=${hash}`);
}

function lootablyParams(fields: Record<string, string>, secret = LOOTABLY_SECRET): URLSearchParams {
  const userID = fields.userID ?? "";
  const ip = fields.ip ?? "";
  const revenue = fields.revenue ?? "";
  const currencyReward = fields.currencyReward ?? "";
  const hash = createHash("sha256")
    .update(userID + ip + revenue + currencyReward + secret)
    .digest("hex");
  return new URLSearchParams({ ...fields, hash });
}

test("country gate allows only US and GB", () => {
  assert.equal(isAllowedCountry("US"), true);
  assert.equal(isAllowedCountry("GB"), true);
  assert.equal(isAllowedCountry(normalizeCountry("uk")), true);
  assert.equal(isAllowedCountry("PK"), false);
  assert.equal(isAllowedCountry(null), false);
  assert.equal(normalizeCountry("XX"), "XX");
  assert.equal(isAllowedCountry("XX"), false);
});

test("bitlabs grants on a signed positive publisher revenue", () => {
  const decision = decideBitlabs(
    signedBitlabs(`uid=${UID}&tx=o100&raw=1.25&type=COMPLETE`),
    BITLABS_SECRET,
  );
  assert.deepEqual(decision, {
    ok: true,
    action: "grant",
    visitorId: UID,
    transactionId: "o100",
    revenue: "1.25",
  });
});

test("bitlabs rejects a bad hash and does not grant", () => {
  const request = signedBitlabs(`uid=${UID}&tx=o100&raw=1.25&type=COMPLETE`, "other-secret");
  const decision = decideBitlabs(request, BITLABS_SECRET);
  assert.deepEqual(decision, { ok: false, status: 403 });
});

test("bitlabs reconciliation removes eligibility even when revenue is positive", () => {
  const decision = decideBitlabs(
    signedBitlabs(`uid=${UID}&tx=or100&raw=1.25&type=COMPLETE&offer_state=RECONCILED`),
    BITLABS_SECRET,
  );
  assert.equal(decision.ok && decision.action, "reverse");
});

test("bitlabs zero revenue and pending do not grant", () => {
  const zero = decideBitlabs(
    signedBitlabs(`uid=${UID}&tx=o0&raw=0&type=COMPLETE`),
    BITLABS_SECRET,
  );
  assert.equal(zero.ok && zero.action, "ignore");
  const pending = decideBitlabs(
    signedBitlabs(`uid=${UID}&tx=op&raw=1.25&offer_state=PENDING`),
    BITLABS_SECRET,
  );
  assert.equal(pending.ok && pending.action, "ignore");
});

test("lootably grants on a matching sha256 and returns reverse for status 0", () => {
  const grant = decideLootably(
    lootablyParams({
      userID: UID,
      ip: "203.0.113.8",
      revenue: "0.50",
      currencyReward: "100",
      transactionID: "txn-9",
      status: "1",
    }),
    LOOTABLY_SECRET,
  );
  assert.equal(grant.ok && grant.action, "grant");
  const reversal = decideLootably(
    lootablyParams({
      userID: UID,
      ip: "203.0.113.8",
      revenue: "0.50",
      currencyReward: "100",
      transactionID: "txn-9",
      status: "0",
    }),
    LOOTABLY_SECRET,
  );
  assert.equal(reversal.ok && reversal.action, "reverse");
});

test("lootably missing hash is rejected", () => {
  const params = new URLSearchParams({
    userID: UID,
    ip: "203.0.113.8",
    revenue: "0.50",
    currencyReward: "100",
    transactionID: "txn-9",
    status: "1",
  });
  assert.deepEqual(decideLootably(params, LOOTABLY_SECRET), { ok: false, status: 403 });
});
