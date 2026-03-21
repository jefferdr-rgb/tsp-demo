// app/api/incident-report/route.js
import { requireAuth } from "../../_lib/api-auth";
import { sanitizeForPrompt, validateImageBlock } from "../../_lib/sanitize";

const MAX_TRANSCRIPT_LENGTH = 10_000;
const FETCH_TIMEOUT_MS = 60_000;

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

  const { transcript, imageBlock, location, equipment } = body;

  if (!transcript || transcript.trim().length < 10) {
    return Response.json({ error: "Description too short." }, { status: 400 });
  }

  // H-2: length cap
  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    return Response.json({ error: "Transcript too long (max 10,000 characters)." }, { status: 400 });
  }

  // H-1: validate image block if provided
  if (imageBlock) {
    const imgError = validateImageBlock(imageBlock);
    if (imgError) {
      return Response.json({ error: imgError }, { status: 400 });
    }
  }

  // C-5: sanitize location and equipment before prompt interpolation
  const safeLocation = sanitizeForPrompt(location, 200);
  const safeEquipment = sanitizeForPrompt(equipment, 200);

  // H-FIX-3: sanitize transcript — the highest-volume user-controlled field.
  // Moves sanitization to where it matters: before it reaches the model.
  const safeTranscript = sanitizeForPrompt(transcript, MAX_TRANSCRIPT_LENGTH);

  const systemPromptParts = [
    "You are RHONDA, an expert OSHA incident reporter.",
    safeLocation ? `Location: ${safeLocation}.` : "",
    safeEquipment ? `Equipment involved: ${safeEquipment}.` : "",
    "Generate a complete, accurate incident report from the provided description.",
  ].filter(Boolean);

  const systemPrompt = systemPromptParts.join("\n");

  const userContent = imageBlock
    ? [imageBlock, { type: "text", text: `Incident: "${safeTranscript}"` }]
    : `Incident: "${safeTranscript}"`;

  const messages = [{ role: "user", content: userContent }];

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
        max_tokens: 2048,
        system: systemPrompt,
        messages,
        tools: [
          {
            name: "generate_incident_report",
            description: "Generate a structured OSHA incident report",
            input_schema: {
              type: "object",
              properties: {
                title:               { type: "string" },
                date:                { type: "string" },
                time:                { type: "string" },
                location:            { type: "string" },
                severity:            { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
                description:         { type: "string" },
                injuries:            { type: "string" },
                personnel_involved:  { type: "array", items: { type: "string" } },
                equipment_involved:  { type: "string" },
                immediate_actions:   { type: "array", items: { type: "string" } },
                root_cause:          { type: "string" },
                corrective_actions:  { type: "array", items: { type: "string" } },
                followup_required:   { type: "array", items: { type: "string" } },
                osha_recordable:     { type: "boolean" },
                area_status:         { type: "string" },
              },
              required: [
                "title", "date", "time", "location", "severity", "description",
                "injuries", "equipment_involved", "immediate_actions",
                "corrective_actions", "followup_required", "osha_recordable", "area_status",
              ],
            },
          },
        ],
        tool_choice: { type: "tool", name: "generate_incident_report" },
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[incident-report] Anthropic error:", response.status, data?.error);
      return Response.json({ error: "Report generation failed" }, { status: 502 });
    }

    const toolResult = data.content?.find(
      (b) => b.type === "tool_use" && b.name === "generate_incident_report"
    );
    if (!toolResult?.input) {
      return Response.json({ error: "Report generation failed" }, { status: 500 });
    }

    return Response.json({ report: toolResult.input });
  } catch (err) {
    if (err.name === "TimeoutError") {
      return Response.json({ error: "Request timed out" }, { status: 504 });
    }
    console.error("[incident-report] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
