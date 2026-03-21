// app/api/sop-generate/route.js
import { requireAuth } from "../../_lib/api-auth";
import { sanitizeForPrompt } from "../../_lib/sanitize";

const MAX_TRANSCRIPT_LENGTH = 50_000;
const FETCH_TIMEOUT_MS = 90_000; // SOP generation can be slow

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

  const { transcript, companyName, department } = body;
  // fromInterview: field exists in some callers but is not used in the prompt —
  // intentionally excluded to avoid silently ignoring its semantic meaning.

  if (!transcript || transcript.trim().length < 20) {
    return Response.json({ error: "Transcript too short." }, { status: 400 });
  }

  // H-2: length cap before any processing
  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    return Response.json({ error: "Transcript too long (max 50,000 characters)." }, { status: 400 });
  }

  // C-5: sanitize user-supplied strings before prompt interpolation
  const safeCompanyName = sanitizeForPrompt(companyName, 100) || "a manufacturing company";
  const safeDepartment = sanitizeForPrompt(department, 80);

  // H-FIX-3: transcript goes to the user turn (not system prompt), but sanitize it
  // to strip prompt injection attempts embedded in the voice/text transcript.
  const safeTranscript = sanitizeForPrompt(transcript, MAX_TRANSCRIPT_LENGTH);

  const systemPrompt = [
    `You are RHONDA, an expert SOP generator for ${safeCompanyName}.`,
    safeDepartment ? `Department context: ${safeDepartment}.` : "",
    "Generate a clear, structured, OSHA-compliant SOP.",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: safeTranscript }],
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      return Response.json({ error: "Failed to parse upstream response" }, { status: 502 });
    }

    if (!response.ok) {
      console.error("[sop-generate] Anthropic error:", response.status, data?.error);
      return Response.json(
        { error: response.status >= 500 ? "AI service error" : "SOP generation failed" },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    return Response.json(data);
  } catch (err) {
    if (err.name === "TimeoutError") {
      return Response.json({ error: "Request timed out" }, { status: 504 });
    }
    console.error("[sop-generate] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
