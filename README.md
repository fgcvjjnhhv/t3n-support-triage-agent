# ShieldDesk: T3N Support Triage Agent

ShieldDesk turns incoming support tickets into a case reference, priority, category, and routing decision. The Rust component is designed to run as a Terminal 3 TEE contract. Its output contains routing metadata only, never the ticket body or contact details; account-security reports always go to a human responder.

The decision engine is deterministic and rules-first. This is an auditable support workflow example, not a trained language model, a production security certification, or a substitute for human review. All included tickets are synthetic.

## Run offline

Requires Node.js 20+ and Rust 1.98.1. The Rust version is pinned in `rust-toolchain.toml` for repeatable builds.

```powershell
npm install
npm run demo:offline
npm test
npm run contract:test
```

These checks run locally without T3N credentials. They do not prove that the contract has run in the hosted T3N enclave.

On Windows, the Rust unit tests also need the MSVC C++ Build Tools and Windows SDK. After the repository is pushed, the included GitHub Actions workflow runs the full checks on Linux and uploads the WASM component as a short-lived artifact. If your Windows machine lacks MSVC, download that artifact and place the file at `contract/target/wasm32-wasip2/release/t3n_support_triage.wasm` before running `npm run t3n:register`.

## Run on T3N testnet

Claim two separate test keys and credit allocations from the [official T3N claim page](https://docs.terminal3.io/developers/adk/get-started/prerequisites/request-test-tokens). The page currently requires a work email, and each developer key is shown only once. Keep the keys in your local PowerShell session; never paste them into chat or commit them.

```powershell
$env:T3N_TENANT_KEY = '<owner-test-key>'
$env:T3N_AGENT_KEY = '<separate-agent-test-key>'
rustup target add wasm32-wasip2
npm run t3n:connect
npm run contract:build
npm run t3n:register
npm run t3n:grant
npm run demo:testnet
```

The owner grants the agent DID permission to call only `triage-ticket`; the grant has no egress hosts. The contract imports no network, secret-store, or logging capability, and it does not persist ticket contents. T3N test credits and rate limits apply.

`t3n:register` prints a contract ID. Re-registering creates a new contract ID; update `app/scripts/demo-testnet.ts` and `app/scripts/grant-agent.ts` if you change the contract tail or version.

## Example result

```json
{
  "case_ref": "CASE-DEMO-01",
  "priority": "P0",
  "category": "account_security",
  "route_to": "security_on_call",
  "response_policy": "human_review_required_no_automated_resolution"
}
```

## Limits

This contest prototype uses a small keyword ruleset. A real deployment needs organization-specific policies, localization, privacy and retention review, and careful human escalation. It does not connect to a CRM or send replies. The hosted T3N flow remains unverified until the documented testnet walkthrough succeeds.

## References

- [T3N Quickstart](https://docs.terminal3.io/developers/adk/get-started/quickstart)
- [Claim T3N test key and credits](https://docs.terminal3.io/developers/adk/get-started/prerequisites/request-test-tokens)
- [Write a TEE contract](https://docs.terminal3.io/developers/adk/get-started/walkthrough/write-contract)
- [Member Delegation](https://docs.terminal3.io/developers/adk/get-started/member-delegation)
- [Verify the trust anchor](https://docs.terminal3.io/developers/adk/tips/verify-trust-anchor)

