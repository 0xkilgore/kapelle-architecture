const DEFAULT_MODEL_ID = "mlx-community/Qwen3.6-27B-4bit";
const DEFAULT_BASE_URL = "http://127.0.0.1:8080/v1";
const MAX_OUTPUT_TOKENS = 1024;
const MAX_PROMPT_BYTES = 32_768;
const MAX_SYSTEM_BYTES = 4_096;

const PURPOSES = new Set([
  "report-summarization",
  "task-extraction",
  "project-tag-due-date-classification",
  "concise-correspondence-drafting",
  "attention-triage-classification"
]);

const PROXY_KEYS = [
  "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY",
  "http_proxy", "https_proxy", "all_proxy",
  "GLOBAL_AGENT_HTTP_PROXY", "UNDICI_PROXY"
];

export class LocalInferenceError extends Error {
  constructor(reason, message) {
    super(message);
    this.name = "LocalInferenceError";
    this.reason = reason;
  }
}

function unavailable(reason, error, providerId = null) {
  return { availability: "unavailable", providerId, reason, error };
}

function byteLength(value) {
  return new TextEncoder().encode(value).byteLength;
}

export function parseLocalOnlyRequest(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new LocalInferenceError("invalid_request", "Inference request must be an object.");
  }
  const allowed = new Set(["policy", "purpose", "system", "prompt", "maxOutputTokens"]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    throw new LocalInferenceError("invalid_request", "Inference request contains an unsupported field.");
  }
  if (input.policy !== "local-only") {
    throw new LocalInferenceError("policy_denied", "Only local-only inference is admitted.");
  }
  if (!PURPOSES.has(input.purpose)) {
    throw new LocalInferenceError("invalid_request", "Inference purpose is not admitted.");
  }
  if (typeof input.system !== "string" || input.system.length === 0 || byteLength(input.system) > MAX_SYSTEM_BYTES) {
    throw new LocalInferenceError("invalid_request", "System instruction is empty or exceeds its byte bound.");
  }
  if (typeof input.prompt !== "string" || input.prompt.length === 0 || byteLength(input.prompt) > MAX_PROMPT_BYTES) {
    throw new LocalInferenceError("invalid_request", "Prompt is empty or exceeds its byte bound.");
  }
  if (!Number.isSafeInteger(input.maxOutputTokens) || input.maxOutputTokens < 1 || input.maxOutputTokens > MAX_OUTPUT_TOKENS) {
    throw new LocalInferenceError("invalid_request", "Output-token bound is invalid.");
  }
  return Object.freeze({
    policy: input.policy,
    purpose: input.purpose,
    system: input.system,
    prompt: input.prompt,
    maxOutputTokens: input.maxOutputTokens
  });
}

export function validateLoopbackBaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new LocalInferenceError("endpoint_not_allowed", "Local inference endpoint is invalid.");
  }
  const loopback = url.hostname === "127.0.0.1" || url.hostname === "[::1]" || url.hostname === "::1";
  if (url.protocol !== "http:" || !loopback) {
    throw new LocalInferenceError("endpoint_not_allowed", "Endpoint must use explicit loopback HTTP.");
  }
  if (!url.port || url.pathname !== "/v1" || url.username || url.password || url.search || url.hash) {
    throw new LocalInferenceError("endpoint_not_allowed", "Endpoint must include a port and the exact /v1 path.");
  }
  return `${url.origin}/v1`;
}

export function configFromEnvironment(environment = process.env) {
  if (environment.KAPELLE_LOCAL_INFERENCE_ENABLED !== "1") {
    throw new LocalInferenceError("not_configured", "Local inference is not enabled.");
  }
  if (PROXY_KEYS.some((key) => environment[key]?.trim())) {
    throw new LocalInferenceError("proxy_not_allowed", "Ambient proxy configuration is not admitted.");
  }
  if (["1", "true"].includes(environment.NODE_USE_ENV_PROXY?.trim().toLowerCase())) {
    throw new LocalInferenceError("proxy_not_allowed", "Node proxy routing is not admitted.");
  }
  if (environment.KAPELLE_LOCAL_MODEL_API_KEY?.trim()) {
    throw new LocalInferenceError("credential_not_allowed", "The local boundary does not accept provider credentials.");
  }
  const modelId = environment.KAPELLE_LOCAL_MODEL_ID?.trim() || DEFAULT_MODEL_ID;
  if (!modelId || modelId.length > 256 || /[\u0000-\u001f\u007f]/u.test(modelId)) {
    throw new LocalInferenceError("not_configured", "Model identifier is invalid.");
  }
  return Object.freeze({
    baseUrl: validateLoopbackBaseUrl(environment.KAPELLE_LOCAL_MODEL_BASE_URL?.trim() || DEFAULT_BASE_URL),
    modelId
  });
}

function parseCompletion(payload, expectedModelId) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new LocalInferenceError("invalid_response", "Completion response must be an object.");
  }
  if (payload.model !== expectedModelId) {
    throw new LocalInferenceError("model_mismatch", "Local provider returned an unexpected model.");
  }
  const text = payload.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new LocalInferenceError("invalid_response", "Completion response omitted text.");
  }
  return {
    modelId: payload.model,
    text,
    usage: {
      promptTokens: Number.isSafeInteger(payload.usage?.prompt_tokens) ? payload.usage.prompt_tokens : null,
      completionTokens: Number.isSafeInteger(payload.usage?.completion_tokens) ? payload.usage.completion_tokens : null,
      totalTokens: Number.isSafeInteger(payload.usage?.total_tokens) ? payload.usage.total_tokens : null
    }
  };
}

export function localOpenAICompatibleRegistration({ environment = process.env, fetchImpl = globalThis.fetch } = {}) {
  return {
    id: "local-openai-compatible",
    locality: "local",
    create() {
      const config = configFromEnvironment(environment);
      return {
        id: "local-openai-compatible",
        locality: "local",
        async generate(request) {
          let response;
          try {
            response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
              method: "POST",
              redirect: "manual",
              cache: "no-store",
              headers: { accept: "application/json", "content-type": "application/json" },
              body: JSON.stringify({
                model: config.modelId,
                messages: [
                  { role: "system", content: request.system },
                  { role: "user", content: request.prompt }
                ],
                max_tokens: request.maxOutputTokens,
                stream: false
              })
            });
          } catch {
            throw new LocalInferenceError("provider_unavailable", "Local provider could not be reached.");
          }
          if (response.status >= 300 && response.status < 400) {
            throw new LocalInferenceError("provider_unavailable", "Local provider redirect was refused.");
          }
          if (!response.ok) {
            throw new LocalInferenceError("http_error", `Local provider returned HTTP ${response.status}.`);
          }
          let payload;
          try {
            payload = await response.json();
          } catch {
            throw new LocalInferenceError("invalid_response", "Local provider did not return JSON.");
          }
          return parseCompletion(payload, config.modelId);
        }
      };
    }
  };
}

export function createInferenceGateway(registrations) {
  if (!Array.isArray(registrations)) throw new TypeError("registrations must be an array");
  return {
    async infer(input) {
      let request;
      try {
        request = parseLocalOnlyRequest(input);
      } catch (error) {
        if (error instanceof LocalInferenceError) return unavailable(error.reason, error.message);
        throw error;
      }
      const admitted = registrations.filter((registration) => registration.locality === "local");
      if (admitted.length === 0) return unavailable("not_configured", "No local provider is registered.");
      for (const registration of admitted) {
        try {
          const provider = registration.create();
          const completion = await provider.generate(request);
          return {
            availability: "available",
            providerId: provider.id,
            modelId: completion.modelId,
            text: completion.text,
            usage: completion.usage
          };
        } catch (error) {
          if (error instanceof LocalInferenceError) {
            return unavailable(error.reason, error.message, registration.id);
          }
          return unavailable("provider_unavailable", "Local provider failed.", registration.id);
        }
      }
      return unavailable("provider_unavailable", "No admitted local provider completed the request.");
    }
  };
}

export const LOCAL_MODEL_ID = DEFAULT_MODEL_ID;
export const LOCAL_INFERENCE_PURPOSES = Object.freeze([...PURPOSES]);
