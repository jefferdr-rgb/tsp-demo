// app/api/leo-push/route.js
import { requireAuth, requireValidClient } from "../../_lib/api-auth";

const MAX_RAW_DATA_LENGTH = 100_000; // 100 KB as a string
const MAX_EXTRACT_CHARS = 4_000;     // chars passed to the LLM
const FETCH_TIMEOUT_MS = 30_000;

export async function POST(request) {
  // C-1: auth gate
  const authError = requireAuth(request);
  if (authError) return authError;

  // M-3: read raw text first so we can gate on length before JSON.parse
  let rawText;
  try {
    rawText = await request.text();
  } catch {
    return Response.json({ error: "Failed to read request body" }, { status: 400 });
  }

  if (rawText.length > MAX_RAW_DATA_LENGTH) {
    return Response.json({ error: "Request body too large (max 100 KB)" }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { clientKey, rawData } = body;

  if (!clientKey || !rawData) {
    return Response.json({ error: "Missing clientKey or rawData" }, { status: 400 });
  }

  if (typeof rawData !== "string" || rawData.length > MAX_RAW_DATA_LENGTH) {
    return Response.json({ error: "rawData too large" }, { status: 400 });
  }

  // C-3: clientKey must be in the validated allowlist
  const clientError = requireValidClient(clientKey);
  if (clientError) return clientError;

  // ── Extract metrics via Haiku ──────────────────────────────────────────────
  let metrics;
  try {
    const extractRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: "Extract KPI metrics from the provided data. Return a single valid JSON object only — no commentary, no markdown fences.",
        messages: [
          {
            role: "user",
            content: `Extract metrics:\n\n${rawData.slice(0, MAX_EXTRACT_CHARS)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!extractRes.ok) {
      console.error("[leo-push] Anthropic extract error:", extractRes.status);
      return Response.json({ error: "Metric extraction failed" }, { status: 502 });
    }

    const extractData = await extractRes.json();
    const raw = extractData.content?.[0]?.text?.trim();
    // L-FIX-2: greedy regex takes first { to last } — can span invalid JSON if model adds
    // commentary after the object. Instruct model to return only JSON (system prompt above)
    // and use a non-greedy first-match as a secondary guard.
    const jsonMatch = raw?.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error("[leo-push] No JSON in extraction response:", raw?.slice(0, 200));
      return Response.json({ error: "Failed to extract metrics" }, { status: 500 });
    }
    metrics = JSON.parse(jsonMatch[0]);
  } catch (err) {
    if (err.name === "TimeoutError") {
      return Response.json({ error: "Metric extraction timed out" }, { status: 504 });
    }
    console.error("[leo-push] Extraction unexpected error:", err);
    return Response.json({ error: "Failed to extract metrics" }, { status: 500 });
  }

  // ── Push to LEO ────────────────────────────────────────────────────────────
  try {
    const leoRes = await fetch(`${process.env.LEO_URL}/api/leo/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LEO_UPDATE_SECRET}`,
      },
      body: JSON.stringify({ clientKey, metrics }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!leoRes.ok) {
      const errBody = await leoRes.text();
      console.error("[leo-push] LEO update failed:", leoRes.status, errBody.slice(0, 500));
      return Response.json({ error: "LEO update failed" }, { status: 502 });
    }

    return Response.json({ ok: true, metrics });
  } catch (err) {
    if (err.name === "TimeoutError") {
      return Response.json({ error: "LEO service timed out" }, { status: 504 });
    }
    console.error("[leo-push] Could not reach LEO:", err);
    return Response.json({ error: "Could not reach LEO" }, { status: 500 });
  }
}
