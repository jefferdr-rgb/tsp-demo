"use client";
import { useState, useRef, Suspense } from "react";
import { useToolClient } from "../_lib/useToolClient";
import { useImageCapture } from "../_lib/useImageCapture";

// ── Markdown-to-HTML ────────────────────────────────────────────────────────
function md(text, accent, chrome) {
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

const TEST_TYPES = ["Moisture", "Protein", "Fat", "Fiber", "Ash", "Aflatoxin", "Salmonella", "Particle Size"];
const SECTIONS = [
  { id: "incoming", label: "Incoming Materials", icon: "IN", desc: "COA review for incoming ingredients" },
  { id: "inprocess", label: "In-Process Testing", icon: "IP", desc: "Active production line monitoring" },
  { id: "finished", label: "Finished Product Release", icon: "FP", desc: "Final QA before shipping" },
  { id: "environmental", label: "Environmental Monitoring", icon: "EM", desc: "Zone swabs, air, and surface testing" },
];

function QualityLabContent() {
  const { client, colors } = useToolClient();
  const C = colors;

  // Section statuses
  const [sectionStatus, setSectionStatus] = useState({
    incoming: "Pass", inprocess: "Pass", finished: "Hold", environmental: "Pass",
  });

  // Test records
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({
    productName: "", batchLot: "", testType: "", resultValue: "", specMin: "", specMax: "", section: "incoming",
  });

  // AI Analysis
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const [labScanning, setLabScanning] = useState(false);
  const analysisRef = useRef(null);
  const image = useImageCapture();

  // Scan a lab result photo and auto-fill the form
  const scanLabResult = async () => {
    if (!image.contentBlock) return;
    setLabScanning(true);
    setError("");
    try {
      const res = await fetch("/api/rhonda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          messages: [{ role: "user", content: [
            image.contentBlock,
            { type: "text", text: `This is a quality lab test result document from a pet food manufacturing plant. Extract the following and return ONLY a JSON object:\n{\n  "productName": "...",\n  "batchLot": "...",\n  "testType": "...",\n  "resultValue": "...",\n  "specMin": "..." or null,\n  "specMax": "..." or null\n}\n\nFor testType, use one of: Moisture, Protein, Fat, Fiber, Ash, Aflatoxin, Salmonella, Particle Size.\nReturn numbers only for values (no units). If not visible, use null.` }
          ] }],
          system: "You read quality lab test results for pet food manufacturing. Extract data precisely. Return ONLY valid JSON.",
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.productName) updateForm("productName", parsed.productName);
        if (parsed.batchLot) updateForm("batchLot", parsed.batchLot);
        if (parsed.testType) updateForm("testType", parsed.testType);
        if (parsed.resultValue) updateForm("resultValue", parsed.resultValue);
        if (parsed.specMin) updateForm("specMin", parsed.specMin);
        if (parsed.specMax) updateForm("specMax", parsed.specMax);
      } else {
        setError("Could not read lab result. Try a clearer photo or enter values manually.");
      }
    } catch (err) {
      setError("Lab scan failed: " + err.message);
    } finally {
      setLabScanning(false);
    }
  };

  const STATUS_COLORS = {
    Pass: { bg: "rgba(74,101,64,0.08)", text: "#4a6540", border: "#4a6540" },
    Hold: { bg: "rgba(196,155,42,0.12)", text: "#b8860b", border: "#c49b2a" },
    Fail: { bg: "rgba(192,57,43,0.08)", text: "#c0392b", border: "#c0392b" },
  };

  const updateForm = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const getPassFail = (value, min, max) => {
    const v = parseFloat(value);
    const lo = parseFloat(min);
    const hi = parseFloat(max);
    if (isNaN(v)) return "Pending";
    if (!isNaN(lo) && v < lo) return "Fail";
    if (!isNaN(hi) && v > hi) return "Fail";
    return "Pass";
  };

  const addTest = () => {
    if (!form.productName || !form.batchLot || !form.testType || !form.resultValue) {
      setError("Fill in all required fields.");
      return;
    }
    const result = getPassFail(form.resultValue, form.specMin, form.specMax);
    const newTest = {
      ...form,
      result,
      timestamp: new Date().toLocaleString(),
      id: Date.now(),
    };
    setTests((prev) => [newTest, ...prev]);

    // Update section status if any test fails
    if (result === "Fail") {
      setSectionStatus((prev) => ({ ...prev, [form.section]: "Fail" }));
    }

    setForm((f) => ({ ...f, productName: "", batchLot: "", resultValue: "", specMin: "", specMax: "" }));
    setError("");
  };

  const runAnalysis = async () => {
    if (tests.length === 0) {
      setError("Add test results before running AI analysis.");
      return;
    }
    setAnalyzing(true);
    setError("");
    setAnalysis("");

    try {
      const testSummary = tests.map((t) =>
        `${t.testType} | ${t.productName} | Lot: ${t.batchLot} | Result: ${t.resultValue} | Spec: ${t.specMin || "—"} to ${t.specMax || "—"} | ${t.result} | Section: ${t.section} | ${t.timestamp}`
      ).join("\n");

      const systemPrompt = `You are RHONDA, an AI quality lab assistant for ${client.name}. ${client.systemContext}

You are the Quality Lab Dashboard — an SQF Level 3 compliance tool. Analyze test results for trends, flag deviations, and provide actionable recommendations. Reference SQF Code Edition 9, FSMA requirements, and AAFCO standards for pet food.`;

      const promptText = `Analyze the following quality lab test results and provide:

## TREND ANALYSIS
- Identify patterns across products, lots, and test types
- Flag any results trending toward spec limits (even if currently passing)

## DEVIATIONS & FLAGS
- List any failures or near-failures
- Risk assessment for each deviation
- Root cause hypotheses

## HOLD/RELEASE RECOMMENDATIONS
- For any lots currently on hold, provide release criteria
- Decision matrix: release, re-test, or reject

## SQF COMPLIANCE NOTES
- Any SQF documentation requirements triggered by these results
- Corrective action requirements

## ENVIRONMENTAL MONITORING ASSESSMENT
- If environmental data is present, assess zone status
- Pathogen indicator trends

TEST DATA:
${testSummary}

Section Statuses: ${JSON.stringify(sectionStatus)}`;

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
      setAnalysis(data.content?.[0]?.text || "No analysis generated.");
      setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const copyAnalysis = () => {
    navigator.clipboard.writeText(analysis);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Quality Lab Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{client.name}</span>
          <a href={client.backHref} style={{ color: C.accent, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0 }}>Quality Lab Dashboard</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>SQF Level 3 compliance tracking. Log tests, monitor status, get AI analysis.</p>
        </div>

        {/* Section Status Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {SECTIONS.map((s) => {
            const status = sectionStatus[s.id];
            const sc = STATUS_COLORS[status];
            return (
              <div key={s.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: sc.border }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: sc.text }}>{s.icon}</div>
                  <select
                    value={status}
                    onChange={(e) => setSectionStatus((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    style={{ fontSize: 11, fontWeight: 700, color: sc.text, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 12, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <option value="Pass">Pass</option>
                    <option value="Hold">Hold</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.label}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.desc}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>{tests.filter((t) => t.section === s.id).length} tests logged</div>
              </div>
            );
          })}
        </div>

        {/* Test Entry Form */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 18, background: C.accent, borderRadius: 2, display: "inline-block" }} />
            Log Test Result
          </h2>

          {/* Scan Lab Result Photo */}
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, border: `1px dashed ${C.border}`, background: C.bg, textAlign: "center" }}>
            {image.preview ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                <img src={image.preview} alt="Lab result" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: `1px solid ${C.border}` }} />
                <button onClick={scanLabResult} disabled={labScanning}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: labScanning ? C.border : C.accent, color: labScanning ? C.textMuted : "#fff", fontSize: 12, fontWeight: 600, cursor: labScanning ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  {labScanning ? (<><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Reading...</>) : "Auto-Fill from Photo"}
                </button>
                <button onClick={image.clear} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
                <button onClick={() => image.captureImage({ camera: true })}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.accent}`, background: C.accentLight, color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Photo Lab Result
                </button>
                <button onClick={() => image.captureImage()}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  Upload File
                </button>
                <span style={{ fontSize: 11, color: C.textMuted }}>Photograph a test result — RHONDA reads it and fills the form. Supports iPhone photos.</span>
              </div>
            )}
            {image.error && <div style={{ color: C.danger, fontSize: 11, marginTop: 6 }}>{image.error}</div>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Product Name</label>
              <input type="text" value={form.productName} onChange={(e) => updateForm("productName", e.target.value)} placeholder="e.g. Evolve Classic Chicken" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Batch / Lot Number</label>
              <input type="text" value={form.batchLot} onChange={(e) => updateForm("batchLot", e.target.value)} placeholder="e.g. 24-0317-RB-A" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Test Type</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TEST_TYPES.map((t) => (
                  <button key={t} onClick={() => updateForm("testType", form.testType === t ? "" : t)}
                    style={{ padding: "6px 12px", borderRadius: 16, border: `1px solid ${form.testType === t ? C.accent : C.border}`, background: form.testType === t ? C.accentLight : "transparent", color: form.testType === t ? C.accent : C.textMuted, fontSize: 12, fontWeight: form.testType === t ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Section</label>
              <select value={form.section} onChange={(e) => updateForm("section", e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}>
                {SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Result Value</label>
              <input type="text" value={form.resultValue} onChange={(e) => updateForm("resultValue", e.target.value)} placeholder="e.g. 10.2" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Spec Min</label>
              <input type="text" value={form.specMin} onChange={(e) => updateForm("specMin", e.target.value)} placeholder="e.g. 8.0" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Spec Max</label>
              <input type="text" value={form.specMax} onChange={(e) => updateForm("specMax", e.target.value)} placeholder="e.g. 12.0" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8, background: C.dangerBg, color: C.danger, fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={addTest}
              style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Log Test
            </button>
            <button onClick={runAnalysis} disabled={analyzing || tests.length === 0}
              style={{ padding: "10px 28px", borderRadius: 8, border: `1px solid ${tests.length === 0 ? C.border : C.accent}`, background: analyzing ? C.border : C.accentLight, color: tests.length === 0 ? C.textMuted : C.accent, fontSize: 14, fontWeight: 600, cursor: tests.length === 0 || analyzing ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
              {analyzing ? (
                <><span style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Analyzing...</>
              ) : "AI Analysis"}
            </button>
          </div>
        </div>

        {/* Test History Table */}
        {tests.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Test History ({tests.length} results)</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Time", "Product", "Lot", "Test", "Result", "Spec Range", "Status", "Section"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tests.map((t) => {
                    const sc = STATUS_COLORS[t.result] || STATUS_COLORS.Pass;
                    return (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "10px 14px", color: C.textMuted, fontSize: 12 }}>{t.timestamp}</td>
                        <td style={{ padding: "10px 14px", color: C.text, fontWeight: 500 }}>{t.productName}</td>
                        <td style={{ padding: "10px 14px", color: C.text, fontFamily: "monospace", fontSize: 12 }}>{t.batchLot}</td>
                        <td style={{ padding: "10px 14px", color: C.text }}>{t.testType}</td>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: C.text }}>{t.resultValue}</td>
                        <td style={{ padding: "10px 14px", color: C.textMuted }}>{t.specMin || "—"} – {t.specMax || "—"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>{t.result}</span>
                        </td>
                        <td style={{ padding: "10px 14px", color: C.textMuted, fontSize: 12 }}>{SECTIONS.find((s) => s.id === t.section)?.label || t.section}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Analysis Output */}
        {(analysis || analyzing) && (
          <div ref={analysisRef} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 20, background: C.accent, borderRadius: 2, display: "inline-block" }} />
                AI Lab Analysis
              </h2>
              {analysis && (
                <button onClick={copyAnalysis} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: showCopied ? C.accentLight : C.surface, color: showCopied ? C.accent : C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  {showCopied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: "32px 40px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", lineHeight: 1.7, fontSize: 14, color: C.text }}>
              {analyzing && !analysis ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted }}>
                  <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                  <div style={{ fontSize: 14, fontWeight: 500 }}>RHONDA is analyzing your test data...</div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: md(analysis, C.accent, C.text) }} />
              )}
            </div>
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

export default function QualityLabPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f4f1ea", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui, sans-serif", color: "#7a7462" }}>Loading...</div>}>
      <QualityLabContent />
    </Suspense>
  );
}
