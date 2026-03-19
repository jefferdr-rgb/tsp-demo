"use client";
import { useState, useRef, Suspense } from "react";
import { useToolClient } from "../_lib/useToolClient";

// ── Markdown-to-HTML (lightweight) ──────────────────────────────────────────
function md(text, accent = "#C8872A", chrome = "#3A2A1A") {
  if (!text) return "";
  return text
    .replace(/^### (.+)$/gm, `<h3 style="font-size:14px;font-weight:700;color:${chrome};margin:14px 0 4px">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-size:17px;font-weight:700;color:${accent};margin:20px 0 6px;text-transform:uppercase;letter-spacing:0.5px">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-size:22px;font-weight:700;color:${chrome};margin:24px 0 8px">$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, `<li style="margin:3px 0;font-size:13px;color:${chrome};margin-left:16px">$1</li>`)
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #d6d1c4;margin:16px 0">')
    .replace(/\n\n/g, "<br>")
    .replace(/\n/g, "\n");
}

const BRANDS = ["Evolve", "Hunter's Special", "Sportsman's Pride", "Nurture Farms", "Triumph", "PupCorn", "Private Label"];
const RECALL_TYPES = ["Aflatoxin", "Salmonella", "Foreign Object", "Vitamin/Mineral", "Labeling", "Other"];

function RecallResponseContent() {
  const { client, colors } = useToolClient();
  const C = colors;

  const [lotNumber, setLotNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [recallType, setRecallType] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const outputRef = useRef(null);

  const traceLot = async () => {
    if (!lotNumber.trim()) {
      setError("Enter a lot number to trace.");
      return;
    }
    if (!brand) {
      setError("Select a brand or product line.");
      return;
    }
    if (!recallType) {
      setError("Select a recall type.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const systemPrompt = `You are RHONDA, an AI operations assistant for ${client.name}. ${client.systemContext}

You are the Recall Response Center — the most critical tool in the plant. When a recall is triggered, every minute counts. FDA requires a 15-day report. Retailers need notification within hours. Consumers need clear, empathetic communication.

Generate a COMPLETE recall response package. Be specific to pet food manufacturing. Reference FDA 21 CFR Part 507, FSMA, and SQF recall protocols. Use real-world recall language and formatting.`;

      const promptText = `RECALL ALERT — Generate a complete recall response package:

LOT NUMBER: ${lotNumber}
BRAND/PRODUCT LINE: ${brand}
RECALL TYPE: ${recallType}
COMPANY: ${client.name}

Generate the following sections:

## AFFECTED PRODUCTION ANALYSIS
- Affected production dates (estimate a realistic range based on lot coding patterns)
- Estimated units affected
- Production line(s) involved

## DISTRIBUTION TRACE
- Distribution channels likely affected (retail, online, distributor)
- Geographic distribution footprint
- Retailer notification priority list

## RETAILER NOTIFICATION DRAFT
- Formal notification letter to retail partners
- Include lot numbers, UPC codes (mock realistic ones), product descriptions
- Clear instructions for pull-and-hold

## FDA 15-DAY REPORT TEMPLATE
- Reportable Food Registry submission template
- Include all required FDA fields
- Classification recommendation (Class I, II, or III)

## CONSUMER COMMUNICATION TEMPLATE
- Consumer-facing recall notice
- Clear, empathetic language
- Refund/replacement instructions
- Contact information template

## SOCIAL MEDIA HOLDING STATEMENT
- Brief, professional statement for social media
- Key talking points for customer service team
- Suggested FAQ responses

Mark any fields that need real data with [VERIFY].`;

      const res = await fetch("/api/rhonda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          messages: [{ role: "user", content: [{ type: "text", text: promptText }] }],
          system: systemPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `API error: ${res.status}`);
      setOutput(data.content?.[0]?.text || "No output generated.");
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const filename = `Recall_Response_Lot_${lotNumber.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.md`;
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setLotNumber("");
    setBrand("");
    setRecallType("");
    setOutput("");
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#c0392b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>!</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Recall Response Center</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{client.name}</span>
          <a href={client.backHref} style={{ color: C.accent, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
        </div>
      </div>

      {/* Urgency Banner */}
      <div style={{ background: "rgba(192,57,43,0.08)", borderBottom: "2px solid rgba(192,57,43,0.2)", padding: "10px 32px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c0392b", animation: "pulse 1.5s infinite" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#c0392b" }}>CRITICAL RESPONSE TOOL</span>
        <span style={{ fontSize: 12, color: "#7a7462" }}>FDA 15-day clock starts at discovery. Every hour matters.</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0 }}>Recall Response Center</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Enter lot details. RHONDA generates the full recall response package.</p>
        </div>

        {/* Input Form */}
        {!output && (
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 32, marginBottom: 24 }}>
            {/* Lot Number */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Lot Number</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="e.g. 24-0317-RB-A"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: 15, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Brand Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Brand / Product Line</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {BRANDS.map((b) => (
                  <button key={b} onClick={() => setBrand(brand === b ? "" : b)}
                    style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${brand === b ? C.accent : C.border}`, background: brand === b ? C.accentLight : C.surface, color: brand === b ? C.accent : C.textMuted, fontWeight: brand === b ? 600 : 400, fontSize: 13, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Recall Type */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Recall Type</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {RECALL_TYPES.map((r) => {
                  const isActive = recallType === r;
                  const isDanger = ["Aflatoxin", "Salmonella", "Foreign Object"].includes(r);
                  const activeColor = isDanger ? "#c0392b" : C.accent;
                  return (
                    <button key={r} onClick={() => setRecallType(isActive ? "" : r)}
                      style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${isActive ? activeColor : C.border}`, background: isActive ? (isDanger ? "rgba(192,57,43,0.08)" : C.accentLight) : C.surface, color: isActive ? activeColor : C.textMuted, fontWeight: isActive ? 600 : 400, fontSize: 13, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: "#c0392b", fontSize: 13 }}>{error}</div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={traceLot} disabled={loading}
                style={{ padding: "14px 40px", borderRadius: 10, border: "none", background: loading ? C.border : "#c0392b", color: loading ? C.textMuted : "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}>
                {loading ? (
                  <><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Tracing Lot...</>
                ) : "Trace Lot & Generate Response"}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !output && (
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 48, textAlign: "center" }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: "3px solid #c0392b", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>RHONDA is generating your recall response package...</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6 }}>This includes FDA templates, retailer notifications, and consumer communications</div>
          </div>
        )}

        {/* Output */}
        {output && (
          <div ref={outputRef}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 20, background: "#c0392b", borderRadius: 2, display: "inline-block" }} />
                Recall Response Package
              </h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyToClipboard} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: showCopied ? C.accentLight : C.surface, color: showCopied ? C.accent : C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                  {showCopied ? "Copied!" : "Copy All"}
                </button>
                <button onClick={downloadMarkdown} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #c0392b", background: "rgba(192,57,43,0.08)", color: "#c0392b", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  Download .md
                </button>
                <button onClick={resetAll} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  New Trace
                </button>
              </div>
            </div>

            {/* Lot Summary Bar */}
            <div style={{ background: C.chrome, borderRadius: 10, padding: "14px 20px", marginBottom: 16, display: "flex", gap: 24, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Lot</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{lotNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Brand</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.accent }}>{brand}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Type</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#E05555" }}>{recallType}</div>
              </div>
            </div>

            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: "32px 40px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", lineHeight: 1.7, fontSize: 14, color: C.text }}>
              <div dangerouslySetInnerHTML={{ __html: md(output, C.accent, C.text) }} />
            </div>

            {/* Disclaimer */}
            <div style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8, background: "rgba(192,57,43,0.06)", fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>
              <strong style={{ color: "#c0392b" }}>IMPORTANT:</strong> This is an AI-generated draft. All [VERIFY] fields must be confirmed with actual production records. Legal and regulatory review required before any external communication. Contact your SQF practitioner and legal counsel.
            </div>
          </div>
        )}

        {/* How It Works */}
        {!output && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
            {[
              { num: "1", title: "Enter Lot", desc: "Input the lot number, brand, and recall type from the initial alert." },
              { num: "2", title: "Trace & Generate", desc: "RHONDA generates FDA reports, retailer notices, and consumer communications." },
              { num: "3", title: "Execute", desc: "Download the package, verify data, and distribute through your recall team." },
            ].map((s) => (
              <div key={s.num} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: "24px 20px", textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(192,57,43,0.08)", color: "#c0392b", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>{s.num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

export default function RecallResponsePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f4f1ea", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui, sans-serif", color: "#7a7462" }}>Loading...</div>}>
      <RecallResponseContent />
    </Suspense>
  );
}
