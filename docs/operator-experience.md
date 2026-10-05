# Operator experience

This document describes the product target. Today is the current operator landing surface; “My Desk” describes its intended role. Activity, universal delegation and the full control set below are not all deployed. See [status](status.md) and [workflows](workflows.md).

## Design goal

The interface should reduce the work required to understand the fleet. Rendering every event is not observability. It is another inbox.

## My Desk

My Desk contains operator-facing artifacts, not internal build receipts or agent chatter.

Examples include:

- a requested research report;
- a recurring morning briefing;
- a draft prepared for review;
- a project update;
- a decision memo.

The default order is recency tempered by importance. A short first view can expand into history and search.

## Agent Activity

Activity answers three questions:

- What is currently in flight?
- What is queued?
- What recently landed?

Each agent also exposes its current assignment, runtime and model, latest output, and recent history.

## Needs Attention

This surface contains only genuine operator actions:

- a decision required to continue;
- an approval or rejection;
- feedback requested on an artifact;
- a failed operation requiring human intervention;
- a system change that requires authorization.

Routine worktree cleanup and retry reconciliation should be handled automatically or appear under diagnostics. The operator should not become the fleet janitor.

## Tasks

Tasks are durable objects, not checkboxes floating beside artifacts.

Any artifact can produce a task. The task records the requested human or agent action, owner, due date, project, source artifact, and completion history.

## System Health

Health should be brief by default and explanatory when degraded. It includes control-plane readiness, stalled work, projection freshness, storage, runtime availability, and truthful usage information.

## Artifact reader

The output is primary. Metadata and review controls support it rather than pushing it down the page.

The reader should provide:

- title, source, authoring agent, and time;
- immediate readable content;
- search and recency sorting;
- review, comment, approve, reject, or supersede actions;
- create-task action;
- provenance and operation history on demand.

## Attention hierarchy

The same event should not appear three times on the first screen. Each fact has one primary home and may be linked elsewhere.

```text
operator output        -> My Desk
execution lifecycle    -> Agent Activity
human decision         -> Needs Attention
action commitment      -> Tasks
system condition       -> System Health
```
