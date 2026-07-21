import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CommandStore } from "./store.js";

const port = Number(process.env.PORT ?? 4400);
const storePath = process.env.KAPELLE_COMMAND_LOG ?? join(tmpdir(), "kapelle-reference", "commands.ndjson");
const store = await new CommandStore(storePath).open();

const server = createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/health") {
      return json(response, 200, { status: "ok", protocol: "kapelle.protocol.v1" });
    }

    if (request.method === "GET" && request.url === "/commands") {
      return json(response, 200, { commands: store.list() });
    }

    if (request.method === "POST" && request.url === "/commands") {
      const idempotencyKey = request.headers["idempotency-key"];
      if (!idempotencyKey) return json(response, 400, { error: "idempotency-key header is required" });
      const body = await readJson(request);
      const result = await store.accept(body, idempotencyKey);
      return json(response, result.duplicate ? 200 : 202, result);
    }

    const match = request.method === "GET" && request.url?.match(/^\/commands\/(command:[a-f0-9-]+)$/);
    if (match) {
      const command = store.get(match[1]);
      return command ? json(response, 200, command) : json(response, 404, { error: "not_found" });
    }

    return json(response, 404, { error: "not_found" });
  } catch (error) {
    return json(response, 400, { error: error.message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Kapelle reference control plane listening on http://127.0.0.1:${port}`);
  console.log(`Durable command log: ${storePath}`);
});

function json(response, status, value) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(value, null, 2));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
