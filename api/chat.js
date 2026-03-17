// PII patterns — redacts before anything leaves the server
const PII_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, label: "[SSN REDACTED]" },
  { pattern: /\b\d{9}\b(?=\s|$|,|\.)/g, label: "[SSN REDACTED]" },
  { pattern: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[- ]?\d{4}[- ]?\d{4}[- ]?\d{1,4}\b/g, label: "[CARD REDACTED]" },
  { pattern: /\b(?:acct|account|routing)[\s#:]*\d{6,17}\b/gi, label: "[ACCOUNT REDACTED]" },
];

function redactPII(text) {
  if (typeof text !== "string") return text;
  let redacted = text;
  for (const { pattern, label } of PII_PATTERNS) {
    redacted = redacted.replace(pattern, label);
  }
  return redacted;
}

function redactMessages(body) {
  if (!body?.messages) return body;
  return {
    ...body,
    messages: body.messages.map((msg) => ({
      ...msg,
      content: typeof msg.content === "string"
        ? redactPII(msg.content)
        : Array.isArray(msg.content)
          ? msg.content.map((block) =>
              block.type === "text" ? { ...block, text: redactPII(block.text) } : block
            )
          : msg.content,
    })),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sanitized = redactMessages(req.body);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(sanitized),
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
