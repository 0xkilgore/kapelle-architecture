# Public architecture roadmap

This roadmap describes architectural outcomes, not delivery promises.

## Phase 1: one coherent operator surface

Status: in progress

- Consolidate around one fast console.
- Establish My Desk, Agent Activity, Needs Attention, Tasks, and System Health.
- Separate operator-facing artifacts from system artifacts.
- Make artifact reading and feedback a first-class workflow.
- Preserve older diagnostics until capabilities are migrated or explicitly retired.

## Phase 2: trustworthy lifecycle

Status: in progress

- Durable asynchronous command acceptance.
- Structured clarification and disposition states.
- Idempotent retries and duplicate reconciliation.
- Completion-to-integration receipts.
- Bounded health and projection freshness.
- Verifiable runtime and usage records.

## Phase 3: document authority

Status: in progress

- Typed Task, Artifact, Inbox Item, Dispatch Journal, Work Lease, and System Health documents.
- Append-only operations with actor attribution.
- Stable references between documents.
- Shadow projections and parity checks.
- Canary authority transfer with rollback.
- Eliminate filesystem scans as an operator read path.

## Phase 4: second-user product

Status: proposed

- Clean onboarding and starter agent templates.
- Multi-user access to selected agents.
- Shared projects with explicit permissions.
- Portable agent and document packages.
- Remote access without sacrificing local ownership.

## Phase 5: agent ecosystem

Status: proposed

- Discoverable specialized agents.
- Free local capabilities with optional paid services.
- Provider-neutral execution.
- Portable identity, permissions, and service receipts.
- Interoperability between organizations through agents rather than proprietary application silos.

## Current architectural questions

- Which primitives should ID Agents guarantee as a stable upstream contract?
- How much Powerhouse compatibility should Kapelle adopt directly?
- Which document becomes the first authoritative control-plane wedge?
- How should exact, estimated, and unavailable usage data appear together?
- What is the smallest second-user workflow that proves the product travels beyond its creator?
