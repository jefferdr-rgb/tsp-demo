"use client";
import { useState, useRef, Suspense } from "react";
import { useImageCapture } from "../_lib/useImageCapture";
import { useVoiceInput } from "../_lib/useVoiceInput";
import { useClientConfig, getClientMeta } from "../_lib/power-tools/client-context";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

// Demo equipment database with maintenance history
const EQUIPMENT_DB = {
  "demo-extruder-01": {
    name: "Kibble Extruder #1", location: "Production Floor — Line A", type: "Extruder",
    model: "Wenger X-200", installed: "2019-06-15", lastService: "2026-02-28",
    hours: 4200, health: 87,
    history: [
      { date: "2026-02-28", type: "Preventive", desc: "Bearing replacement, lubrication, die inspection", tech: "Carlos Vega" },
      { date: "2026-01-15", type: "Repair", desc: "Pressure sensor replaced — was reading 6 PSI low", tech: "Carlos Vega" },
      { date: "2025-11-20", type: "Preventive", desc: "Full teardown, screw/barrel inspection, new gaskets", tech: "Carlos Vega" },
      { date: "2025-09-10", type: "Emergency", desc: "Emergency shutdown — pressure spike to 65 PSI. Root cause: blocked die. Cleared and resumed.", tech: "External — Wenger Service" },
    ],
    knownIssues: ["Die wear increases after 3 months — adjust pressure to 44-46 PSI (Jim Rivera tip)", "Moisture below 12% causes auger jams in winter"],
    sops: ["Extruder Startup Procedure", "Extruder Emergency Shutdown", "Die Changeover"],
  },
  "demo-sealer-03": {
    name: "Packaging Sealer #3", location: "Packaging", type: "Sealer",
    model: "Bosch SVE-2600", installed: "2021-03-10", lastService: "2026-03-10",
    hours: 3100, health: 64,
    history: [
      { date: "2026-03-10", type: "Repair", desc: "Temperature calibration — running 8°F high. Adjusted thermocouple.", tech: "Carlos Vega" },
      { date: "2026-02-20", type: "Emergency", desc: "Hot surface contact near-miss. Guard reinstalled. Safety review completed.", tech: "Diane Atkins" },
      { date: "2026-01-05", type: "Preventive", desc: "Film tension roller replacement, heating element inspection", tech: "Carlos Vega" },
      { date: "2025-10-15", type: "Repair", desc: "Reject rate spike — film tension roller worn. Replaced.", tech: "Carlos Vega" },
    ],
    knownIssues: ["Heating element degradation — monitor temp closely", "Film tension roller: most rejects are tension, not sealer (Carlos tip)", "Seal temperature spec: 290-300°F"],
    sops: ["Sealer Startup", "Film Roll Change", "Seal Quality Check"],
  },
  "demo-conveyor-07": {
    name: "Conveyor Belt #7", location: "Production Floor — Line B", type: "Conveyor",
    model: "Hytrol EZLogic", installed: "2018-09-01", lastService: "2026-01-20",
    hours: 6800, health: 43,
    history: [
      { date: "2026-01-20", type: "Preventive", desc: "Belt tracking adjustment, roller bearings greased", tech: "Carlos Vega" },
      { date: "2025-12-05", type: "Repair", desc: "Motor replaced — original was overheating. New motor running 15°F cooler.", tech: "External — Hytrol Service" },
      { date: "2025-08-15", type: "Emergency", desc: "Belt snapped under load. 4 hours downtime. New belt installed.", tech: "External — Hytrol Service" },
    ],
    knownIssues: ["Belt alignment degrading — 2.3° off center and worsening daily", "Motor overheating due to misalignment", "Belt failure likely within 5-7 days if not addressed", "Grease bearings every 500 hours, not 1000 (Carlos tip)"],
    sops: ["Conveyor Belt Inspection", "Belt Tension Adjustment"],
  },
};

function EquipmentWhispererInner() {
  const { clientKey } = useClientConfig();
  const meta = getClientMeta(clientKey);
  const image = useImageCapture();
  const voice = useVoiceInput({ lang: "en-US" });
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [symptom, setSymptom] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  const equipment = EQUIPMENT_DB[selectedEquipment];
  const symptomText = voice.transcript || symptom;

  const diagnose = async () => {
    if (!selectedEquipment || (!symptomText.trim() && !image.contentBlock)) return;
    setDiagnosing(true);
    setError("");
    setDiagnosis(null);

    const eq = EQUIPMENT_DB[selectedEquipment];
    const historyText = eq.history.map(h => `${h.date} [${h.type}]: ${h.desc} (by ${h.tech})`).join("\n");
    const issuesText = eq.knownIssues.join("\n- ");

    const messages = [{
      role: "user",
      content: [
        ...(image.contentBlock ? [image.contentBlock] : []),
        {
          type: "text",
          text: `Equipment: ${eq.name} (${eq.model})\nLocation: ${eq.location}\nInstalled: ${eq.installed}\nHours: ${eq.hours}\nHealth Score: ${eq.health}%\nLast Service: ${eq.lastService}\n\nMaintenance History:\n${historyText}\n\nKnown Issues:\n- ${issuesText}\n\nRelated SOPs: ${eq.sops.join(", ")}\n\n${symptomText.trim() ? `Worker describes the problem: "${symptomText.trim()}"` : "Worker sent a photo of the issue. Diagnose from the image."}\n\nDiagnose this issue and provide repair guidance.`,
        },
      ],
    }];

    try {
      const res = await fetch("/api/rhonda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 3072,
          system: `You are RHONDA's Equipment Whisperer — an AI maintenance diagnostic system for ${meta.name} (${meta.industry}).

You have full access to equipment maintenance history, known issues, veteran tips, and SOPs.

YOUR JOB: Diagnose the reported issue using the equipment's history and known issues. Think like an experienced maintenance technician who knows this specific machine's quirks.

RESPOND WITH VALID JSON:
{
  "diagnosis": "What's likely wrong and why",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "root_cause": "The underlying cause, not just the symptom",
  "history_match": "Any relevant pattern from maintenance history",
  "veteran_tip": "Any relevant known issue or worker tip that applies (null if none)",
  "repair_steps": [
    { "step": 1, "action": "What to do", "time_estimate": "X minutes", "parts_needed": "Part name or null", "skill_level": "Basic | Intermediate | Advanced" }
  ],
  "safety_warnings": ["Any safety precautions for this repair"],
  "can_operator_fix": true | false,
  "estimated_downtime": "X hours",
  "estimated_cost": "$X — parts + labor",
  "prevention": "How to prevent this from recurring",
  "related_sop": "Name of relevant SOP or null",
  "urgency": "Fix now | Schedule this week | Next PM cycle"
}`,
          messages,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const rawText = data.content?.map(b => b.text).join("") || "";
      const jsonStr = rawText.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      setDiagnosis(JSON.parse(jsonStr));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setError(err.message || "Diagnosis failed");
    } finally {
      setDiagnosing(false);
    }
  };

  const sevColor = diagnosis?.severity === "CRITICAL" ? C.danger : diagnosis?.severity === "HIGH" ? "#E67E22" : diagnosis?.severity === "MEDIUM" ? "#b87a00" : C.green;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Equipment Whisperer</div>
          </div>
        </div>
        <a href={meta.backHref} style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Equipment Whisperer</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Describe the problem or photograph it. RHONDA diagnoses from maintenance history + veteran knowledge.</p>
        </div>

        {/* Equipment selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
            Select Equipment
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(EQUIPMENT_DB).map(([id, eq]) => {
              const healthColor = eq.health >= 80 ? C.green : eq.health >= 60 ? "#b87a00" : C.danger;
              return (
                <div key={id} onClick={() => setSelectedEquipment(id)}
                  style={{
                    padding: "14px 18px", borderRadius: 12, cursor: "pointer",
                    background: selectedEquipment === id ? C.goldLight : C.surface,
                    border: `1px solid ${selectedEquipment === id ? C.gold : C.borderLight}`,
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "all 0.2s ease",
                  }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: `${healthColor}12`,
                    border: `2px solid ${healthColor}30`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: healthColor,
                  }}>
                    {eq.health}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{eq.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{eq.model} — {eq.location} — {eq.hours.toLocaleString()} hrs</div>
                  </div>
                  {eq.health < 60 && (
                    <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: "rgba(192,57,43,0.08)", color: C.danger }}>ATTENTION</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedEquipment && (
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
            {/* Symptom input */}
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
              Describe the problem
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input type="text" value={symptom} onChange={e => setSymptom(e.target.value)}
                placeholder="e.g. 'Making a grinding noise when starting up'"
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.borderLight}`,
                  background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none",
                }}
              />
              <button onClick={voice.isRecording ? voice.stopRecording : voice.startRecording}
                style={{
                  width: 44, height: 44, borderRadius: 10, border: `1px solid ${voice.isRecording ? C.danger : C.borderLight}`,
                  background: voice.isRecording ? "rgba(192,57,43,0.08)" : C.surface,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: voice.isRecording ? C.danger : C.textMuted, animation: voice.isRecording ? "pulse 1s infinite" : "none" }} />
              </button>
            </div>
            {voice.transcript && <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", marginBottom: 12 }}>Voice: "{voice.transcript}"</div>}

            {/* Photo option */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {image.preview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={image.preview} alt="Equipment photo" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: `1px solid ${C.borderLight}` }} />
                  <button onClick={image.clear} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.danger, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                </div>
              ) : (
                <button onClick={() => image.captureImage({ camera: true })}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.borderLight}`, background: C.surface, color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  Add Photo (optional)
                </button>
              )}
            </div>

            <button onClick={diagnose} disabled={diagnosing || (!symptomText.trim() && !image.contentBlock)}
              style={{
                padding: "14px 32px", borderRadius: 12, border: "none",
                background: (diagnosing || (!symptomText.trim() && !image.contentBlock)) ? C.border : `linear-gradient(135deg, ${C.gold} 0%, #d4a843 100%)`,
                color: (diagnosing || (!symptomText.trim() && !image.contentBlock)) ? C.textMuted : "#fff",
                fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: (!diagnosing && (symptomText.trim() || image.contentBlock)) ? `0 4px 16px ${C.goldGlow}` : "none",
              }}>
              {diagnosing ? (
                <><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Diagnosing...</>
              ) : "Diagnose Issue"}
            </button>
          </div>
        )}

        {error && <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: C.danger, fontSize: 13, marginBottom: 24 }}>{error}</div>}

        {/* Diagnosis result */}
        {diagnosis && (
          <div ref={resultRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <div style={{
              background: `${sevColor}08`, border: `2px solid ${sevColor}30`,
              borderRadius: 16, padding: "24px 28px", textAlign: "center",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: sevColor, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                {diagnosis.severity} — {diagnosis.urgency}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.5 }}>{diagnosis.diagnosis}</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>
                Confidence: {diagnosis.confidence} — Est. downtime: {diagnosis.estimated_downtime} — Cost: {diagnosis.estimated_cost}
              </div>
            </div>

            {/* Root cause + history match */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.borderLight}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Root Cause</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{diagnosis.root_cause}</div>
              </div>
              {diagnosis.history_match && (
                <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.borderLight}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>History Pattern</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{diagnosis.history_match}</div>
                </div>
              )}
            </div>

            {/* Veteran tip */}
            {diagnosis.veteran_tip && (
              <div style={{ background: C.goldLight, border: `1px solid rgba(196,155,42,0.25)`, borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Veteran Tip</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{diagnosis.veteran_tip}</div>
              </div>
            )}

            {/* Repair steps */}
            {diagnosis.repair_steps && (
              <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.borderLight}`, padding: "20px 22px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.forest, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 4, height: 20, background: C.gold, borderRadius: 2, display: "inline-block" }} />
                  Repair Steps
                  {diagnosis.can_operator_fix && <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: "rgba(74,101,64,0.08)", color: C.green }}>Operator Can Fix</span>}
                </div>
                {diagnosis.repair_steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < diagnosis.repair_steps.length - 1 ? 12 : 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.goldLight, border: `1px solid rgba(196,155,42,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
                      {step.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{step.action}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                        {step.time_estimate} — {step.skill_level}
                        {step.parts_needed && step.parts_needed !== "null" && <> — Parts: <strong>{step.parts_needed}</strong></>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Safety warnings */}
            {diagnosis.safety_warnings?.length > 0 && (
              <div style={{ background: "rgba(192,57,43,0.06)", border: `1px solid rgba(192,57,43,0.15)`, borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.danger, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Safety Warnings</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: C.text }}>
                  {diagnosis.safety_warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {/* Prevention */}
            {diagnosis.prevention && (
              <div style={{ background: "rgba(74,101,64,0.06)", border: `1px solid rgba(74,101,64,0.15)`, borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Prevention</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{diagnosis.prevention}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

export default function EquipmentWhispererPage() {
  return (
    <Suspense>
      <EquipmentWhispererInner />
    </Suspense>
  );
}
