export type Ticket = { case_ref: string; message: string };
export type TriageResult = {
  case_ref: string;
  priority: "P0" | "P1" | "P2" | "P3";
  category: "account_security" | "billing" | "account_access" | "general_support";
  route_to: "security_on_call" | "billing_support" | "customer_support";
  response_policy: string;
};

export function validateTicket(value: unknown): Ticket {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Ticket must be a JSON object.");
  const { case_ref, message } = value as Record<string, unknown>;
  if (typeof case_ref !== "string" || case_ref.length < 1 || case_ref.length > 64) throw new Error("case_ref must be 1–64 characters.");
  if (typeof message !== "string" || message.trim().length < 1 || Buffer.byteLength(message, "utf8") > 4096) throw new Error("message must be non-empty and no more than 4096 bytes.");
  return { case_ref, message };
}

// Local reference implementation for offline demos. The hosted TEE contract is the source
// of truth on testnet; keep this copy behaviorally aligned and covered by the same fixtures.
export function triageOffline(ticket: Ticket): TriageResult {
  const message = ticket.message.toLowerCase();
  if (["account takeover", "unauthorized access", "security breach", "stolen account"].some((term) => message.includes(term))) {
    return { case_ref: ticket.case_ref, priority: "P0", category: "account_security", route_to: "security_on_call", response_policy: "human_review_required_no_automated_resolution" };
  }
  if (["charged twice", "duplicate charge", "payment failed", "refund"].some((term) => message.includes(term))) {
    return { case_ref: ticket.case_ref, priority: "P1", category: "billing", route_to: "billing_support", response_policy: "verify_transaction_before_refund" };
  }
  if (["cannot log in", "can't log in", "locked out", "login issue"].some((term) => message.includes(term))) {
    return { case_ref: ticket.case_ref, priority: "P2", category: "account_access", route_to: "customer_support", response_policy: "send_account_recovery_steps" };
  }
  return { case_ref: ticket.case_ref, priority: "P3", category: "general_support", route_to: "customer_support", response_policy: "human_review_before_reply" };
}
