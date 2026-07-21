import { DispatchStatus, OperationType } from "../../protocol/src/index.js";

const terminal = new Set([
  DispatchStatus.INTEGRATED,
  DispatchStatus.CANCELLED,
  DispatchStatus.DECLINED,
  DispatchStatus.DUPLICATE,
  DispatchStatus.SUPERSEDED,
  DispatchStatus.FAILED_TERMINAL
]);

export function initialDispatchState(id) {
  return {
    id,
    revision: 0,
    status: null,
    subject: null,
    agent_id: null,
    idempotency_key: null,
    attempt: 0,
    lease: null,
    clarification: null,
    evidence_refs: [],
    runtime_receipts: [],
    integration_receipt: null,
    disposition: null
  };
}

export function reduceDispatch(state, operation) {
  if (terminal.has(state.status)) {
    throw new Error(`dispatch is terminal: ${state.status}`);
  }

  const next = structuredClone(state);

  switch (operation.type) {
    case OperationType.REQUEST_DISPATCH:
      requireStatus(state, null);
      next.status = DispatchStatus.REQUESTED;
      next.subject = required(operation.input.subject, "subject");
      next.agent_id = required(operation.input.agent_id, "agent_id");
      next.idempotency_key = required(operation.input.idempotency_key, "idempotency_key");
      break;
    case OperationType.ACCEPT_DISPATCH:
      requireStatus(state, DispatchStatus.REQUESTED);
      next.status = DispatchStatus.ACCEPTED;
      break;
    case OperationType.CLAIM_LEASE:
      requireOneOf(state, [DispatchStatus.ACCEPTED, DispatchStatus.FAILED_RETRYABLE]);
      next.status = DispatchStatus.LEASED;
      next.lease = {
        worker_id: required(operation.input.worker_id, "worker_id"),
        fencing_token: required(operation.input.fencing_token, "fencing_token"),
        expires_at: required(operation.input.expires_at, "expires_at")
      };
      break;
    case OperationType.START_ATTEMPT:
      requireStatus(state, DispatchStatus.LEASED);
      next.status = DispatchStatus.RUNNING;
      next.attempt += 1;
      if (operation.input.runtime_receipt) next.runtime_receipts.push(operation.input.runtime_receipt);
      break;
    case OperationType.REQUEST_CLARIFICATION:
      requireStatus(state, DispatchStatus.RUNNING);
      next.status = DispatchStatus.NEEDS_CLARIFICATION;
      next.lease = null;
      next.clarification = {
        id: required(operation.input.clarification_id, "clarification_id"),
        question: required(operation.input.question, "question"),
        recommendation: operation.input.recommendation ?? null,
        answer: null
      };
      break;
    case OperationType.RESUME_DISPATCH:
      requireStatus(state, DispatchStatus.NEEDS_CLARIFICATION);
      next.status = DispatchStatus.ACCEPTED;
      next.clarification.answer = required(operation.input.answer, "answer");
      break;
    case OperationType.COMPLETE_EXECUTION:
      requireStatus(state, DispatchStatus.RUNNING);
      next.status = DispatchStatus.EXECUTION_COMPLETED;
      next.lease = null;
      break;
    case OperationType.ATTACH_EVIDENCE:
      requireOneOf(state, [DispatchStatus.EXECUTION_COMPLETED, DispatchStatus.EVIDENCE_ATTACHED]);
      next.status = DispatchStatus.EVIDENCE_ATTACHED;
      for (const ref of operation.input.evidence_refs ?? []) {
        if (!next.evidence_refs.includes(ref)) next.evidence_refs.push(ref);
      }
      break;
    case OperationType.ACCEPT_OUTPUT:
      requireStatus(state, DispatchStatus.EVIDENCE_ATTACHED);
      next.status = DispatchStatus.ACCEPTED_BY_OPERATOR;
      break;
    case OperationType.RECORD_INTEGRATION:
      requireStatus(state, DispatchStatus.ACCEPTED_BY_OPERATOR);
      next.status = DispatchStatus.INTEGRATED;
      next.integration_receipt = required(operation.input.receipt, "receipt");
      break;
    case OperationType.DISPOSE_DISPATCH:
      next.status = required(operation.input.status, "status");
      if (!terminal.has(next.status) && next.status !== DispatchStatus.FAILED_RETRYABLE) {
        throw new Error(`invalid disposition ${next.status}`);
      }
      next.disposition = operation.input.reason ?? null;
      next.lease = null;
      break;
    default:
      throw new Error(`unsupported dispatch operation ${operation.type}`);
  }

  next.revision += 1;
  return next;
}

export function replayDispatch(id, operations) {
  return operations.reduce(reduceDispatch, initialDispatchState(id));
}

function requireStatus(state, status) {
  if (state.status !== status) throw new Error(`expected ${status}, got ${state.status}`);
}

function requireOneOf(state, statuses) {
  if (!statuses.includes(state.status)) throw new Error(`expected ${statuses.join(" or ")}, got ${state.status}`);
}

function required(value, name) {
  if (value === undefined || value === null || value === "") throw new Error(`${name} is required`);
  return value;
}
