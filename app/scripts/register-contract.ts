import { readFile } from "node:fs/promises";
import { authenticate, requiredEnv } from "../src/auth.js";

const { tenant, did } = await authenticate(requiredEnv("T3N_TENANT_KEY"));
await tenant.tenant.me();
const wasmPath = new URL("../../contract/target/wasm32-wasip2/release/t3n_support_triage.wasm", import.meta.url);
const wasm = await readFile(wasmPath);
const result = await tenant.contracts.register({ tail: "support-triage", version: "0.1.0", wasm });
console.log(JSON.stringify({ tenantDid: did, contractId: result.contract_id, tail: "support-triage", version: "0.1.0" }, null, 2));
console.log("Record contractId locally; re-registering this tail allocates a new contract ID.");
