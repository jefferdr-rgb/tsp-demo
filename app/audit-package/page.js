"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

const AUDIT_SECTIONS = [
  {
    id: "food-safety",
    title: "Food Safety Plan (FSMA)",
    icon: "🍽️",
    regulation: "21 CFR Part 117 — Current Good Manufacturing Practice, Hazard Analysis, and Risk-Based Preventive Controls",
    status: "complete",
    completeness: 94,
    documents: [
      { name: "Hazard Analysis Summary", status: "current", lastUpdated: "2026-03-10", pages: 12 },
      { name: "Preventive Controls Plan", status: "current", lastUpdated: "2026-03-01", pages: 8 },
      { name: "Supply Chain Program", status: "needs-review", lastUpdated: "2025-12-15", pages: 6 },
      { name: "Recall Plan", status: "current", lastUpdated: "2026-03-15", pages: 4 },
      { name: "Allergen Control Program", status: "current", lastUpdated: "2026-02-20", pages: 5 },
    ],
  },
  {
    id: "gmp",
    title: "Good Manufacturing Practices",
    icon: "🏭",
    regulation: "21 CFR Part 117, Subpart B — GMP Requirements",
    status: "needs-attention",
    completeness: 78,
    documents: [
      { name: "Personnel Hygiene Program", status: "current", lastUpdated: "2026-03-05", pages: 3 },
      { name: "Pest Control Program", status: "current", lastUpdated: "2026-03-12", pages: 4 },
      { name: "Equipment Maintenance Log", status: "current", lastUpdated: "2026-03-17", pages: 18 },
      { name: "Sanitation SOPs", status: "needs-review", lastUpdated: "2025-11-20", pages: 9 },
      { name: "Water Quality Testing", status: "overdue", lastUpdated: "2025-09-30", pages: 3 },
    ],
  },
  {
    id: "osha",
    title: "OSHA Safety Records",
    icon: "🛡️",
    regulation: "29 CFR 1910 — General Industry Standards",
    status: "complete",
    completeness: 91,
    documents: [
      { name: "OSHA 300 Log (2026 YTD)", status: "current", lastUpdated: "2026-03-17", pages: 2 },
      { name: "Safety Training Records", status: "current", lastUpdated: "2026-03-14", pages: 14 },
      { name: "Incident Investigation Reports", status: "current", lastUpdated: "2026-03-16", pages: 8 },
      { name: "PPE Assessment", status: "current", lastUpdated: "2026-02-28", pages: 5 },
      { name: "Hazard Communication Program", status: "needs-review", lastUpdated: "2025-12-01", pages: 6 },
      { name: "Lockout/Tagout Procedures", status: "current", lastUpdated: "2026-01-15", pages: 7 },
    ],
  },
  {
    id: "quality",
    title: "Quality Assurance Records",
    icon: "📊",
    regulation: "AAFCO Model Bill — Pet Food Regulations",
    status: "complete",
    completeness: 96,
    documents: [
      { name: "Guaranteed Analysis Testing", status: "current", lastUpdated: "2026-03-15", pages: 6 },
      { name: "Aflatoxin Testing Log", status: "current", lastUpdated: "2026-03-17", pages: 4 },
      { name: "Label Compliance Review", status: "current", lastUpdated: "2026-03-10", pages: 3 },
      { name: "Finished Product Specs", status: "current", lastUpdated: "2026-03-01", pages: 8 },
      { name: "Certificate of Analysis (CoA) Archive", status: "current", lastUpdated: "2026-03-16", pages: 22 },
    ],
  },
  {
    id: "environmental",
    title: "Environmental Compliance",
    icon: "🌿",
    regulation: "EPA Regulations — Clean Air Act, Clean Water Act, RCRA",
    status: "needs-attention",
    completeness: 72,
    documents: [
      { name: "Wastewater Discharge Permits", status: "current", lastUpdated: "2026-01-15", pages: 3 },
      { name: "Air Emissions Records", status: "needs-review", lastUpdated: "2025-10-20", pages: 4 },
      { name: "Waste Manifests (Hazardous)", status: "overdue", lastUpdated: "2025-08-15", pages: 6 },
      { name: "Stormwater Pollution Prevention", status: "current", lastUpdated: "2026-02-01", pages: 5 },
    ],
  },
  {
    id: "training",
    title: "Training & Certification",
    icon: "📚",
    regulation: "Various — OSHA, FSMA, HAZWOPER",
    status: "complete",
    completeness: 88,
    documents: [
      { name: "PCQI Certification Records", status: "current", lastUpdated: "2026-03-01", pages: 2 },
      { name: "Forklift Certification Log", status: "current", lastUpdated: "2026-03-10", pages: 3 },
      { name: "Annual Safety Training Roster", status: "current", lastUpdated: "2026-03-14", pages: 5 },
      { name: "New Hire Orientation Checklist", status: "current", lastUpdated: "2026-03-16", pages: 2 },
      { name: "HAZWOPER Training Records", status: "needs-review", lastUpdated: "2025-12-20", pages: 4 },
    ],
  },
];

const STATUS_STYLES = {
  current: { bg: "rgba(74,101,64,0.06)", color: C.green, label: "Current" },
  "needs-review": { bg: "rgba(230,160,30,0.06)", color: "#b87a00", label: "Needs Review" },
  overdue: { bg: "rgba(192,57,43,0.06)", color: C.danger, label: "Overdue" },
};

export default function AuditPackagePage() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const totalDocs = AUDIT_SECTIONS.flatMap(s => s.documents).length;
  const currentDocs = AUDIT_SECTIONS.flatMap(s => s.documents).filter(d => d.status === "current").length;
  const overdueDocs = AUDIT_SECTIONS.flatMap(s => s.documents).filter(d => d.status === "overdue").length;
  const totalPages = AUDIT_SECTIONS.flatMap(s => s.documents).reduce((sum, d) => sum + d.pages, 0);
  const avgCompleteness = Math.round(AUDIT_SECTIONS.reduce((sum, s) => sum + s.completeness, 0) / AUDIT_SECTIONS.length);

  const generatePackage = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Compliance Audit Package</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Compliance Audit Package</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>One click generates your complete FDA-ready documentation bundle.</p>
        </div>

        {/* Readiness dashboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Audit Ready", value: `${avgCompleteness}%`, color: avgCompleteness >= 85 ? C.green : "#b87a00" },
            { label: "Documents", value: totalDocs, color: C.forest },
            { label: "Current", value: currentDocs, color: C.green },
            { label: "Overdue", value: overdueDocs, color: overdueDocs > 0 ? C.danger : C.green },
            { label: "Total Pages", value: totalPages, color: C.forest },
          ].map((card, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 12, padding: "14px 10px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Generate button */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <button onClick={generatePackage} disabled={generating || generated}
            style={{
              padding: "16px 48px", borderRadius: 14, border: "none",
              background: generated ? C.green : generating ? C.border : `linear-gradient(135deg, ${C.gold} 0%, #d4a843 100%)`,
              color: generating ? C.textMuted : "#fff",
              fontSize: 18, fontWeight: 700, cursor: (generating || generated) ? "default" : "pointer", fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", gap: 12,
              boxShadow: !generating && !generated ? `0 4px 20px ${C.goldGlow}` : "none",
              transition: "all 0.3s ease",
            }}>
            {generated ? (
              <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Package Generated — Ready to Download</>
            ) : generating ? (
              <><span style={{ display: "inline-block", width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Compiling {totalPages} pages across {AUDIT_SECTIONS.length} categories...</>
            ) : (
              <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>Generate Full Audit Package</>
            )}
          </button>
          {generated && (
            <div style={{ marginTop: 12, fontSize: 12, color: C.green }}>
              {totalPages} pages compiled into a single FDA-ready PDF. In production, this downloads as a zip with individual category folders.
            </div>
          )}
        </div>

        {/* Section cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AUDIT_SECTIONS.map(section => {
            const isExpanded = expandedSection === section.id;
            const compColor = section.completeness >= 90 ? C.green : section.completeness >= 75 ? "#b87a00" : C.danger;
            return (
              <div key={section.id}>
                <div onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  style={{
                    background: C.surface, borderRadius: isExpanded ? "14px 14px 0 0" : 14,
                    border: `1px solid ${isExpanded ? C.gold : C.borderLight}`,
                    borderBottom: isExpanded ? "none" : undefined,
                    padding: "16px 20px", cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 24 }}>{section.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.forest }}>{section.title}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{section.regulation}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: compColor }}>{section.completeness}%</div>
                      <div style={{ width: 60, height: 4, borderRadius: 2, background: `${compColor}20`, marginTop: 4 }}>
                        <div style={{ width: `${section.completeness}%`, height: "100%", borderRadius: 2, background: compColor, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", marginLeft: 8 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    background: C.surface, borderRadius: "0 0 14px 14px",
                    borderLeft: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}`, borderBottom: `1px solid ${C.gold}`,
                    padding: "0 20px 20px",
                  }}>
                    <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 16 }}>
                      {section.documents.map((doc, i) => {
                        const st = STATUS_STYLES[doc.status] || STATUS_STYLES.current;
                        return (
                          <div key={i} style={{
                            padding: "10px 14px", borderRadius: 8, marginBottom: 6,
                            background: st.bg, display: "flex", justifyContent: "space-between", alignItems: "center",
                          }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{doc.name}</div>
                              <div style={{ fontSize: 11, color: C.textMuted }}>Updated {doc.lastUpdated} — {doc.pages} pages</div>
                            </div>
                            <span style={{
                              padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                              color: st.color, textTransform: "uppercase",
                            }}>
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          RHONDA continuously monitors document freshness and flags items approaching their review dates.<br />
          Typical audit prep time: 2-3 weeks manually → 1 click with RHONDA.
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
