"use client";
import { useState, useRef } from "react";
import { useImageCapture } from "../_lib/useImageCapture";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
  criticalBg: "rgba(192,57,43,0.06)", criticalBorder: "rgba(192,57,43,0.2)",
  warningBg: "rgba(230,160,30,0.08)", warningBorder: "rgba(230,160,30,0.3)",
  passBg: "rgba(74,101,64,0.06)", passBorder: "rgba(74,101,64,0.2)",
};

const SEVERITY_STYLES = {
  CRITICAL: { bg: C.criticalBg, border: C.criticalBorder, color: C.danger, icon: "\u26D4", label: "CRITICAL" },
  WARNING: { bg: C.warningBg, border: C.warningBorder, color: "#b87a00", icon: "\u26A0\uFE0F", label: "WARNING" },
  PASS: { bg: C.passBg, border: C.passBorder, color: C.green, icon: "\u2705", label: "COMPLIANT" },
  INFO: { bg: C.goldLight, border: `${C.gold}33`, color: C.gold, icon: "\u{1F4CB}", label: "INFO" },
};

export default function ComplianceScanPage() {
  const image = useImageCapture();
  const [area, setArea] = useState("");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  const AREAS = [
    "Production Floor", "Storage / Warehouse", "Chemical Storage",
    "Loading Dock", "Break Room / Cafeteria", "Equipment / Machinery",
    "Packaging Line", "Quality Control Lab", "General / Other",
  ];

  const scanCompliance = async () => {
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
          system: `You are RHONDA, an AI compliance inspector for a food manufacturing facility (pet food, FDA/FSMA regulated). A worker has photographed an area of the facility for an instant compliance scan.

YOUR JOB: Analyze the image for safety, regulatory, and compliance issues. Think like an OSHA inspector and an FDA auditor simultaneously.

CHECK FOR (apply all that are visible/relevant):
- OSHA violations: PPE requirements, machine guarding, lockout/tagout, fall hazards, electrical hazards, chemical storage (1910.106), housekeeping, exit routes, fire extinguishers
- FDA/FSMA food safety: allergen controls, sanitation, pest evidence, temperature control, cross-contamination risks, employee hygiene, food contact surfaces
- GMP violations: improper storage, unlabeled containers, expired materials, inadequate lighting, standing water, damaged equipment
- Chemical storage: SDS availability, incompatible materials, ventilation, secondary containment, labeling
- General safety: wet floors, blocked exits, tripping hazards, damaged infrastructure, poor lighting

RESPOND WITH VALID JSON (no markdown, no code fences) in this exact format:
{
  "overall_rating": "CRITICAL" | "WARNING" | "PASS",
  "summary": "One-sentence overall assessment",
  "findings": [
    {
      "severity": "CRITICAL" | "WARNING" | "INFO",
      "issue": "What the specific issue is",
      "regulation": "The specific OSHA/FDA/GMP regulation code",
      "regulation_text": "Brief description of what the regulation requires",
      "recommended_action": "What to do to fix it",
      "estimated_fine": "$X,XXX" or null if no direct fine
    }
  ],
  "compliant_items": ["List of things that ARE properly done/compliant"],
  "area_assessed": "What type of area this appears to be"
}

${area ? `The worker identified this area as: "${area}"` : "Determine the area type from the image."}

Be thorough but not alarmist. Only flag genuine issues visible in the image. If the area looks clean and compliant, say so — a PASS rating is a good thing.`,
          messages: [{
            role: "user",
            content: [
              image.contentBlock,
              { type: "text", text: area ? `Please scan this ${area} area for compliance issues.` : "Please scan this area for safety and compliance issues." },
            ],
          }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const rawText = data.content?.map(b => b.text).join("") || "";
      // Strip markdown fences if present
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

  const overallStyle = result ? SEVERITY_STYLES[result.overall_rating] || SEVERITY_STYLES.INFO : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Compliance Scanner</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Compliance Scanner</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Point your camera at any area. RHONDA checks OSHA, FDA, and GMP compliance instantly.</p>
        </div>

        {/* Area selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
            Area Type (optional — helps accuracy)
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {AREAS.map(a => (
              <button key={a} onClick={() => setArea(area === a ? "" : a)}
                style={{
                  padding: "6px 14px", borderRadius: 16, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${area === a ? C.gold : C.borderLight}`,
                  background: area === a ? C.goldLight : C.surface,
                  color: area === a ? C.gold : C.textMuted,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Photo capture */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 32, marginBottom: 24, textAlign: "center" }}>
          {image.preview ? (
            <div>
              <img src={image.preview} alt="Area to scan" style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 10, border: `1px solid ${C.borderLight}`, marginBottom: 16 }} />
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
              <button onClick={scanCompliance} disabled={scanning}
                style={{
                  padding: "14px 40px", borderRadius: 12, border: "none",
                  background: scanning ? C.border : `linear-gradient(135deg, ${C.danger} 0%, #a03020 100%)`,
                  color: scanning ? C.textMuted : "#fff",
                  fontSize: 16, fontWeight: 700, cursor: scanning ? "not-allowed" : "pointer", fontFamily: "inherit",
                  display: "inline-flex", alignItems: "center", gap: 10,
                  boxShadow: !scanning ? "0 4px 16px rgba(192,57,43,0.25)" : "none",
                }}>
                {scanning ? (
                  <><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Scanning...</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Scan for Compliance</>
                )}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => image.captureImage({ camera: true })}
                  style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: C.gold, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  Take Photo
                </button>
                <button onClick={() => image.captureImage()}
                  style={{ padding: "12px 24px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                  Upload File
                </button>
              </div>
              <p style={{ fontSize: 12, color: C.textMuted, marginTop: 16, lineHeight: 1.5 }}>
                Production floor, storage area, chemical cabinet, equipment, loading dock — any area of your facility.
              </p>
            </div>
          )}
          {image.error && <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: C.danger, fontSize: 12 }}>{image.error}</div>}
        </div>

        {/* Error */}
        {error && <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: C.danger, fontSize: 13, marginBottom: 24 }}>{error}</div>}

        {/* Results */}
        {result && (
          <div ref={resultRef}>
            {/* Overall rating badge */}
            <div style={{
              background: overallStyle.bg, border: `2px solid ${overallStyle.border}`,
              borderRadius: 16, padding: "24px 28px", marginBottom: 20, textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{overallStyle.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: overallStyle.color, letterSpacing: 2, textTransform: "uppercase" }}>
                {overallStyle.label}
              </div>
              <div style={{ fontSize: 14, color: C.text, marginTop: 8, lineHeight: 1.5 }}>{result.summary}</div>
              {result.area_assessed && (
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>Area: {result.area_assessed}</div>
              )}
            </div>

            {/* Findings */}
            {result.findings && result.findings.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 4, height: 20, background: C.danger, borderRadius: 2, display: "inline-block" }} />
                  Findings ({result.findings.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.findings.map((f, i) => {
                    const sev = SEVERITY_STYLES[f.severity] || SEVERITY_STYLES.INFO;
                    return (
                      <div key={i} style={{
                        background: sev.bg, border: `1px solid ${sev.border}`,
                        borderRadius: 12, padding: "16px 20px",
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{sev.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{f.issue}</div>
                            {f.regulation && (
                              <div style={{ fontSize: 12, color: sev.color, fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ padding: "2px 8px", borderRadius: 4, background: `${sev.color}15`, border: `1px solid ${sev.color}25` }}>{f.regulation}</span>
                                {f.estimated_fine && <span style={{ fontWeight: 400, color: C.danger }}>Fine: {f.estimated_fine}</span>}
                              </div>
                            )}
                            {f.regulation_text && (
                              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, fontStyle: "italic" }}>{f.regulation_text}</div>
                            )}
                            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                              <strong style={{ color: C.green }}>Fix:</strong> {f.recommended_action}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Compliant items */}
            {result.compliant_items && result.compliant_items.length > 0 && (
              <div style={{ background: C.passBg, border: `1px solid ${C.passBorder}`, borderRadius: 12, padding: "16px 20px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.green, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>\u2705</span> Compliant Items
                </h3>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8, color: C.text }}>
                  {result.compliant_items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
