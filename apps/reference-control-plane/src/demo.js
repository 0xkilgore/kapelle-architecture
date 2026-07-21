import { readFile } from "node:fs/promises";
import { replayDispatch } from "../../../packages/document-models/src/index.js";

const fixture = JSON.parse(await readFile(new URL("../../../fixtures/dispatch-lifecycle.json", import.meta.url), "utf8"));
const state = replayDispatch(fixture.document_id, fixture.operations);

console.log("Replayed lifecycle:");
for (const operation of fixture.operations) console.log(`  ${operation.type}`);
console.log("\nFinal state:");
console.log(JSON.stringify(state, null, 2));
