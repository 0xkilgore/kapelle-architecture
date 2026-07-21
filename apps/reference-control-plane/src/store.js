import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

export class CommandStore {
  constructor(path) {
    this.path = path;
    this.commands = new Map();
    this.idempotency = new Map();
  }

  async open() {
    await mkdir(dirname(this.path), { recursive: true });
    let content = "";
    try {
      content = await readFile(this.path, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      const command = JSON.parse(line);
      this.commands.set(command.id, command);
      this.idempotency.set(command.idempotency_key, command.id);
    }
    return this;
  }

  async accept(input, idempotencyKey) {
    const existingId = this.idempotency.get(idempotencyKey);
    if (existingId) return { command: this.commands.get(existingId), duplicate: true };

    const command = {
      id: `command:${crypto.randomUUID()}`,
      protocol: "kapelle.protocol.v1",
      status: "accepted",
      idempotency_key: idempotencyKey,
      accepted_at: new Date().toISOString(),
      input
    };

    await appendFile(this.path, `${JSON.stringify(command)}\n`, "utf8");
    this.commands.set(command.id, command);
    this.idempotency.set(idempotencyKey, command.id);
    return { command, duplicate: false };
  }

  get(id) {
    return this.commands.get(id) ?? null;
  }

  list() {
    return [...this.commands.values()];
  }
}
