// app/api/rhonda/route.js
import { requireAuth } from "../../_lib/api-auth";

const ALLOWED_MODELS = ["claude-sonnet-4-6", "claude-haiku-4-5-20251001"];
const MAX_TOKENS_CAP = 4096;
const MAX_SYSTEM_LENGTH = 8_000;
const MAX_MESSAGES_LENGTH = 100_000; // serialized JSON chars
const FETCH_TIMEOUT_MS = 60_000;

export async function POST(request) {
  // C-1: auth gate
  const authError = requireAuth(request);
  if (authError) return authError;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }

  if (!body.model || !ALLOWED_MODELS.includes(body.model)) {
    return Response.json({ error: { message: "Invalid model" } }, { status: 400 });
  }

  // H-2: input length limits
  if (body.system && typeof body.system === "string" && body.system.length > MAX_SYSTEM_LENGTH) {
    return Response.json({ error: { message: "system prompt too long" } }, { status: 400 });
  }
  if (body.messages) {
    const serialized = JSON.stringify(body.messages);
    if (serialized.length > MAX_MESSAGES_LENGTH) {
      return Response.json({ error: { message: "messages payload too large" } }, { status: 400 });
    }
  }

  // L-FIX-1: isNaN guard before Math.min to prevent NaN reaching Anthropic
  const rawTokens = Number(body.max_tokens);
  const maxTokens = Math.min(isNaN(rawTokens) ? 1024 : rawTokens, MAX_TOKENS_CAP);

  // C-4: strip tools/tool_choice — tool-definition poisoning prevention.
  // C-FIX-3: body.system is length-validated above. In production, system prompts
  // should be constructed server-side from trusted templates. Here, the auth gate
  // (INTERNAL_API_SECRET) limits callers to trusted internal Next.js code.
  const safeBody = {
    model: body.model,
    max_tokens: maxTokens,
    system: body.system,
    messages: body.messages,
    // tools and tool_choice intentionally omitted
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify(safeBody),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    // H-4: OpenRouter fallback — never leak raw upstream response
    if (response.status >= 500 && process.env.OPENROUTER_API_KEY) {
      const fallback = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://demo.treestandpartners.com",
        },
        body: JSON.stringify({
          model: `anthropic/${safeBody.model}`,
          max_tokens: safeBody.max_tokens,
          messages: [
            ...(safeBody.system ? [{ role: "system", content: safeBody.system }] : []),
            ...safeBody.messages,
          ],
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!fallback.ok) {
        console.error("[rhonda] OpenRouter fallback non-OK:", fallback.status);
        return Response.json({ error: { message: "AI service unavailable" } }, { status: 502 });
      }

      const fallbackData = await fallback.json();
      const choice = fallbackData.choices?.[0];

      if (!choice) {
        console.error("[rhonda] OpenRouter returned no choices:", JSON.stringify(fallbackData).slice(0, 500));
        return Response.json({ error: { message: "AI service unavailable" } }, { status: 502 });
      }

      return Response.json({
        content: [{ type: "text", text: choice.message?.content || "" }],
        model: safeBody.model,
        role: "assistant",
        stop_reason: choice.finish_reason === "stop" ? "end_turn" : choice.finish_reason,
      });
    }

    const data = await response.json();

    // H-5: forward Anthropic 4xx (rate limit, context length) but not raw 5xx internals
    if (!response.ok) {
      if (response.status >= 500) {
        console.error("[rhonda] Anthropic 5xx:", response.status, JSON.stringify(data).slice(0, 500));
        return Response.json({ error: { message: "AI service error" } }, { status: 502 });
      }
      return Response.json(data, { status: response.status });
    }

    return Response.json(data);
  } catch (err) {
    if (err.name === "TimeoutError") {
      return Response.json({ error: { message: "Request timed out" } }, { status: 504 });
    }
    console.error("[rhonda] Unexpected error:", err);
    return Response.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}
