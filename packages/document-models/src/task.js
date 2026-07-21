export function initialTaskState(id) {
  return {
    id,
    revision: 0,
    title: null,
    status: "uninitialized",
    owner: null,
    source_refs: [],
    completion_note: null
  };
}

export function reduceTask(state, operation) {
  const next = structuredClone(state);

  switch (operation.type) {
    case "CREATE_TASK":
      requireStatus(state, "uninitialized");
      next.title = required(operation.input.title, "title");
      next.owner = operation.input.owner ?? null;
      next.status = "open";
      break;
    case "ASSIGN_TASK":
      requireActive(state);
      next.owner = required(operation.input.owner, "owner");
      break;
    case "LINK_TASK_SOURCE":
      requireActive(state);
      if (!next.source_refs.includes(operation.input.source_ref)) {
        next.source_refs.push(required(operation.input.source_ref, "source_ref"));
      }
      break;
    case "BLOCK_TASK":
      requireActive(state);
      next.status = "blocked";
      break;
    case "REOPEN_TASK":
      if (!["blocked", "completed"].includes(state.status)) {
        throw new Error(`cannot reopen task from ${state.status}`);
      }
      next.status = "open";
      next.completion_note = null;
      break;
    case "COMPLETE_TASK":
      requireActive(state);
      next.status = "completed";
      next.completion_note = operation.input.completion_note ?? null;
      break;
    default:
      throw new Error(`unsupported task operation ${operation.type}`);
  }

  next.revision += 1;
  return next;
}

function requireActive(state) {
  if (!["open", "blocked"].includes(state.status)) {
    throw new Error(`task is not active: ${state.status}`);
  }
}

function requireStatus(state, status) {
  if (state.status !== status) throw new Error(`expected ${status}, got ${state.status}`);
}

function required(value, name) {
  if (!value) throw new Error(`${name} is required`);
  return value;
}
