# Executable contract index

This index points to what this repository actually implements. Native private contracts are separate and are not reproduced by illustrative examples.

| Boundary | Source | Verification / limitation |
|---|---|---|
| Dispatch vocabulary | [protocol](../packages/protocol/src/index.js) | Lifecycle values used by the public reducer |
| Task operations | [task reducer](../packages/document-models/src/task.js) | CREATE_TASK, ASSIGN_TASK, LINK_TASK_SOURCE, BLOCK_TASK, REOPEN_TASK, COMPLETE_TASK |
| Dispatch transitions | [Dispatch reducer](../packages/document-models/src/dispatch-journal.js) | Replayed by the synthetic lifecycle fixture |
| Durable command acceptance | [store](../apps/reference-control-plane/src/store.js) | Reference restart/idempotency tests; no external exactly-once guarantee |
| Loopback HTTP API | [server](../apps/reference-control-plane/src/server.js) | GET /health, GET /commands, GET /commands/:id, POST /commands with idempotency-key |
| Local inference policy | [gateway](../packages/local-inference/src/index.js) | Controlled tests; explicit local-only admission and no cloud fallback |
| Connected documents | [illustrative records](../fixtures/knowledge-workflow.json) | A teaching fixture, not a native schema or executable Report/Collection authority |

`POST /commands` records a command. It does not schedule a worker, validate production authorization, call an LLM or generate a result. The sample server is a loopback development reference, not a production service.

The reducers illustrate legal lifecycle transitions. They do not independently authenticate actors, verify external receipts, enforce all native revision/idempotency rules, or prove that an asserted effect occurred. Those checks belong in production admission and adapter boundaries. The lifecycle fixture's integration receipt is synthetic data, not an observed publication.

For alternative harness requirements, see [the orchestration boundary](id-agents-boundary.md).
