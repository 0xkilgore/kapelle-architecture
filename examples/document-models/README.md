# Synthetic document walkthrough

From the repository root with Node.js 20+:

```sh
npm test
npm run demo
npm run walkthrough
```

No dependencies, accounts, model weights or credentials are needed.

`demo` replays [Dispatch operations](../../fixtures/dispatch-lifecycle.json), including clarification, two attempts, output acceptance and a synthetic integration receipt.

`walkthrough` combines the real public Task and Dispatch reducers with [illustrative linked records](../../fixtures/knowledge-workflow.json). It checks references and prints where the output belongs. The Reference, Collection and Report objects are teaching examples, not native model exports. No URL is fetched, agent run, report published or private data read.

The fixture illustrates a Reference and Report in one Collection, a Task linking both, and a Dispatch producing the Report. A Task can remain open after an agent produces a result: the operator's follow-through is separate from execution completion.

To inspect durable command acceptance separately, run `npm run serve` and follow the root README's curl example. Restarting the server preserves its reference command log; it does not resume an agent.
