# Architecture guide

This directory explains the product and system from the outside in.

## Start here

1. [Product thesis](product-thesis.md)
2. [Operator experience](operator-experience.md)
3. [System architecture](architecture.md)
4. [Document models](document-models.md)
5. [Durable control plane](control-plane.md)
6. [Boundary with ID Agents](id-agents-boundary.md)
7. [Public roadmap](roadmap.md)

## What is executable

The adjacent reference implementation turns the architecture into testable behavior:

- [`../packages/protocol`](../packages/protocol/src/index.js) defines the public lifecycle vocabulary.
- [`../packages/document-models`](../packages/document-models/src/index.js) implements pure reducers.
- [`../apps/reference-control-plane`](../apps/reference-control-plane/src/server.js) demonstrates durable acceptance and idempotency.
- [`../fixtures`](../fixtures/dispatch-lifecycle.json) provides a replayable lifecycle.
- [`../tests`](../tests/reference.test.js) states the architectural claims as acceptance tests.

## Maturity labels

- **Current:** demonstrated in the working private prototype.
- **Reference:** implemented in this repository to make a public contract concrete.
- **In progress:** being migrated or consolidated in the working system.
- **Proposed:** architectural direction that is not yet product truth.
