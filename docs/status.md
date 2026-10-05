# Current implementation status

Updated October 5, 2026. This is a point-in-time public summary, not a live service monitor. Private implementation statements summarize development evidence; only the code and fixtures in this repository are independently runnable here.

| Capability | State | What that means |
|---|---|---|
| Task and Dispatch reference reducers | Public runnable reference | Small JavaScript examples; not the native Powerhouse packages |
| Command acceptance and replay | Public runnable reference | Persists accepted commands; does not run agents or perform external actions |
| Local-only inference boundary | Public runnable reference | Policy tests use controlled fixtures; no model weights included |
| Today, Inboxes, Tasks, Reports, People, Agents | Private prototype | Operator surfaces exist; not distributed by this repository |
| Email and Telegram text intake | Private prototype | Preserves source context and supports triage; routing coverage remains incomplete |
| Report publication and task read surfaces | Private prototype | Implemented with separate authorities and read projections; not a claim of universal availability |
| Bounded document review agents | Private pilot | Selected inputs can produce linked review Reports; not general-purpose website editing or research tooling |
| Native References and Collections | Development candidate; activation pending | Project association, membership, and filing are implemented in the candidate; project-page discovery remains unfinished |
| General delegation from a Task | Next development slice | Recommended action, approval, qualified agent execution and linked result need a complete accepted flow |
| Voice notes, automatic URL/media retrieval | Planned / incomplete | Saving a URL is not evidence its contents were fetched; voice-to-task is not claimed live |
| Interchangeable orchestration harnesses | Architectural goal | Adapter requirements are documented; arbitrary replacements are not certified |

## Current priorities

1. Finish Collections activation and desktop/phone acceptance, including a discoverable home for saved references.
2. Deliver one useful Task → approved agent work → linked Report on Today flow.
3. Improve inbox filing and classification without turning old review records into new commitments.

Routine intake, classification, approval, execution, and publication are separate steps. An LLM may recommend a disposition; deterministic code must validate permissions, identities, revisions and legal state transitions. None of this should depend on a particular development chat.

## Public versus private

This MIT-licensed repository contains reference code and documentation. It does not contain the complete console, native model packages, deployment configuration, personal records, or model weights. Opening this repository does not make every private component available under MIT.

The [September 22 status](status-2026-09-22.md) and its screenshots remain historical evidence. Their test counts and installation limitations describe that candidate, not the current release.
