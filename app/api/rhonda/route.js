const ALLOWED_MODELS = [
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
];
const MAX_TOKENS_CAP = 4096;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }

  // Validate model
  if (!body.model || !ALLOWED_MODELS.includes(body.model)) {
    return Response.json(
      { error: { message: "Invalid model" } },
      { status: 400 }
    );
  }

  // Cap max_tokens
  const maxTokens = Math.min(Number(body.max_tokens) || 1024, MAX_TOKENS_CAP);

  // Only pass through safe fields
  const safeBody = {
    model: body.model,
    max_tokens: maxTokens,
    system: body.system,
    messages: body.messages,
  };

  // Pass through tools/tool_choice if present (used by Sheets features)
  if (body.tools) safeBody.tools = body.tools;
  if (body.tool_choice) safeBody.tool_choice = body.tool_choice;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
    },
    body: JSON.stringify(safeBody),
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
