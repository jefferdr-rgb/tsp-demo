// app/api/translate/route.js
import { requireAuth } from "../../_lib/api-auth";

// C-5: LANG_NAMES is the authoritative allowlist — targetLang/sourceLang must be a key
// in this map before they are used. The map value (not the raw param) goes into the prompt.
const LANG_NAMES = {
  en: "English",
  es: "Spanish",
  vi: "Vietnamese",
  zh: "Chinese (Simplified)",
  ko: "Korean",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ja: "Japanese",
  ar: "Arabic",
  hi: "Hindi",
  tl: "Tagalog",
};

const MAX_TEXT_LENGTH = 10_000;
const FETCH_TIMEOUT_MS = 30_000;

export async function POST(request) {
  // C-1: auth gate
  const authError = requireAuth(request);
  if (authError) return authError;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, targetLang, sourceLang = "en" } = body;
  // context: field exists in some callers but is not currently used in the translation
  // prompt — intentionally excluded to avoid silently accepting unused input.

  if (!text || !targetLang) {
    return Response.json({ error: "Missing text or targetLang" }, { status: 400 });
  }

  // H-2: length cap
  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json({ error: "text too long (max 10,000 characters)" }, { status: 400 });
  }

  // C-5: enforce allowlist before any use — reject unknown codes outright
  if (!LANG_NAMES[targetLang]) {
    return Response.json({ error: "Unsupported targetLang" }, { status: 400 });
  }
  if (!LANG_NAMES[sourceLang]) {
    return Response.json({ error: "Unsupported sourceLang" }, { status: 400 });
  }

  if (targetLang === sourceLang) {
    return Response.json({ translated: text, targetLang, sourceLang });
  }

  // C-5: use the map value — never interpolate the raw user-supplied lang code into the prompt
  const targetName = LANG_NAMES[targetLang];
  const sourceName = LANG_NAMES[sourceLang];

  const systemPrompt = `You are a professional translator. Translate ${sourceName} to ${targetName}. Return only the translated text, no commentary.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: text }],
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[translate] Anthropic error:", response.status, data?.error);
      return Response.json({ error: "Translation failed" }, { status: 502 });
    }

    return Response.json({
      translated: data.content?.[0]?.text || "",
      targetLang,
      sourceLang,
    });
  } catch (err) {
    if (err.name === "TimeoutError") {
      return Response.json({ error: "Request timed out" }, { status: 504 });
    }
    console.error("[translate] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
