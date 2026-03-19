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

  // Fallback to OpenRouter on Anthropic overload (529) or server error (5xx)
  if (response.status >= 500 && process.env.OPENROUTER_API_KEY) {
    const fallback = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
    });
    const fallbackData = await fallback.json();
    // Normalize OpenRouter response to Anthropic format
    const choice = fallbackData.choices?.[0];
    if (choice) {
      return Response.json({
        content: [{ type: "text", text: choice.message?.content || "" }],
        model: safeBody.model,
        role: "assistant",
        stop_reason: choice.finish_reason === "stop" ? "end_turn" : choice.finish_reason,
      });
    }
    return Response.json(fallbackData, { status: fallback.status });
  }

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
