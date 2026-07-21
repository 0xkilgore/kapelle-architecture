# Boundary with ID Agents

## Complementary roles

ID Agents is a promising open substrate for named agents, teams, runtimes, and manager-directed work. Kapelle is the operator product above that substrate.

The boundary should remain explicit so each project can stay coherent.

## Capabilities that belong upstream

- stable agent and team identities;
- versioned public API and event contract;
- durable asynchronous dispatch;
- attempt, lease, retry, and cancellation lifecycle;
- clarification and terminal dispositions;
- runtime and model adapters;
- truthful runtime and usage receipts;
- portable working-directory configuration;
- deterministic script triggers;
- bounded health and lifecycle diagnostics.

## Capabilities that belong in Kapelle

- My Desk and artifact ranking;
- projects, tracks, and operator tasks;
- cross-document views and search;
- artifact reading, review, and feedback;
- domain-specific document models;
- recurring workflows and personal automation;
- product-specific integration and release policy;
- the visual operator shell.

## Public contract requirement

Kapelle should depend on documented interfaces, not private database tables or desktop implementation details.

The ideal upstream contract includes:

- semantic versioning;
- compatibility and deprecation policy;
- stable identifiers;
- resumable events;
- capability discovery;
- an API-only conformance client;
- one release of backward compatibility testing.

## Near-term interoperability experiment

A useful first experiment would demonstrate one complete lifecycle:

1. Kapelle submits a durable dispatch through the public API.
2. ID Agents runs a named agent or deterministic script.
3. The result emits a typed artifact event.
4. Kapelle displays the artifact on My Desk.
5. The operator comments or creates a task.
6. The action resumes or dispatches follow-up work through the same public contract.

Success is not a shared screen. Success is a restart-safe lifecycle with stable identity and evidence across both systems.
