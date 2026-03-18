// ── Translation API ──────────────────────────────────────────────────────────
// Claude translates content while preserving SOP structure, safety warnings,
// and technical terms. Supports any target language.

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

export async function POST(request) {
  const { text, targetLang, sourceLang = "en", context = "" } = await request.json();

  if (!text || !targetLang) {
    return Response.json({ error: "Missing 'text' or 'targetLang'" }, { status: 400 });
  }

  if (targetLang === sourceLang) {
    return Response.json({ translated: text, targetLang, sourceLang });
  }

  const targetName = LANG_NAMES[targetLang] || targetLang;
  const sourceName = LANG_NAMES[sourceLang] || sourceLang;

  const systemPrompt = `You are a professional industrial translator for a manufacturing company. Translate the following ${sourceName} text into ${targetName}.

CRITICAL RULES:
- Preserve ALL markdown formatting (headers, bullet points, checkboxes, horizontal rules)
- Preserve ALL safety warnings (⚠️ symbols must remain)
- Preserve ALL numbers, measurements, temperatures, and units exactly as-is
- Preserve technical terms that don't have standard translations — keep them in the original language with a parenthetical translation if helpful
- Preserve [VERIFY] tags
- Preserve checkbox format: - [ ] must remain as - [ ]
- Use the formal/professional register appropriate for workplace safety documents
- For Spanish: use "usted" form, not "tu"
- For Vietnamese: use professional/formal tone
- Do NOT add any translator notes or explanations — just output the translated text
${context ? `\nContext: This is ${context}` : ""}`;

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
    });

    const data = await response.json();
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    const translated = data.content?.[0]?.text || "";
    return Response.json({ translated, targetLang, sourceLang });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
