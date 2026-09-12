import { triageOffline, validateTicket } from "../src/triage.js";

const ticket = validateTicket({
  case_ref: "CASE-DEMO-01",
  message: "I see an account takeover and unauthorized access. My email is demo@example.test.",
});
console.log("Synthetic ticket:", ticket.case_ref);
console.log("Triage result:", JSON.stringify(triageOffline(ticket), null, 2));
console.log("The raw message and email are not included in the result.");
