// ── Photo + Voice Onboarding API ─────────────────────────────────────────────
// Claude Vision extracts ID fields + merges with voice transcript → structured JSON

export async function POST(request) {
  const { imageBlock, transcript } = await request.json();

  if (!imageBlock && !transcript) {
    return Response.json({ error: "Provide at least a photo or voice description" }, { status: 400 });
  }

  const systemPrompt = `You are RHONDA, an AI assistant helping with employee onboarding. You are processing a new hire's information from two sources:

1. A PHOTO of their ID/driver's license (if provided) — extract: full name, date of birth, address, ID number, expiration date, state/country
2. A VOICE description (if provided) — extract: start date, department, role/position, hourly rate, shift, supervisor, any special notes

Use the extract_employee_info tool to combine ALL extracted information into a single structured record. If a field can't be determined from either source, set it to null.`;

  const userContent = [];
  if (imageBlock) userContent.push(imageBlock);
  userContent.push({
    type: "text",
    text: transcript
      ? `Voice description from supervisor: "${transcript}"\n\nPlease extract all employee information from the photo and voice description.`
      : "Please extract all information from this ID document.",
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
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
        tools: [{
          name: "extract_employee_info",
          description: "Extract and combine employee information from ID photo and voice description",
          input_schema: {
            type: "object",
            properties: {
              // From ID
              full_name: { type: ["string", "null"], description: "Full legal name from ID" },
              date_of_birth: { type: ["string", "null"], description: "Date of birth (YYYY-MM-DD)" },
              address: { type: ["string", "null"], description: "Full address from ID" },
              id_number: { type: ["string", "null"], description: "Driver's license or ID number" },
              id_expiration: { type: ["string", "null"], description: "ID expiration date" },
              id_state: { type: ["string", "null"], description: "State that issued the ID" },
              // From voice
              start_date: { type: ["string", "null"], description: "Employment start date" },
              department: { type: ["string", "null"], description: "Department assignment" },
              position: { type: ["string", "null"], description: "Job title/role" },
              hourly_rate: { type: ["string", "null"], description: "Hourly pay rate" },
              shift: { type: ["string", "null"], description: "Shift assignment (day/night/swing)" },
              supervisor: { type: ["string", "null"], description: "Reporting supervisor" },
              notes: { type: ["string", "null"], description: "Any additional notes" },
            },
            required: ["full_name"],
          },
        }],
        tool_choice: { type: "tool", name: "extract_employee_info" },
      }),
    });

    const data = await response.json();
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 });

    const toolResult = data.content?.find(b => b.type === "tool_use" && b.name === "extract_employee_info");
    if (!toolResult?.input) {
      return Response.json({ error: "Failed to extract employee information" }, { status: 500 });
    }

    return Response.json({ employee: toolResult.input });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
