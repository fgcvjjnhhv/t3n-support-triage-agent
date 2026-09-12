import { authenticate, requiredEnv } from "../src/auth.js";

const { tenant, did } = await authenticate(requiredEnv("T3N_TENANT_KEY"));
await tenant.tenant.me();
console.log("Connected to T3N testnet as:", did);
console.log("TenantClient ready.");
