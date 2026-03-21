"use client";
import { useState, useRef, Suspense } from "react";
import { useImageCapture } from "../_lib/useImageCapture";
import { useClientConfig, getClientMeta } from "../_lib/power-tools/client-context";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

const PRODUCT_TYPES = [
  "Dry Kibble", "Wet Food / Cans", "Treats / Chews",
  "Packaging / Labels", "Raw Ingredients", "Finished Pallets",
];

const VERDICT_STYLES = {
  PASS: { bg: "rgba(74,101,64,0.08)", border: "rgba(74,101,64,0.3)", color: C.green, icon: "✅", label: "PASS — Acceptable Quality" },
  MARGINAL: { bg: "rgba(230,160,30,0.08)", border: "rgba(230,160,30,0.3)", color: "#b87a00", icon: "⚠️", label: "MARGINAL — Review Required" },
  REJECT: { bg: "rgba(192,57,43,0.08)", border: "rgba(192,57,43,0.25)", color: C.danger, icon: "⛔", label: "REJECT — Do Not Ship" },
};

function DefectInspectorInner() {
  const { clientKey } = useClientConfig();
  const meta = getClientMeta(clientKey);
  const image = useImageCapture();
  const [productType, setProductType] = useState("");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  const inspectDefects = async () => {
    if (!image.contentBlock) return;
    setScanning(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/rhonda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: `You are RHONDA's Quality Control AI for ${meta.name} (${meta.industry}).

A worker has photographed a product sample or packaging for instant quality inspection.

YOUR JOB: Analyze the image for defects, quality issues, and compliance with pet food manufacturing standards.

CHECK FOR (apply all visible/relevant):
- **Physical defects:** broken pieces, discoloration, foreign objects, inconsistent size/shape, moisture damage, mold
- **Packaging issues:** seal integrity, label alignment, incorrect labeling, damaged packaging, barcode readability, missing lot codes
- **Color/appearance:** off-color products, uneven coating, char marks, raw/undercooked appearance
- **Contamination indicators:** foreign materials, cross-contamination signs, pest evidence, moisture intrusion
- **Size/shape consistency:** pieces outside spec, clumping, excessive fines/dust
- **Label compliance:** required info present (net weight, ingredients, guaranteed analysis, AAFCO statement, lot/date codes)

RESPOND WITH VALID JSON (no markdown, no code fences):
{
  "verdict": "PASS" | "MARGINAL" | "REJECT",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "summary": "One-sentence overall quality assessment",
  "defects": [
    {
      "severity": "CRITICAL" | "MAJOR" | "MINOR",
      "issue": "Specific defect description",
      "location": "Where in the image this was observed",
      "standard": "Quality standard or regulation this relates to",
      "recommended_action": "What to do about it"
    }
  ],
  "quality_metrics": {
    "color_uniformity": "GOOD" | "FAIR" | "POOR",
    "size_consistency": "GOOD" | "FAIR" | "POOR",
    "surface_quality": "GOOD" | "FAIR" | "POOR",
    "packaging_integrity": "GOOD" | "FAIR" | "POOR" | "N/A"
  },
  "positive_observations": ["Things that look good / meet standards"],
  "batch_recommendation": "Hold / Release / Reinspect"
}

${productType ? `Product type: "${productType}"` : "Determine the product type from the image."}

Be precise and professional. If the product looks good, say so — false rejects are costly. Only flag genuine visible issues.`,
          messages: [{
            role: "user",
            content: [
              image.contentBlock,
              { type: "text", text: productType ? `Inspect this ${productType} sample for quality defects.` : "Inspect this product sample for quality defects." },
            ],
          }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const rawText = data.content?.map(b => b.text).join("") || "";
      const jsonStr = rawText.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      setResult(parsed);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setError(err.message || "Failed to analyze image");
    } finally {
      setScanning(false);
    }
  };

  const verdictStyle = result ? VERDICT_STYLES[result.verdict] || VERDICT_STYLES.MARGINAL : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Defect Inspector</div>
          </div>
        </div>
        <a href={meta.backHref} style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Quality Defect Inspector</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Photograph any product sample. RHONDA inspects for defects instantly.</p>
        </div>

        {/* Product type selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
            Product Type (optional)
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PRODUCT_TYPES.map(p => (
              <button key={p} onClick={() => setProductType(productType === p ? "" : p)}
                style={{
                  padding: "6px 14px", borderRadius: 16, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${productType === p ? C.gold : C.borderLight}`,
                  background: productType === p ? C.goldLight : C.surface,
                  color: productType === p ? C.gold : C.textMuted,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Photo capture */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 32, marginBottom: 24, textAlign: "center" }}>
          {image.preview ? (
            <div>
              <img src={image.preview} alt="Product sample" style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 10, border: `1px solid ${C.borderLight}`, marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                <button onClick={() => image.captureImage({ camera: true })}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Retake
                </button>
                <button onClick={image.clear}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.danger, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Remove
                </button>
              </div>
              <button onClick={inspectDefects} disabled={scanning}
                style={{
                  padding: "14px 40px", borderRadius: 12, border: "none",
                  background: scanning ? C.border : `linear-gradient(135deg, ${C.gold} 0%, #d4a843 100%)`,
                  color: scanning ? C.textMuted : "#fff",
                  fontSize: 16, fontWeight: 700, cursor: scanning ? "not-allowed" : "pointer", fontFamily: "inherit",
                  display: "inline-flex", alignItems: "center", gap: 10,
                  boxShadow: !scanning ? `0 4px 16px ${C.goldGlow}` : "none",
                }}>
                {scanning ? (
                  <><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Inspecting...</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Inspect for Defects</>
                )}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: C.goldLight, border: `1px solid rgba(196,155,42,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => image.captureImage({ camera: true })}
                  style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: C.gold, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  Photograph Sample
                </button>
                <button onClick={() => image.captureImage()}
                  style={{ padding: "12px 24px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                  Upload Photo
                </button>
              </div>
              <p style={{ fontSize: 12, color: C.textMuted, marginTop: 16, lineHeight: 1.5 }}>
                Kibble samples, packaging, labels, raw ingredients, finished product — any quality check.
              </p>
            </div>
          )}
          {image.error && <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: C.danger, fontSize: 12 }}>{image.error}</div>}
        </div>

        {error && <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: C.danger, fontSize: 13, marginBottom: 24 }}>{error}</div>}

        {/* Results */}
        {result && (
          <div ref={resultRef}>
            {/* Verdict badge */}
            <div style={{
              background: verdictStyle.bg, border: `2px solid ${verdictStyle.border}`,
              borderRadius: 16, padding: "24px 28px", marginBottom: 20, textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{verdictStyle.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: verdictStyle.color, letterSpacing: 2, textTransform: "uppercase" }}>
                {verdictStyle.label}
              </div>
              <div style={{ fontSize: 14, color: C.text, marginTop: 8, lineHeight: 1.5 }}>{result.summary}</div>
              {result.confidence && (
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>Confidence: {result.confidence}</div>
              )}
            </div>

            {/* Quality metrics */}
            {result.quality_metrics && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {Object.entries(result.quality_metrics).filter(([, v]) => v !== "N/A").map(([key, value]) => {
                  const metricColor = value === "GOOD" ? C.green : value === "FAIR" ? "#b87a00" : C.danger;
                  return (
                    <div key={key} style={{
                      background: C.surface, borderRadius: 10, padding: "12px 16px",
                      border: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <span style={{ fontSize: 13, color: C.text, textTransform: "capitalize" }}>
                        {key.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: metricColor, padding: "2px 10px", borderRadius: 6, background: `${metricColor}12` }}>
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Defects */}
            {result.defects && result.defects.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 4, height: 20, background: C.danger, borderRadius: 2, display: "inline-block" }} />
                  Defects Found ({result.defects.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.defects.map((d, i) => {
                    const sevColor = d.severity === "CRITICAL" ? C.danger : d.severity === "MAJOR" ? "#b87a00" : C.textMuted;
                    return (
                      <div key={i} style={{
                        background: C.surface, borderRadius: 12, padding: "16px 20px",
                        border: `1px solid ${C.borderLight}`, borderLeft: `4px solid ${sevColor}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: sevColor, padding: "2px 8px", borderRadius: 4, background: `${sevColor}12`, textTransform: "uppercase" }}>{d.severity}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{d.issue}</span>
                        </div>
                        {d.location && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Location: {d.location}</div>}
                        {d.standard && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, fontStyle: "italic" }}>{d.standard}</div>}
                        <div style={{ fontSize: 13, color: C.text }}><strong style={{ color: C.green }}>Action:</strong> {d.recommended_action}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Positive observations */}
            {result.positive_observations && result.positive_observations.length > 0 && (
              <div style={{ background: "rgba(74,101,64,0.06)", border: `1px solid rgba(74,101,64,0.2)`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.green, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>✅</span> Passes Quality Check
                </h3>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8, color: C.text }}>
                  {result.positive_observations.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {/* Batch recommendation */}
            {result.batch_recommendation && (
              <div style={{
                textAlign: "center", padding: "16px 20px", borderRadius: 12,
                background: C.surface, border: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Batch Recommendation:
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.forest, marginLeft: 8 }}>
                  {result.batch_recommendation}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function DefectInspectorPage() {
  return (
    <Suspense>
      <DefectInspectorInner />
    </Suspense>
  );
}
