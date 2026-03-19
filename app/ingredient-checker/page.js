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

const INGREDIENTS = [
  { name: "Corn", specs: "Protein: 7-9%, Moisture: <14%, Aflatoxin: <20 ppb" },
  { name: "Chicken Meal", specs: "Protein: 60-68%, Moisture: <10%, Fat: 10-14%, Ash: <18%" },
  { name: "Chicken Fat", specs: "FFA: <5%, Moisture: <1%, Peroxide: <10 meq/kg" },
  { name: "Rice", specs: "Protein: 6-8%, Moisture: <14%, Broken: <25%" },
  { name: "Beet Pulp", specs: "Fiber: 15-22%, Moisture: <12%, Sugar: <10%" },
  { name: "Fish Meal", specs: "Protein: 60-72%, Moisture: <10%, Fat: 8-12%, Ash: <20%" },
  { name: "Vitamins Premix", specs: "Per COA specification" },
  { name: "Minerals Premix", specs: "Per COA specification" },
  { name: "Preservatives (BHA/BHT/Ethoxyquin)", specs: "Within AAFCO limits" },
];

function IngredientCheckerContent() {
  const { client, colors } = useToolClient();
  const C = colors;

  const [ingredient, setIngredient] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [proteinPct, setProteinPct] = useState("");
  const [moisturePct, setMoisturePct] = useState("");
  const [fatPct, setFatPct] = useState("");
  const [aflatoxinPpb, setAflatoxinPpb] = useState("");

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [coaScanning, setCoaScanning] = useState(false);
  const outputRef = useRef(null);
  const image = useImageCapture();

  // Scan a COA photo and auto-fill fields
  const scanCOA = async () => {
    if (!image.contentBlock) return;
    setCoaScanning(true);
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
            { type: "text", text: `This is a Certificate of Analysis (COA) for a pet food ingredient. Extract the following and return ONLY a JSON object, no other text:\n{\n  "ingredient": "...",\n  "supplier": "...",\n  "lot": "...",\n  "protein": "..." or null,\n  "moisture": "..." or null,\n  "fat": "..." or null,\n  "aflatoxin": "..." or null\n}\n\nReturn numbers only for the values (no % or ppb units). If a field is not visible, use null.` }
          ] }],
          system: "You are an AI that reads Certificates of Analysis for pet food ingredients. Extract data precisely. Return ONLY valid JSON.",
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.ingredient) {
          const found = INGREDIENTS.find(i => i.name.toLowerCase() === parsed.ingredient.toLowerCase());
          if (found) setIngredient(found.name);
        }
        if (parsed.supplier) setSupplierName(parsed.supplier);
        if (parsed.lot) setLotNumber(parsed.lot);
        if (parsed.protein) setProteinPct(parsed.protein);
        if (parsed.moisture) setMoisturePct(parsed.moisture);
        if (parsed.fat) setFatPct(parsed.fat);
        if (parsed.aflatoxin) setAflatoxinPpb(parsed.aflatoxin);
      } else {
        setError("Could not read COA. Try a clearer photo or enter values manually.");
      }
    } catch (err) {
      setError("COA scan failed: " + err.message);
    } finally {
      setCoaScanning(false);
    }
  };

  const checkSpec = async () => {
    if (!ingredient) { setError("Select an ingredient."); return; }
    if (!supplierName.trim()) { setError("Enter a supplier name."); return; }
    if (!lotNumber.trim()) { setError("Enter a lot number."); return; }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const systemPrompt = `You are RHONDA, an AI ingredient spec checker for ${client.name}. ${client.systemContext}

You help the VP of Purchasing & Formulation (Marco) cross-reference incoming ingredient COAs against formulation specs. You know AAFCO standards, typical pet food ingredient specifications, and SQF receiving requirements.

When analyzing, be specific about:
- Whether each test result passes typical industry specs for this ingredient
- Any red flags that should trigger a supplier conversation
- How this compares to typical ranges for premium vs. economy pet food ingredients
- Whether the ingredient is safe for both dog and cat formulations`;

      const selectedSpec = INGREDIENTS.find((i) => i.name === ingredient);
      const promptText = `INGREDIENT COA CHECK

Ingredient: ${ingredient}
Typical Spec Range: ${selectedSpec?.specs || "Standard industry specs"}
Supplier: ${supplierName}
Lot Number: ${lotNumber}

COA Test Results:
${proteinPct ? `- Protein: ${proteinPct}%` : ""}
${moisturePct ? `- Moisture: ${moisturePct}%` : ""}
${fatPct ? `- Fat: ${fatPct}%` : ""}
${aflatoxinPpb ? `- Aflatoxin: ${aflatoxinPpb} ppb` : ""}

Please provide:

## SPEC COMPLIANCE VERDICT
For each test result, state PASS, FLAG, or REJECT with explanation.

## OVERALL RECOMMENDATION
Accept, Accept with Conditions, or Reject — with reasoning.

## FORMULATION IMPACT
How do these results affect formulation? Would the protein or fat content require any batch adjustment?

## SUPPLIER QUALITY NOTES
Any patterns or concerns to raise with this supplier? Quality trending?

## RECEIVING INSTRUCTIONS
Specific instructions for the warehouse: accept to production, hold for re-test, or reject and quarantine.`;

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
      const resultText = data.content?.[0]?.text || "No output generated.";
      setOutput(resultText);

      // Determine status from response
      const lower = resultText.toLowerCase();
      let status = "Pass";
      if (lower.includes("reject")) status = "Reject";
      else if (lower.includes("flag") || lower.includes("conditions") || lower.includes("hold")) status = "Flag";

      setHistory((prev) => [{
        id: Date.now(),
        ingredient,
        supplier: supplierName,
        lot: lotNumber,
        status,
        timestamp: new Date().toLocaleString(),
      }, ...prev]);

      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIngredient("");
    setSupplierName("");
    setLotNumber("");
    setProteinPct("");
    setMoisturePct("");
    setFatPct("");
    setAflatoxinPpb("");
    setOutput("");
    setError("");
  };

  const STATUS_STYLES = {
    Pass: { bg: "rgba(74,101,64,0.08)", color: "#4a6540", border: "#4a6540" },
    Flag: { bg: "rgba(196,155,42,0.12)", color: "#b8860b", border: "#c49b2a" },
    Reject: { bg: "rgba(192,57,43,0.08)", color: "#c0392b", border: "#c0392b" },
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
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Ingredient Spec Checker</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{client.name}</span>
          <a href={client.backHref} style={{ color: C.accent, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0 }}>Ingredient Spec Checker</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Cross-reference incoming COAs against formulation specs. Built for Marco.</p>
        </div>

        {/* Input Form */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28, marginBottom: 24 }}>
          {/* Ingredient Selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Ingredient</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {INGREDIENTS.map((ing) => (
                <button key={ing.name} onClick={() => setIngredient(ingredient === ing.name ? "" : ing.name)}
                  style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${ingredient === ing.name ? C.accent : C.border}`, background: ingredient === ing.name ? C.accentLight : "transparent", color: ingredient === ing.name ? C.accent : C.textMuted, fontWeight: ingredient === ing.name ? 600 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {ing.name}
                </button>
              ))}
            </div>
            {ingredient && (
              <div style={{ marginTop: 8, padding: "8px 14px", borderRadius: 8, background: C.accentLight, fontSize: 12, color: C.accent }}>
                Typical specs: {INGREDIENTS.find((i) => i.name === ingredient)?.specs}
              </div>
            )}
          </div>

          {/* Scan COA Photo */}
          <div style={{ marginBottom: 18, padding: 16, borderRadius: 12, border: `1px dashed ${C.border}`, background: C.bg, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Scan COA Document</div>
            {image.preview ? (
              <div>
                <img src={image.preview} alt="COA" style={{ maxWidth: 300, maxHeight: 200, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button onClick={scanCOA} disabled={coaScanning}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: coaScanning ? C.border : C.accent, color: coaScanning ? C.textMuted : "#fff", fontSize: 13, fontWeight: 600, cursor: coaScanning ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                    {coaScanning ? (<><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Reading COA...</>) : "Read COA & Auto-Fill"}
                  </button>
                  <button onClick={image.clear} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => image.captureImage({ camera: true })}
                  style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.accent}`, background: C.accentLight, color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Take Photo of COA
                </button>
                <button onClick={() => image.captureImage()}
                  style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Upload COA File
                </button>
              </div>
            )}
            {image.error && <div style={{ color: C.danger, fontSize: 12, marginTop: 8 }}>{image.error}</div>}
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>Photograph the COA — RHONDA reads it and fills in the form. Supports iPhone photos.</div>
          </div>

          {/* Supplier + Lot */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Supplier Name</label>
              <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="e.g. Cargill, ADM, Tyson" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Lot Number</label>
              <input type="text" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} placeholder="e.g. SUP-2024-0317" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Test Results */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>COA Test Results</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 4 }}>Protein %</label>
                <input type="text" value={proteinPct} onChange={(e) => setProteinPct(e.target.value)} placeholder="e.g. 65.2" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 4 }}>Moisture %</label>
                <input type="text" value={moisturePct} onChange={(e) => setMoisturePct(e.target.value)} placeholder="e.g. 8.5" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 4 }}>Fat %</label>
                <input type="text" value={fatPct} onChange={(e) => setFatPct(e.target.value)} placeholder="e.g. 12.1" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 4 }}>Aflatoxin ppb</label>
                <input type="text" value={aflatoxinPpb} onChange={(e) => setAflatoxinPpb(e.target.value)} placeholder="e.g. 12" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 14, padding: "10px 16px", borderRadius: 8, background: C.dangerBg, color: C.danger, fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={checkSpec} disabled={loading}
              style={{ padding: "12px 36px", borderRadius: 10, border: "none", background: loading ? C.border : C.accent, color: loading ? C.textMuted : "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
              {loading ? (
                <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Checking...</>
              ) : "Check Against Spec"}
            </button>
            {(output || ingredient) && (
              <button onClick={resetForm} style={{ padding: "12px 24px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
            )}
          </div>
        </div>

        {/* Output */}
        {output && (
          <div ref={outputRef} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 20, background: C.accent, borderRadius: 2, display: "inline-block" }} />
                Spec Check Results
              </h2>
              <button onClick={() => { navigator.clipboard.writeText(output); setShowCopied(true); setTimeout(() => setShowCopied(false), 2000); }}
                style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: showCopied ? C.accentLight : C.surface, color: showCopied ? C.accent : C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                {showCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: "32px 40px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", lineHeight: 1.7, fontSize: 14, color: C.text }}>
              <div dangerouslySetInnerHTML={{ __html: md(output, C.accent, C.text) }} />
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Recent Checks</h2>
            </div>
            <div style={{ padding: "0" }}>
              {history.map((h) => {
                const st = STATUS_STYLES[h.status] || STATUS_STYLES.Pass;
                return (
                  <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{h.status}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{h.ingredient}</div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>{h.supplier} — Lot {h.lot}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{h.timestamp}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

export default function IngredientCheckerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f4f1ea", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui, sans-serif", color: "#7a7462" }}>Loading...</div>}>
      <IngredientCheckerContent />
    </Suspense>
  );
}
