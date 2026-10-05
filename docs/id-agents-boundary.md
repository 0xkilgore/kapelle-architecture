# Orchestration and the IDAgents boundary

Updated October 5, 2026.

Kapelle began around [IDAgents](https://github.com/idchain-world/id-agents). Its private deployment uses a substantially extended fork and associated Manager/Framework components. Do not assume current upstream IDAgents implements every Kapelle workflow or that this repository is a distribution of that fork.

Upstream IDAgents uses [MIT](https://github.com/idchain-world/id-agents/blob/main/LICENSE). Kapelle's public reference code also uses MIT; copied upstream code must retain its applicable notices.

## Responsibility map

| Layer | Responsibility |
|---|---|
| Upstream IDAgents | Starting orchestration substrate for named agents, teams and runtime integration; consult upstream for its current supported API |
| Kapelle private extensions | Native agent/dispatch/review records, bounded execution and result-publication integration, recovery and source-context bindings; installation maturity varies |
| Kapelle operator product | Inbox recommendations, Tasks, Reports, References, Collections, projects, review and the return of results to Today |
| This public repository | Small standalone reducers, command store, local inference boundary and synthetic examples; no complete fork or runnable private fleet |

## Can another harness replace it?

That is the intended boundary. Model choice, agent identity, execution runtime and orchestration are different concerns. A Claude or Codex conversation is not required to own Kapelle's persistent state. A custom harness could implement the execution boundary, but replacement is engineering work, not a configuration toggle proven here.

A proposed adapter should preserve:

1. Stable agent identity and discoverable capabilities, including what tools are actually available.
2. Accepted instructions and explicit source/context references, plus receipts for inputs actually resolved.
3. Durable request identity, conflict handling, attempt status and recovery after lost acknowledgments.
4. Honest outcomes: queued, running, needs input, completed, failed, cancelled or uncertain, with supported transitions.
5. Result identity, content version, producing run, publisher and links back to the original work.
6. Authorization boundaries: access to a source is not permission to publish or modify it.
7. Provider-contact and effect evidence sufficient to recover without blindly repeating external actions.

These are proposed interoperability requirements. The [public protocol](contracts.md) illustrates a subset; no universal adapter certification is claimed.

## First conformance journey

Use synthetic data to submit one approved request, recover its identity across a restart, return one versioned result and link it to the original Task. Then test conflicting request reuse, unavailable context, capability mismatch and uncertain execution. Only after that should a deployment admit real sources and providers.

An HTTP connection alone is not conformance. A harness must preserve the meaning of work and its evidence across the boundary.
