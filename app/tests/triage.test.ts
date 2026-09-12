import assert from "node:assert/strict";
import test from "node:test";
import { triageOffline, validateTicket } from "../src/triage.js";

test("security signals go to a human security queue and never auto-resolve", () => {
  const result = triageOffline(validateTicket({ case_ref: "CASE-1", message: "Account takeover; please help." }));
  assert.equal(result.priority, "P0");
  assert.equal(result.route_to, "security_on_call");
  assert.equal(result.response_policy, "human_review_required_no_automated_resolution");
});

test("security outranks billing when a ticket has multiple signals", () => {
  const result = triageOffline(validateTicket({ case_ref: "CASE-2", message: "I was charged twice after an account takeover." }));
  assert.equal(result.priority, "P0");
});

test("customer text and PII-like text are excluded from the output", () => {
  const message = "Email jane@example.test or call 212-555-0199 about a duplicate charge";
  const result = triageOffline(validateTicket({ case_ref: "CASE-3", message }));
  assert.equal(result.priority, "P1");
  assert.equal(JSON.stringify(result).includes("jane@example.test"), false);
  assert.equal(JSON.stringify(result).includes("212-555-0199"), false);
  assert.equal(JSON.stringify(result).includes(message), false);
});

test("access and general cases receive stable routes", () => {
  const access = triageOffline(validateTicket({ case_ref: "CASE-6", message: "I am locked out of my account." }));
  const general = triageOffline(validateTicket({ case_ref: "CASE-7", message: "How do I change my display theme?" }));
  assert.deepEqual([access.priority, access.category, access.route_to], ["P2", "account_access", "customer_support"]);
  assert.deepEqual([general.priority, general.category, general.route_to], ["P3", "general_support", "customer_support"]);
});

test("malformed, blank, and oversized tickets are rejected", () => {
  assert.throws(() => validateTicket(null));
  assert.throws(() => validateTicket({ case_ref: "CASE-4", message: " " }));
  assert.throws(() => validateTicket({ case_ref: "CASE-5", message: "x".repeat(4097) }));
});
