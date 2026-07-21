import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { CommandStore } from "../apps/reference-control-plane/src/store.js";
import { createOperation, DispatchStatus, OperationType, PROTOCOL_VERSION } from "../packages/protocol/src/index.js";
import { initialDispatchState, reduceDispatch, replayDispatch } from "../packages/document-models/src/index.js";

test("protocol creates attributable versioned operations", () => {
  const operation = createOperation({
    id: "op:1",
    documentId: "dispatch:1",
    type: OperationType.REQUEST_DISPATCH,
    actor: "user:operator",
    at: "2026-01-01T00:00:00Z",
    input: { subject: "Test" }
  });
  assert.equal(operation.protocol, PROTOCOL_VERSION);
  assert.equal(operation.actor, "user:operator");
  assert(Object.isFrozen(operation));
});

test("fixture replays to integrated evidence-backed state", async () => {
  const fixture = JSON.parse(await readFile(new URL("../fixtures/dispatch-lifecycle.json", import.meta.url), "utf8"));
  const state = replayDispatch(fixture.document_id, fixture.operations);
  assert.equal(state.status, DispatchStatus.INTEGRATED);
  assert.equal(state.attempt, 2);
  assert.deepEqual(state.evidence_refs, ["artifact:briefing"]);
  assert.equal(state.integration_receipt.verified, true);
  assert.equal(state.clarification.answer, "Lead with product.");
});

test("clarification releases the execution lease", () => {
  const requested = reduceDispatch(initialDispatchState("dispatch:1"), op(OperationType.REQUEST_DISPATCH, {
    subject: "Test", agent_id: "agent:test", idempotency_key: "key:1"
  }));
  const accepted = reduceDispatch(requested, op(OperationType.ACCEPT_DISPATCH));
  const leased = reduceDispatch(accepted, op(OperationType.CLAIM_LEASE, {
    worker_id: "worker:1", fencing_token: "token:1", expires_at: "2026-01-01T00:05:00Z"
  }));
  const running = reduceDispatch(leased, op(OperationType.START_ATTEMPT));
  const blocked = reduceDispatch(running, op(OperationType.REQUEST_CLARIFICATION, {
    clarification_id: "clarification:1", question: "Choose one"
  }));
  assert.equal(blocked.status, DispatchStatus.NEEDS_CLARIFICATION);
  assert.equal(blocked.lease, null);
});

test("terminal dispatch rejects late writes", async () => {
  const fixture = JSON.parse(await readFile(new URL("../fixtures/dispatch-lifecycle.json", import.meta.url), "utf8"));
  const state = replayDispatch(fixture.document_id, fixture.operations);
  assert.throws(() => reduceDispatch(state, op(OperationType.ATTACH_EVIDENCE, { evidence_refs: ["artifact:late"] })), /terminal/);
});

test("command acceptance is durable and idempotent across restart", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kapelle-reference-"));
  const path = join(directory, "commands.ndjson");
  const store = await new CommandStore(path).open();

  const first = await store.accept({ kind: "dispatch_agent" }, "same-key");
  const duplicate = await store.accept({ kind: "dispatch_agent" }, "same-key");
  assert.equal(first.duplicate, false);
  assert.equal(duplicate.duplicate, true);
  assert.equal(first.command.id, duplicate.command.id);

  const restarted = await new CommandStore(path).open();
  const afterRestart = await restarted.accept({ kind: "dispatch_agent" }, "same-key");
  assert.equal(afterRestart.duplicate, true);
  assert.equal(afterRestart.command.id, first.command.id);
});

function op(type, input = {}) {
  return { type, input };
}
