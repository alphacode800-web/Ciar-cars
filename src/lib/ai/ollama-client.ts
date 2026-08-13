/**
 * Server-only Ollama HTTP client.
 * Never expose OLLAMA_BASE_URL to the browser.
 */

export class OllamaUnavailableError extends Error {
  constructor(message = 'Ollama is unavailable') {
    super(message);
    this.name = 'OllamaUnavailableError';
  }
}

export class OllamaTimeoutError extends Error {
  constructor(message = 'Ollama request timed out') {
    super(message);
    this.name = 'OllamaTimeoutError';
  }
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatOptions {
  model?: string;
  messages: OllamaChatMessage[];
  /** Request structured JSON from the model */
  json?: boolean;
  temperature?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface OllamaChatResult {
  content: string;
  model: string;
  durationMs: number;
  done: boolean;
}

function getBaseUrl(): string {
  return (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
}

function getDefaultModel(): string {
  return process.env.OLLAMA_MODEL || 'qwen2.5:7b';
}

function getTimeoutMs(override?: number): number {
  if (override && override > 0) return override;
  const fromEnv = Number(process.env.OLLAMA_TIMEOUT_MS);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 60_000;
}

export function isOllamaEnabled(): boolean {
  return process.env.OLLAMA_ENABLED !== 'false';
}

let healthCache: { at: number; ok: boolean; error?: string } | null = null;
const HEALTH_TTL_MS = 30_000;

/** Fast path: skip Ollama calls for a short window after a failed health check. */
export async function isOllamaReachable(): Promise<boolean> {
  if (!isOllamaEnabled()) return false;
  if (healthCache && Date.now() - healthCache.at < HEALTH_TTL_MS) {
    return healthCache.ok;
  }
  const health = await ollamaHealth();
  healthCache = { at: Date.now(), ok: health.ok, error: health.error };
  return health.ok;
}

export function markOllamaUnreachable(error?: string) {
  healthCache = { at: Date.now(), ok: false, error };
}

export async function ollamaHealth(): Promise<{
  ok: boolean;
  baseUrl: string;
  model: string;
  models: string[];
  error?: string;
}> {
  const baseUrl = getBaseUrl();
  const model = getDefaultModel();
  if (!isOllamaEnabled()) {
    return { ok: false, baseUrl, model, models: [], error: 'OLLAMA_ENABLED=false' };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2_500);
    const res = await fetch(`${baseUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      return { ok: false, baseUrl, model, models: [], error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { models?: { name?: string }[] };
    const models = (data.models || []).map((m) => m.name || '').filter(Boolean);
    const hasModel = models.some((m) => m === model || m.startsWith(`${model}:`) || model.startsWith(m.split(':')[0]));
    const result = {
      ok: hasModel || models.length > 0,
      baseUrl,
      model,
      models,
      error: hasModel ? undefined : `Model ${model} not pulled. Run: ollama pull ${model}`,
    };
    healthCache = { at: Date.now(), ok: result.ok, error: result.error };
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    healthCache = { at: Date.now(), ok: false, error: message };
    return { ok: false, baseUrl, model, models: [], error: message };
  }
}

export async function ollamaChat(options: OllamaChatOptions): Promise<OllamaChatResult> {
  if (!isOllamaEnabled()) {
    throw new OllamaUnavailableError('AI is disabled (OLLAMA_ENABLED=false)');
  }

  if (!(await isOllamaReachable())) {
    throw new OllamaUnavailableError(
      healthCache?.error || 'Ollama is unreachable — using local assistant'
    );
  }

  const baseUrl = getBaseUrl();
  const model = options.model || getDefaultModel();
  const timeoutMs = getTimeoutMs(options.timeoutMs);
  const started = Date.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort);

  try {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: options.messages,
        stream: false,
        format: options.json ? 'json' : undefined,
        options: {
          temperature: options.temperature ?? (options.json ? 0.2 : 0.5),
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      markOllamaUnreachable(`Ollama error ${res.status}`);
      throw new OllamaUnavailableError(`Ollama error ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      message?: { content?: string };
      response?: string;
      done?: boolean;
      model?: string;
    };

    const content = data.message?.content ?? data.response ?? '';
    if (!content.trim()) {
      throw new OllamaUnavailableError('Empty response from Ollama');
    }

    healthCache = { at: Date.now(), ok: true };
    return {
      content: content.trim(),
      model: data.model || model,
      durationMs: Date.now() - started,
      done: data.done !== false,
    };
  } catch (err) {
    if (err instanceof OllamaUnavailableError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      markOllamaUnreachable('timeout');
      throw new OllamaTimeoutError(`Ollama timed out after ${timeoutMs}ms`);
    }
    markOllamaUnreachable(err instanceof Error ? err.message : 'Failed to reach Ollama');
    throw new OllamaUnavailableError(
      err instanceof Error ? err.message : 'Failed to reach Ollama'
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}

export async function ollamaChatJson<T>(
  options: OllamaChatOptions,
  parse: (raw: unknown) => T
): Promise<{ data: T; model: string; durationMs: number }> {
  const result = await ollamaChat({ ...options, json: true });
  let raw: unknown;
  try {
    raw = JSON.parse(result.content);
  } catch {
    // Try to extract JSON object from mixed text
    const match = result.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) throw new Error('Model did not return valid JSON');
    raw = JSON.parse(match[0]);
  }
  return {
    data: parse(raw),
    model: result.model,
    durationMs: result.durationMs,
  };
}
