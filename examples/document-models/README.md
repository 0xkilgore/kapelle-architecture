# Example document contracts

These examples illustrate the intended boundary. They are not production schemas.

## Task

```json
{
  "id": "task:example",
  "revision": 3,
  "state": {
    "title": "Review the architecture brief",
    "status": "open",
    "owner": "user:operator",
    "source_ref": "artifact:architecture-brief"
  }
}
```

Example operation:

```json
{
  "operation_id": "op:example-1",
  "document_id": "task:example",
  "type": "COMPLETE_TASK",
  "expected_revision": 3,
  "actor": "user:operator",
  "timestamp": "2026-01-01T12:00:00Z",
  "input": {
    "completion_note": "Reviewed and shared"
  }
}
```

## Dispatch receipt

```json
{
  "dispatch_id": "dispatch:example",
  "status": "execution_completed",
  "requested_runtime": "provider-neutral",
  "actual_runtime": "example-runtime",
  "attempt": 1,
  "artifact_refs": ["artifact:architecture-brief"],
  "usage": {
    "status": "unavailable",
    "source": "runtime-did-not-report"
  }
}
```

The contract refuses to invent usage when the runtime does not supply it.
