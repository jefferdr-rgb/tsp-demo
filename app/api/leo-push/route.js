export async function POST(request) {
  const { clientKey, rawData } = await request.json();
  if (!clientKey || !rawData) {
    return Response.json({ error: "Missing clientKey or rawData" }, { status: 400 });
  }

  // Step 1: Claude extracts structured metrics from raw spreadsheet data
  let metrics;
  try {
    const extractRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: `You extract business KPI metrics from spreadsheet data and return a JSON object.

Return ONLY valid JSON in this exact shape — no explanation, no markdown:
{
  "kpis": [
    {"label": "Revenue (MTD)", "value": 0, "prefix": "$", "change": "+0%", "up": true},
    {"label": "Units Sold", "value": 0, "change": "+0%", "up": true},
    {"label": "Active SKUs", "value": 0, "change": "+0%", "up": true},
    {"label": "Fill Rate", "value": 0, "suffix": "%", "change": "+0%", "up": true}
  ],
  "pipeline": "$0",
  "pipelineChange": "+0%",
  "revenueMTD": 0,
  "revenueMTDLabel": "$0",
  "revenueTarget": 0,
  "revenueTargetLabel": "$0",
  "revenueProgress": 0
}

Rules:
- Use real numbers from the data. Make label names match the data (e.g. "Bags Sold" instead of "Units Sold" if that fits better).
- For "up": true if change is positive, false if negative.
- For "revenueProgress": the percentage of revenue target achieved (0-100).
- If a field can't be determined, use a sensible default.
- Return only the JSON object, nothing else.`,
        messages: [
          { role: "user", content: `Extract metrics from this data:\n\n${rawData.slice(0, 4000)}` },
        ],
      }),
    });

    const extractData = await extractRes.json();
    const raw = extractData.content?.[0]?.text?.trim();
    const text = raw?.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    metrics = JSON.parse(text);
  } catch {
    return Response.json({ error: "Failed to extract metrics from data" }, { status: 500 });
  }

  // Step 2: Push metrics to LEO's update endpoint
  try {
    const leoRes = await fetch(`${process.env.LEO_URL}/api/leo/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LEO_UPDATE_SECRET}`,
      },
      body: JSON.stringify({ clientKey, metrics }),
    });

    if (!leoRes.ok) {
      const err = await leoRes.json();
      return Response.json({ error: "LEO update failed", detail: err }, { status: 502 });
    }

    return Response.json({ ok: true, metrics });
  } catch {
    return Response.json({ error: "Could not reach LEO" }, { status: 500 });
  }
}
