# Agent guide

This repository is Kapelle's public architecture and executable reference. It is not the private console or a turnkey agent host.

## Read in this order

1. [README](README.md): purpose, entry points, scope.
2. [Current status](docs/status.md): dated implementation and deployment distinctions.
3. [Document models](docs/document-models.md): objects, relationships, source of truth.
4. [Workflows](docs/workflows.md): operator journeys and remaining gaps.
5. [Contract index](docs/contracts.md): actual executable interfaces and limits.
6. [Orchestration boundary](docs/id-agents-boundary.md): upstream, fork, and alternative harnesses.

## Work locally

Node.js 20+; no third-party runtime dependencies or provider credentials required.

- `npm test`: reference contract tests.
- `npm run demo`: replay synthetic Dispatch operations.
- `npm run walkthrough`: inspect connected synthetic Task, Dispatch, Reference, Collection and Report records.
- `npm run serve`: loopback command-acceptance API; does not launch an agent.

Preserve the distinction between reference examples, private implementation evidence, and future design. Do not translate illustrative record fields into claims about native API compatibility. Do not describe a queued command as completed work. No command in this repository requires access to the private deployment.

Use synthetic data and public URLs in examples. Do not add personal messages, private record identifiers, deployment addresses, filesystem paths, credentials, or operational recovery packets. Preserve third-party notices; MIT applies to this repository's original work, not every linked project. Update dated status when changing maturity claims. See [contribution guidance](CONTRIBUTING.md).
