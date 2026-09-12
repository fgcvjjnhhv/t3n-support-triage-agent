import { authenticate, requiredEnv } from "../src/auth.js";
import { getContractVersion, getNodeUrl } from "@terminal3/t3n-sdk";

const owner = await authenticate(requiredEnv("T3N_TENANT_KEY"));
const agent = await authenticate(requiredEnv("T3N_AGENT_KEY"));
const tenantId = owner.did.slice("did:t3n:".length);
const contractId = `z:${tenantId}:support-triage`;
const version = await getContractVersion(getNodeUrl(), contractId);
await owner.client.updateMemberDelegation({
  grantee: agent.did,
  contract_id: contractId,
  version_req: version,
  functions: ["triage-ticket"],
  scopes: [],
  allowed_hosts: [],
});
console.log(JSON.stringify({ agentDid: agent.did, contractId, version, functions: ["triage-ticket"], scopes: [], allowedHosts: [] }, null, 2));
