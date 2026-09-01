import assert from "node:assert/strict";
import test from "node:test";
import {
  LOCAL_MODEL_ID,
  configFromEnvironment,
  createInferenceGateway,
  localOpenAICompatibleRegistration,
  parseLocalOnlyRequest,
  validateLoopbackBaseUrl
} from "../packages/local-inference/src/index.js";

const REQUEST = Object.freeze({
  policy: "local-only",
  purpose: "report-summarization",
  system: "Summarize without adding facts.",
  prompt: "Synthetic report text.",
  maxOutputTokens: 128
});

const ENVIRONMENT = Object.freeze({
  KAPELLE_LOCAL_INFERENCE_ENABLED: "1",
  KAPELLE_LOCAL_MODEL_BASE_URL: "http://127.0.0.1:8080/v1",
  KAPELLE_LOCAL_MODEL_ID: LOCAL_MODEL_ID
});

test("request contract is closed and requires local-only policy", () => {
  assert.equal(parseLocalOnlyRequest(REQUEST).policy, "local-only");
  assert.throws(() => parseLocalOnlyRequest({ ...REQUEST, policy: "auto" }), /local-only/);
  assert.throws(() => parseLocalOnlyRequest({ ...REQUEST, provider: "external" }), /unsupported field/);
  assert.throws(() => parseLocalOnlyRequest({ ...REQUEST, tools: [] }), /unsupported field/);
});

test("endpoint validation admits only explicit loopback /v1 URLs", () => {
  assert.equal(validateLoopbackBaseUrl("http://127.0.0.1:8080/v1"), "http://127.0.0.1:8080/v1");
  assert.throws(() => validateLoopbackBaseUrl("http://localhost:8080/v1"), /loopback/);
  assert.throws(() => validateLoopbackBaseUrl("http://192.168.1.4:8080/v1"), /loopback/);
  assert.throws(() => validateLoopbackBaseUrl("https://127.0.0.1:8080/v1"), /loopback/);
  assert.throws(() => validateLoopbackBaseUrl("http://127.0.0.1/v1"), /port/);
  assert.throws(() => validateLoopbackBaseUrl("http://127.0.0.1:8080/v1/chat"), /exact/);
});

test("environment refuses proxy and credential configuration", () => {
  assert.equal(configFromEnvironment(ENVIRONMENT).modelId, LOCAL_MODEL_ID);
  assert.throws(() => configFromEnvironment({ ...ENVIRONMENT, HTTPS_PROXY: "http://127.0.0.1:9999" }), /proxy/);
  assert.throws(() => configFromEnvironment({ ...ENVIRONMENT, KAPELLE_LOCAL_MODEL_API_KEY: "not-admitted" }), /credentials/);
  assert.throws(() => configFromEnvironment({ ...ENVIRONMENT, KAPELLE_LOCAL_INFERENCE_ENABLED: "0" }), /not enabled/);
});

test("local request never constructs an external provider", async () => {
  let externalConstructed = false;
  const external = {
    id: "external-provider",
    locality: "external",
    create() {
      externalConstructed = true;
      throw new Error("must not run");
    }
  };
  const result = await createInferenceGateway([external]).infer(REQUEST);
  assert.equal(result.availability, "unavailable");
  assert.equal(result.reason, "not_configured");
  assert.equal(externalConstructed, false);
});

test("local provider sends a credential-free bounded request", async () => {
  let observed;
  const fetchImpl = async (url, init) => {
    observed = { url, init };
    return new Response(JSON.stringify({
      model: LOCAL_MODEL_ID,
      choices: [{ message: { content: "Synthetic summary." } }],
      usage: { prompt_tokens: 12, completion_tokens: 3, total_tokens: 15 }
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const registration = localOpenAICompatibleRegistration({ environment: ENVIRONMENT, fetchImpl });
  const result = await createInferenceGateway([registration]).infer(REQUEST);

  assert.equal(result.availability, "available");
  assert.equal(result.modelId, LOCAL_MODEL_ID);
  assert.equal(result.text, "Synthetic summary.");
  assert.equal(observed.url, "http://127.0.0.1:8080/v1/chat/completions");
  assert.equal(observed.init.redirect, "manual");
  assert.equal(observed.init.headers.authorization, undefined);
  assert.equal(JSON.parse(observed.init.body).max_tokens, 128);
});

test("model mismatch fails closed without fallback", async () => {
  let externalConstructed = false;
  const local = localOpenAICompatibleRegistration({
    environment: ENVIRONMENT,
    fetchImpl: async () => new Response(JSON.stringify({
      model: "unexpected/model",
      choices: [{ message: { content: "wrong model" } }]
    }), { status: 200 })
  });
  const external = {
    id: "external-provider",
    locality: "external",
    create() {
      externalConstructed = true;
      return { generate: async () => ({ text: "fallback" }) };
    }
  };

  const result = await createInferenceGateway([local, external]).infer(REQUEST);
  assert.equal(result.availability, "unavailable");
  assert.equal(result.reason, "model_mismatch");
  assert.equal(externalConstructed, false);
});
