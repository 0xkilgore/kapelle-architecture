export const PROTOCOL_VERSION = "kapelle.protocol.v1";

export const DispatchStatus = Object.freeze({
  REQUESTED: "requested",
  ACCEPTED: "accepted",
  LEASED: "leased",
  RUNNING: "running",
  NEEDS_CLARIFICATION: "needs_clarification",
  EXECUTION_COMPLETED: "execution_completed",
  EVIDENCE_ATTACHED: "evidence_attached",
  ACCEPTED_BY_OPERATOR: "accepted_by_operator",
  INTEGRATED: "integrated",
  CANCELLED: "cancelled",
  DECLINED: "declined",
  DUPLICATE: "duplicate",
  SUPERSEDED: "superseded",
  FAILED_RETRYABLE: "failed_retryable",
  FAILED_TERMINAL: "failed_terminal"
});

export const OperationType = Object.freeze({
  REQUEST_DISPATCH: "REQUEST_DISPATCH",
  ACCEPT_DISPATCH: "ACCEPT_DISPATCH",
  CLAIM_LEASE: "CLAIM_LEASE",
  START_ATTEMPT: "START_ATTEMPT",
  REQUEST_CLARIFICATION: "REQUEST_CLARIFICATION",
  RESUME_DISPATCH: "RESUME_DISPATCH",
  COMPLETE_EXECUTION: "COMPLETE_EXECUTION",
  ATTACH_EVIDENCE: "ATTACH_EVIDENCE",
  ACCEPT_OUTPUT: "ACCEPT_OUTPUT",
  RECORD_INTEGRATION: "RECORD_INTEGRATION",
  DISPOSE_DISPATCH: "DISPOSE_DISPATCH"
});

export function createOperation({ id, documentId, type, actor, input = {}, at }) {
  if (!id || !documentId || !type || !actor) {
    throw new Error("operation requires id, documentId, type, and actor");
  }

  return Object.freeze({
    protocol: PROTOCOL_VERSION,
    id,
    document_id: documentId,
    type,
    actor,
    at: at ?? new Date().toISOString(),
    input: structuredClone(input)
  });
}

export function createRuntimeReceipt({
  dispatchId,
  attempt,
  requested,
  actual,
  fallbackReason = null,
  usage = { status: "unavailable", source: "runtime_did_not_report" }
}) {
  return Object.freeze({
    protocol: PROTOCOL_VERSION,
    dispatch_id: dispatchId,
    attempt,
    requested,
    actual,
    fallback_reason: fallbackReason,
    usage
  });
}

export function assertId(value, prefix) {
  if (typeof value !== "string" || !value.startsWith(`${prefix}:`)) {
    throw new Error(`expected ${prefix}: identifier`);
  }
  return value;
}
