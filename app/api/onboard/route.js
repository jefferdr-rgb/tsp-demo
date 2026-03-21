// app/api/onboard/route.js
import { requireAuth } from "../../_lib/api-auth";
import { validateImageBlock } from "../../_lib/sanitize";
import { getSupabase } from "../../_lib/supabase";

const MAX_TRANSCRIPT_LENGTH = 2_000;
const FETCH_TIMEOUT_MS = 45_000;

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

  const { imageBlock, transcript } = body;

  if (!imageBlock && !transcript) {
    return Response.json({ error: "Provide a photo or description" }, { status: 400 });
  }

  // H-2: length cap on transcript
  if (transcript && transcript.length > MAX_TRANSCRIPT_LENGTH) {
    return Response.json({ error: "Transcript too long (max 2,000 characters)" }, { status: 400 });
  }

  // H-1: validate image block before forwarding to Anthropic
  if (imageBlock) {
    const imgError = validateImageBlock(imageBlock);
    if (imgError) {
      return Response.json({ error: imgError }, { status: 400 });
    }
  }

  const userContent = [];
  if (imageBlock) userContent.push(imageBlock); // now validated
  userContent.push({
    type: "text",
    text: transcript ? `Voice: "${transcript}"` : "Extract from this ID.",
  });

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
        max_tokens: 1500,
        system: "You extract employee info from ID photos. Return only the requested structured data.",
        messages: [{ role: "user", content: userContent }],
        tools: [
          {
            name: "extract_employee_info",
            description: "Extract employee information from ID photo or verbal description",
            input_schema: {
              type: "object",
              properties: {
                full_name:      { type: ["string", "null"] },
                date_of_birth:  { type: ["string", "null"] },
                address:        { type: ["string", "null"] },
                id_number:      { type: ["string", "null"] },
                id_expiration:  { type: ["string", "null"] },
                id_state:       { type: ["string", "null"] },
                start_date:     { type: ["string", "null"] },
                department:     { type: ["string", "null"] },
                position:       { type: ["string", "null"] },
                hourly_rate:    { type: ["string", "null"] },
                shift:          { type: ["string", "null"] },
                supervisor:     { type: ["string", "null"] },
                notes:          { type: ["string", "null"] },
              },
              required: ["full_name"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "extract_employee_info" },
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    const data = await response.json();

    if (!response.ok) {
      // H-5: never return Anthropic error details to caller
      console.error("[onboard] Anthropic error:", response.status, data?.error);
      return Response.json({ error: "Extraction failed" }, { status: 502 });
    }

    const toolResult = data.content?.find(
      (b) => b.type === "tool_use" && b.name === "extract_employee_info"
    );
    if (!toolResult?.input) {
      return Response.json({ error: "Extraction failed" }, { status: 500 });
    }

    const employee = toolResult.input;

    // H-6: PII audit log — log that extraction occurred without logging the PII values.
    const auditEntry = {
      event_type: "pii_extraction",
      occurred_at: new Date().toISOString(),
      has_image: Boolean(imageBlock),
      has_transcript: Boolean(transcript),
      fields_extracted: Object.keys(employee).filter((k) => employee[k] !== null),
      // No PII values in the log
    };
    console.log("[onboard][AUDIT]", JSON.stringify(auditEntry));

    // Best-effort audit write — failure must not block the response
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("usage_events").insert({
          org_id: "00000000-0000-0000-0000-000000000001", // demo placeholder org
          event_type: "pii_extraction",
          metadata: auditEntry,
          created_at: auditEntry.occurred_at,
        });
      }
    } catch (auditErr) {
      // M-FIX-5: audit failure is logged but does not block PII extraction response.
      // In production, failing audit writes should trigger an alert to ensure the
      // audit trail is never silently lost — consider a dead-letter queue or alerting.
      console.error("[onboard][AUDIT] Failed to write audit record:", auditErr?.message);
    }

    return Response.json({ employee });
  } catch (err) {
    if (err.name === "TimeoutError") {
      return Response.json({ error: "Request timed out" }, { status: 504 });
    }
    console.error("[onboard] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
