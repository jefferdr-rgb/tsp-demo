"use client";
import { useState, useRef, useCallback } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

// Aflatoxin scenario timeline — based on real Sunshine Mills FDA history (2019/2022/2023)
const SCENARIO_STEPS = [
  {
    id: "trigger",
    title: "1. Incident Trigger",
    subtitle: "QC Lab flags elevated aflatoxin levels",
    icon: "🚨",
    status: "active",
    content: {
      alert: "CRITICAL: Batch 2026-0317-B — Corn lot #CL-4892 testing at 22 ppb aflatoxin B1. FDA action level is 20 ppb for finished product.",
      context: "Sunshine Mills has received FDA warning letters in 2019, 2022, and 2023 for aflatoxin contamination in pet food products. This is a high-stakes regulatory scenario.",
      autoActions: [
        "Production Line A HALTED automatically",
        "Batch 2026-0317-B flagged for HOLD — cannot ship",
        "All products using corn lot #CL-4892 identified (3 batches, 2 product lines)",
        "QC Manager and Plant Manager notified via RHONDA alert",
        "FDA Reportable Event timer started (24-hour window)",
      ],
    },
  },
  {
    id: "trace",
    title: "2. Batch Traceability",
    subtitle: "RHONDA traces every affected product in seconds",
    icon: "🔍",
    status: "pending",
    content: {
      traceback: {
        cornLot: "CL-4892",
        supplier: "Midwest Grain Corp — Decatur, IL",
        received: "March 14, 2026",
        receivingInspection: "Visual: PASS, Moisture: 13.2% (spec <14%), Aflatoxin screen: <10 ppb (PASS at receiving)",
        note: "Aflatoxin can develop post-harvest in storage. Receiving test was clean.",
      },
      affectedBatches: [
        { batch: "2026-0317-B", product: "Hunter's Special 40lb", qty: "12,400 lbs", status: "IN PRODUCTION — HOLD", location: "Line A" },
        { batch: "2026-0316-A", product: "Sportsman's Pride 30lb", qty: "28,600 lbs", status: "IN WAREHOUSE — HOLD", location: "Warehouse Bay 3" },
        { batch: "2026-0315-C", product: "Evolve Classic 15lb", qty: "8,200 lbs", status: "SHIPPED — TRACE", location: "Shipped to 4 distributors" },
      ],
      distributors: [
        { name: "Southeast Pet Supply", shipped: "March 16", qty: "2,400 lbs", contact: "Jim Henderson — 205-555-0147" },
        { name: "Valley Feed Co", shipped: "March 16", qty: "2,800 lbs", contact: "Karen Walsh — 615-555-0293" },
        { name: "PetSmart DC #7", shipped: "March 15", qty: "1,800 lbs", contact: "Distribution — 800-555-0388" },
        { name: "Chewy FC Nashville", shipped: "March 15", qty: "1,200 lbs", contact: "Vendor Portal — case required" },
      ],
    },
  },
  {
    id: "hold",
    title: "3. Hold & Containment",
    subtitle: "Automated hold protocols activated",
    icon: "🛑",
    status: "pending",
    content: {
      holdActions: [
        { action: "Batch 2026-0317-B — physical hold tags applied, moved to quarantine area", status: "done", time: "2 min" },
        { action: "Batch 2026-0316-A — warehouse team notified, pallets segregated", status: "done", time: "8 min" },
        { action: "Batch 2026-0315-C — distributor recall notifications drafted", status: "ready", time: "Awaiting approval" },
        { action: "Corn lot CL-4892 remaining inventory — quarantined in ingredient storage", status: "done", time: "5 min" },
        { action: "Line A deep clean scheduled — allergen changeover protocol adapted for mycotoxin", status: "scheduled", time: "Next shift" },
      ],
      recallScope: "Level II — Products may have reached retail. 49,200 lbs total across 3 batches. 8,200 lbs already shipped to 4 distributors.",
    },
  },
  {
    id: "fda",
    title: "4. FDA Documentation Package",
    subtitle: "RHONDA generates complete regulatory package",
    icon: "📄",
    status: "pending",
    content: {
      documents: [
        { name: "FDA Reportable Food Report (RFR)", desc: "21 CFR Part 1, Subpart C — submitted within 24 hours", status: "draft-ready" },
        { name: "Batch Traceability Report", desc: "Complete ingredient-to-distribution chain for all 3 batches", status: "generated" },
        { name: "Corrective Action Plan (CAP)", desc: "Root cause, containment, corrective actions, preventive measures", status: "draft-ready" },
        { name: "Supplier Communication", desc: "Formal notification to Midwest Grain Corp with test results and hold request", status: "draft-ready" },
        { name: "Distributor Recall Notification", desc: "Individual letters to 4 distributors with affected lot numbers and return instructions", status: "draft-ready" },
        { name: "Consumer Communication Template", desc: "If product reached retail — press release and consumer hotline script", status: "template" },
        { name: "Internal Investigation Report", desc: "Timeline, root cause analysis, personnel involved, decisions made", status: "auto-generating" },
      ],
      timeline: "All documents ready for review within 2 hours of initial alert. FDA RFR must be submitted within 24 hours.",
    },
  },
  {
    id: "resolve",
    title: "5. Resolution & Prevention",
    subtitle: "Close the loop — learn from the incident",
    icon: "✅",
    status: "pending",
    content: {
      resolution: [
        "Confirmatory testing sent to external lab (results in 48-72 hours)",
        "If confirmed: execute recall per documented plan",
        "If false positive: release holds, document decision rationale",
        "Root cause investigation: storage conditions, supplier audit, receiving test sensitivity",
      ],
      prevention: [
        "Increase receiving aflatoxin screen frequency: every lot (was every 3rd lot)",
        "Add real-time temperature/humidity monitoring to corn storage",
        "Establish secondary supplier for corn to reduce single-source risk",
        "Quarterly aflatoxin awareness training added to all QC staff",
        "Update RHONDA's compliance alerts to trigger at 15 ppb (early warning before 20 ppb action level)",
      ],
      metrics: {
        responseTime: "12 minutes from detection to full containment",
        documentsGenerated: 7,
        batchesTraced: 3,
        distributorsNotified: 4,
        regulatoryDeadline: "FDA RFR due by March 18, 2026 3:47 PM",
      },
    },
  },
];

export default function AflatoxinResponsePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set([0]));
  const stepRef = useRef(null);

  const advanceStep = useCallback((nextIdx) => {
    setCompletedSteps(prev => new Set([...prev, nextIdx]));
    setActiveStep(nextIdx);
    setTimeout(() => stepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  }, []);

  const step = SCENARIO_STEPS[activeStep];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.danger, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>!</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Rapid Response — Aflatoxin Scenario</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.danger, margin: 0 }}>Aflatoxin Rapid Response</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6, maxWidth: 600, margin: "6px auto 0" }}>
            Live scenario: elevated aflatoxin detected in incoming corn. Watch RHONDA chain incident report → batch trace → hold alert → FDA documentation in real time.
          </p>
        </div>

        {/* Context banner */}
        <div style={{
          padding: "14px 20px", borderRadius: 12, marginBottom: 28, fontSize: 12, lineHeight: 1.6, color: C.text,
          background: "rgba(192,57,43,0.06)", border: `1px solid rgba(192,57,43,0.15)`,
        }}>
          <strong style={{ color: C.danger }}>Context:</strong> Sunshine Mills received FDA warning letters for aflatoxin contamination in 2019, 2022, and 2023. This scenario demonstrates how RHONDA would handle a recurrence — transforming a multi-day scramble into a 12-minute automated response.
        </div>

        {/* Progress steps */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          {SCENARIO_STEPS.map((s, i) => (
            <div key={s.id} onClick={() => completedSteps.has(i) && setActiveStep(i)}
              style={{
                flex: 1, height: 6, borderRadius: 3, cursor: completedSteps.has(i) ? "pointer" : "default",
                background: i === activeStep ? C.gold : completedSteps.has(i) ? C.green : C.borderLight,
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Step navigation */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto" }}>
          {SCENARIO_STEPS.map((s, i) => (
            <button key={s.id} onClick={() => completedSteps.has(i) && setActiveStep(i)}
              style={{
                padding: "8px 14px", borderRadius: 10, border: `1px solid ${i === activeStep ? C.gold : completedSteps.has(i) ? C.green + "40" : C.borderLight}`,
                background: i === activeStep ? C.goldLight : completedSteps.has(i) ? "rgba(74,101,64,0.06)" : C.surface,
                color: i === activeStep ? C.gold : completedSteps.has(i) ? C.green : C.textMuted,
                fontSize: 12, fontWeight: 600, cursor: completedSteps.has(i) ? "pointer" : "default",
                fontFamily: "inherit", whiteSpace: "nowrap", opacity: completedSteps.has(i) ? 1 : 0.5,
              }}>
              {s.icon} {s.title.split(". ")[1]}
            </button>
          ))}
        </div>

        {/* Active step content */}
        <div ref={stepRef} style={{
          background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28,
          animation: "fadeIn 0.4s ease",
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.forest }}>{step.icon} {step.title}</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>{step.subtitle}</div>
          </div>

          {/* Step 1: Trigger */}
          {activeStep === 0 && (
            <div>
              <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(192,57,43,0.08)", border: `2px solid rgba(192,57,43,0.2)`, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.danger, marginBottom: 6 }}>ALERT</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: C.text }}>{step.content.alert}</div>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: C.textMuted, marginBottom: 16 }}>{step.content.context}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.forest, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Automatic Actions</div>
              {step.content.autoActions.map((a, i) => (
                <div key={i} style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(74,101,64,0.06)", borderLeft: `3px solid ${C.green}`, marginBottom: 6, fontSize: 13, color: C.text }}>
                  ✓ {a}
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Trace */}
          {activeStep === 1 && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Ingredient Traceback</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {Object.entries(step.content.traceback).filter(([k]) => k !== "note").map(([key, val]) => (
                    <div key={key} style={{ padding: "10px 14px", borderRadius: 8, background: C.bg }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 2 }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>{step.content.traceback.note}</div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: C.danger, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Affected Batches</div>
              {step.content.affectedBatches.map((b, i) => (
                <div key={i} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(192,57,43,0.04)", border: `1px solid rgba(192,57,43,0.12)`, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{b.batch} — {b.product}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{b.qty} — {b.location}</div>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: b.status.includes("SHIPPED") ? "rgba(192,57,43,0.12)" : "rgba(230,160,30,0.12)", color: b.status.includes("SHIPPED") ? C.danger : "#b87a00" }}>
                    {b.status}
                  </span>
                </div>
              ))}

              <div style={{ fontSize: 12, fontWeight: 700, color: C.forest, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16 }}>Shipped Product — Distributor Trace</div>
              {step.content.distributors.map((d, i) => (
                <div key={i} style={{ padding: "10px 14px", borderRadius: 8, background: C.bg, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>Shipped {d.shipped} — {d.qty}</div>
                  </div>
                  <span style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>{d.contact}</span>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Hold */}
          {activeStep === 2 && (
            <div>
              {step.content.holdActions.map((a, i) => (
                <div key={i} style={{
                  padding: "12px 16px", borderRadius: 10, marginBottom: 8,
                  background: a.status === "done" ? "rgba(74,101,64,0.06)" : a.status === "ready" ? "rgba(230,160,30,0.06)" : C.bg,
                  borderLeft: `4px solid ${a.status === "done" ? C.green : a.status === "ready" ? "#b87a00" : C.textMuted}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ fontSize: 13, color: C.text, flex: 1 }}>{a.action}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: C.textMuted }}>{a.time}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: a.status === "done" ? "rgba(74,101,64,0.12)" : "rgba(230,160,30,0.12)", color: a.status === "done" ? C.green : "#b87a00" }}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 10, background: "rgba(192,57,43,0.06)", border: `1px solid rgba(192,57,43,0.15)` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.danger, marginBottom: 4 }}>Recall Scope Assessment</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{step.content.recallScope}</div>
              </div>
            </div>
          )}

          {/* Step 4: FDA Docs */}
          {activeStep === 3 && (
            <div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>{step.content.timeline}</div>
              {step.content.documents.map((doc, i) => (
                <div key={i} style={{
                  padding: "14px 18px", borderRadius: 10, marginBottom: 8,
                  background: C.surface, border: `1px solid ${C.borderLight}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{doc.desc}</div>
                  </div>
                  <span style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    background: doc.status === "generated" ? "rgba(74,101,64,0.08)" : doc.status === "draft-ready" ? "rgba(196,155,42,0.12)" : "rgba(100,149,237,0.08)",
                    color: doc.status === "generated" ? C.green : doc.status === "draft-ready" ? C.gold : "#6495ED",
                  }}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Resolution */}
          {activeStep === 4 && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.forest, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Next Steps</div>
                {step.content.resolution.map((r, i) => (
                  <div key={i} style={{ padding: "8px 14px", borderRadius: 8, background: C.bg, marginBottom: 6, fontSize: 13, color: C.text, borderLeft: `3px solid ${C.gold}` }}>
                    {r}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Preventive Measures</div>
                {step.content.prevention.map((p, i) => (
                  <div key={i} style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(74,101,64,0.06)", marginBottom: 6, fontSize: 13, color: C.text, borderLeft: `3px solid ${C.green}` }}>
                    {p}
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {Object.entries(step.content.metrics).map(([key, val]) => (
                  <div key={key} style={{ padding: "12px 14px", borderRadius: 10, background: C.bg, textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.forest, marginTop: 4 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button onClick={() => activeStep > 0 && advanceStep(activeStep - 1)} disabled={activeStep === 0}
              style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: activeStep === 0 ? C.borderLight : C.textMuted, fontSize: 13, fontWeight: 600, cursor: activeStep === 0 ? "default" : "pointer", fontFamily: "inherit" }}>
              Previous
            </button>
            {activeStep < SCENARIO_STEPS.length - 1 ? (
              <button onClick={() => advanceStep(activeStep + 1)}
                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.gold} 0%, #d4a843 100%)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 12px ${C.goldGlow}` }}>
                Next Step →
              </button>
            ) : (
              <div style={{ padding: "10px 24px", borderRadius: 10, background: "rgba(74,101,64,0.08)", color: C.green, fontSize: 13, fontWeight: 700 }}>
                ✓ Response Complete — 12 minutes
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
