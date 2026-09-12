import {
  T3nClient,
  TenantClient,
  createEthAuthInput,
  eth_get_address,
  fetchTrustedManifest,
  getNodeUrl,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
} from "@terminal3/t3n-sdk";

export async function authenticate(apiKey: string) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(apiKey)) {
    throw new Error("T3N API key must be a 0x-prefixed 32-byte test key.");
  }
  setEnvironment("testnet");
  const address = eth_get_address(apiKey);
  const wasmComponent = await loadWasmComponent();
  const client = new T3nClient({
    trustAnchor: await fetchTrustedManifest("testnet"),
    wasmComponent,
    handlers: { EthSign: metamask_sign(address, undefined, apiKey) },
  });
  await client.handshake();
  const did = (await client.authenticate(createEthAuthInput(address))).value;
  return { client, did, tenant: new TenantClient({ t3n: client, baseUrl: getNodeUrl(), tenantDid: did }) };
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing. Keep T3N keys in your local shell environment, never in source control.`);
  return value;
}
