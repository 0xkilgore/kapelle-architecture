# Agent governance and durable context

Updated September 22, 2026. This document describes the current private implementation direction and its limits. The public Task/Dispatch Journal examples are smaller dependency-free reference models, not exports of the native Powerhouse/Vetra packages.

## Authority and responsibility

| Record or boundary | Responsibility | What it does not prove |
|---|---|---|
| Task Authority / Task document | Human commitment, task state, revision and relationships | Agent execution or publication permission |
| Agent Definition | Versioned role and capability/policy description | That every prose policy is enforced |
| Agent Instance | Particular agent identity and definition reference | Current worker liveness |
| Dispatch | Accepted work, actor, offer, instructions and result references | External effect merely because a result exists |
| Report Registry / Report | Reviewable output and content identity | Approval or successful publication |
| Review Intent | Owner decision about a bound proposal/output | That an external provider applied it |
| Saved context receipt | Which exact inputs were actually resolved | That all offered inputs were read or remain accessible |
| Manager queue / execution recovery records | Durable delivery, attempts, recovery and effect observations | A native document model simply because the data is persistent |

The private framework contains native Agent Definition, Agent Instance, Dispatch and Review Intent models. Task Authority and Report Registry are separate authorities. Context receipts and some service journals remain separate durable records. The long-term goal is coherent portability, not relabeling every database row as a document.

## What Powerhouse/Vetra contributes

The native document approach packages typed state, permitted operations, reducers, revisions and operation history. This supports attributable changes and replayable state. Kapelle combines those model boundaries with runtime authorization, current source access checks and restricted execution adapters.

A document model cannot independently control an external deployment provider or make arbitrary natural-language policy executable. An `operatingPolicy` description is context until code enforces its meaning. Credentials, current access, expected revisions, proposal identity and provider settlement need their own explicit checks.

## Saved context, not chat memory

A dispatch binds accepted instructions and source references. A resolved context receipt records what the worker actually obtained. Kapelle distinguishes:

1. **Offered inputs:** the references included with the request.
2. **Resolved inputs:** the verified subset assembled for execution.
3. **Output:** the Report identity, content version and hash bound to the producing run.

A model conversation is useful interaction history; it is not the sole source of any of these facts. A uniform file/notes organization and retrieval system for every agent remains unfinished.

## Read projection and integrity

The qualified development projection uses exact configured identities rather than listing the whole library or joining by titles. It checks the Task, producing Dispatch, agent definition/instance, accepted instructions and Report. It independently pins an instructions hash. Report read/feedback revisions are distinct from immutable output content identity.

The upstream reader authenticates the offered inventory against the complete offer. The UI server does not independently reconstruct an offered-set digest. That is an explicit trust boundary. The offered list cannot substitute for a resolved receipt or authorize effects.

Source reads are bounded by time and size, checked again for detected changes, and represented as verified, unavailable, changed, denied or unbound. This is not an atomic transaction across stores. Historical observations are labeled historical.

The context endpoint performs no command, recovery, resolution or provider action. Full report pages can separately mark a report read; endpoint read-only evidence should not be generalized to every page interaction.

## Approval, execution and recovery

Approval binds a specific proposal, reviewed output and expected state. Retries retain their operation identity and original request. Native admission checks revisions and rejects conflicting reuse. Recording a decision, queuing work, provider contact, verified publication and task completion remain separate facts.

External-provider recovery must distinguish no contact from uncertain contact and verified effect. A timeout is not proof of failure; an internal lock is not proof that no other provider writer exists. Production publication settlement remains a gate.

## Current installation constraints

The retained-context reader refuses active WAL databases before querying because even a SELECT can affect shared-memory readmarks. An admitted immutable non-WAL artifact or a separately qualified read capability is required. The candidate does not silently checkpoint a live store.

Existing real records do not yet establish the complete producing Dispatch/Report/context chain. The current Report adapter also needs an authoritative content-version and owner/scope contract; a successful authenticated read alone is not per-record access proof. Old bindings missing new required integrity pins are rejected, not auto-filled. Host adoption must be explicit.

These limits are implementation work to complete, not properties guaranteed by choosing Powerhouse/Vetra.
