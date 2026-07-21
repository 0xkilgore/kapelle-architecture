# Reference control plane

This tiny server demonstrates three architectural claims:

1. A command is persisted before the API reports acceptance.
2. The caller receives a stable command identifier immediately.
3. Retrying with the same idempotency key returns the original command.

It stores newline-delimited JSON in the operating system temporary directory by default. It is an executable explanation, not production infrastructure.
