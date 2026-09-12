# T3N Support Triage Agent

This repository is a Terminal 3 Agent Developer Kit (ADK) example. Follow the official T3N quickstart order: scaffold, authenticate on testnet, build and test the Rust/WASM contract, then register and invoke it. Never commit API keys, private keys, wallet secrets, real customer tickets, or personal data.

Keep the contract's imported host capabilities minimal. The triage contract makes no network calls, stores no ticket data, and must not echo raw ticket text into its return value or logs. The included rule engine is deterministic; do not describe it as an LLM or claim production security based only on local tests.

Use separate `T3N_TENANT_KEY` and `T3N_AGENT_KEY` values. The agent receives permission for one contract function only. Test using synthetic sample tickets and the T3N test environment.

Official references:
- https://docs.terminal3.io/developers/adk/get-started/quickstart
- https://docs.terminal3.io/developers/adk/get-started/walkthrough/write-contract
- https://docs.terminal3.io/developers/adk/get-started/walkthrough/test
- https://docs.terminal3.io/developers/adk/get-started/member-delegation
