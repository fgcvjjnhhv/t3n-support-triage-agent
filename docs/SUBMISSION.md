# T3N Agent Bounty Submission Draft

- **Project:** ShieldDesk — least-privilege support triage agent
- **Status:** Draft. The repository is public and Linux CI passes. Run the T3N testnet walkthrough, add genuine screenshots, and choose the maintenance preference before submission.

## Summary

ShieldDesk routes incoming support tickets to a human team using a small, auditable policy engine. It recognizes account-security, billing, account-access, and general-support cases. Security incidents are always escalated to a human responder; the agent never resolves them automatically. The returned object contains only a case reference and routing metadata, never the ticket body.

## Why T3N

The Rust triage function is packaged as a WASM component with the T3N `contracts` interface. The app connects through the official T3N SDK and verifies the testnet trust anchor. The owner grants a separate agent DID permission to call only `triage-ticket`; the contract has no network, logging, secret-store, or persistence imports, so there are no egress hosts to authorize.

## Reproduce locally

```powershell
npm install
npm run demo:offline
npm test
npm run contract:test
```

Then follow the testnet walkthrough in `README.md` with two test keys kept in the local shell. Register the WASM component, grant the function to the agent DID, and invoke it using only the synthetic sample ticket.

## Evidence to add after the testnet run

- Public repository: https://github.com/fgcvjjnhhv/t3n-support-triage-agent
- Linux CI: https://github.com/fgcvjjnhhv/t3n-support-triage-agent/actions/runs/34687473133 — successful TypeScript checks, offline tests, Rust tests, and WASM build.
- Testnet run: not yet performed. Claim two separate test keys and credit allocations from the official T3N page; keep both keys local and never add them to this document.
- Screenshot 1: successful testnet connection and owner DID (redact addresses if desired)
- Screenshot 2: the registered contract and one-function delegation
- Screenshot 3: synthetic test ticket and returned P0 routing JSON
- Bugs or setup issues encountered: On the author's Windows machine, native Rust linking is unavailable because the machine has no MSVC C++ Build Tools/Windows SDK. The hosted Linux workflow now passes Rust tests and builds the WASM component. An initial CI test assertion and formatting issue were fixed; neither indicated a T3N defect.
- Maintenance preference: `<CONTINUE MAINTAINING / HAND OVER TO TERMINAL 3>`

## Known limits

The classifier is deterministic and rules-first, not a trained language model. This prototype does not connect to a CRM, send customer replies, or claim production security certification. Local TypeScript tests do not establish that the contract has built or run inside the hosted T3N enclave; that claim requires a successful testnet walkthrough.

## Submission links

- Bounty listing: https://superteam.fun/earn/listing/t3n-agent-build-challenge
- T3N Quickstart: https://docs.terminal3.io/developers/adk/get-started/quickstart
- T3N contract walkthrough: https://docs.terminal3.io/developers/adk/get-started/walkthrough/write-contract
- T3N Member Delegation: https://docs.terminal3.io/developers/adk/get-started/member-delegation
