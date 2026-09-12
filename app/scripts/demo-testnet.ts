import { authenticate, requiredEnv } from "../src/auth.js";
import { getContractVersion, getNodeUrl } from "@terminal3/t3n-sdk";
import { validateTicket } from "../src/triage.js";

const owner = await authenticate(requiredEnv("T3N_TENANT_KEY"));
const agent = await authenticate(requiredEnv("T3N_AGENT_KEY"));
const tenantId = owner.did.slice("did:t3n:".length);
const contractId = `z:${tenantId}:support-triage`;
const version = await getContractVersion(getNodeUrl(), contractId);
const ticket = validateTicket({
  case_ref: "CASE-DEMO-01",
  message: "I see an account takeover and unauthorized access. This is synthetic test data.",
});
const result = await agent.client.executeAndDecode({
  contract_id: contractId,
  contract_version: version,
  function_name: "triage-ticket",
  input: ticket,
});
console.log(JSON.stringify({ tenantDid: owner.did, agentDid: agent.did, contractId, version, result }, null, 2));
