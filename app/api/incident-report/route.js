// ── Voice Incident Report API ────────────────────────────────────────────────
// Claude structured output (tool use) guarantees every OSHA field filled.

export async function POST(request) {
  const { transcript, imageBlock, location, equipment } = await request.json();

  if (!transcript || transcript.trim().length < 10) {
    return Response.json({ error: "Description too short. Please describe what happened." }, { status: 400 });
  }

  const systemPrompt = `You are RHONDA, an AI incident report generator for a manufacturing facility. A worker has described an incident. Generate a complete, OSHA-style incident report.

Use the generate_incident_report tool to structure the output. Every field must be filled — use reasonable defaults based on context if specific info wasn't provided. For severity, use:
- "Low" = no injury, minor spill, near-miss
- "Medium" = minor injury (first aid), moderate property damage, partial area shutdown
- "High" = serious injury, major spill, full line shutdown
- "Critical" = life-threatening, fire, structural failure, facility evacuation

${location ? `Known location: ${location}` : ""}
${equipment ? `Related equipment: ${equipment}` : ""}`;

  const messages = [{
    role: "user",
    content: imageBlock
      ? [imageBlock, { type: "text", text: `Incident description: "${transcript}"` }]
      : `Incident description: "${transcript}"`,
  }];

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
        tools: [{
          name: "generate_incident_report",
          description: "Generate a structured OSHA-style incident report from a worker's description",
          input_schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short incident title (e.g., 'Chemical Spill — Bay 3')" },
              date: { type: "string", description: "Date of incident (YYYY-MM-DD or 'today')" },
              time: { type: "string", description: "Approximate time (e.g., '2:30 PM' or 'morning shift')" },
              location: { type: "string", description: "Specific location within the facility" },
              severity: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
              description: { type: "string", description: "Detailed narrative of what happened" },
              injuries: { type: "string", description: "Description of any injuries (or 'None reported')" },
              personnel_involved: { type: "array", items: { type: "string" }, description: "People involved or witnessing" },
              equipment_involved: { type: "string", description: "Any equipment, chemicals, or materials involved" },
              immediate_actions: { type: "array", items: { type: "string" }, description: "Actions taken immediately after the incident" },
              root_cause: { type: "string", description: "Preliminary root cause analysis" },
              corrective_actions: { type: "array", items: { type: "string" }, description: "Recommended corrective actions to prevent recurrence" },
              followup_required: { type: "array", items: { type: "string" }, description: "Follow-up items with responsible parties and deadlines" },
              osha_recordable: { type: "boolean", description: "Whether this incident is likely OSHA recordable" },
              area_status: { type: "string", description: "Current status of the affected area (e.g., 'Roped off', 'Cleaned and reopened')" },
            },
            required: ["title", "date", "time", "location", "severity", "description", "injuries", "equipment_involved", "immediate_actions", "corrective_actions", "followup_required", "osha_recordable", "area_status"],
          },
        }],
        tool_choice: { type: "tool", name: "generate_incident_report" },
      }),
    });

    const data = await response.json();
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 });

    const toolResult = data.content?.find(b => b.type === "tool_use" && b.name === "generate_incident_report");
    if (!toolResult?.input) {
      return Response.json({ error: "Failed to generate structured report" }, { status: 500 });
    }

    return Response.json({ report: toolResult.input });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
