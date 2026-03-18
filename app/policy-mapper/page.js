"use client";
import { useState, useRef } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
};

// COA standard areas for mapping
const COA_STANDARDS = [
  { code: "GOV", name: "Governance", count: 8 },
  { code: "HR", name: "Human Resources", count: 8 },
  { code: "FIN", name: "Financial Management", count: 5 },
  { code: "PQI", name: "Performance & Quality Improvement", count: 8 },
  { code: "RPM", name: "Risk Prevention & Management", count: 6 },
  { code: "RTX", name: "Residential Treatment", count: 10 },
];

// Demo policies with pre-mapped standards
const DEMO_POLICIES = [
  {
    name: "Employee Handbook (2024)", uploadDate: "Feb 2026", pages: 42,
    mappings: [
      { standard: "HR 1", name: "Recruitment & Selection", strength: "strong", excerpt: "Section 3.1 covers hiring procedures, background check requirements, and minimum qualifications for all positions." },
      { standard: "HR 2", name: "Background Checks", strength: "strong", excerpt: "Section 3.2 details CBC, sex offender registry, and child abuse registry checks required prior to employment." },
      { standard: "HR 3", name: "Staff Qualifications", strength: "partial", excerpt: "Qualifications listed for supervisors but not for direct care or relief staff." },
      { standard: "HR 6", name: "Performance Evaluation", strength: "strong", excerpt: "Section 7 describes annual evaluation process with 90-day probationary reviews." },
      { standard: "GOV 4", name: "Organizational Structure", strength: "partial", excerpt: "Org chart referenced but not included. Chain of command described in Section 1.4." },
    ],
    gaps: ["HR 4: Orientation & Training — no structured curriculum described", "HR 5: Supervision — monthly supervision requirements not addressed", "HR 8: Trauma-Informed Staff Support — no secondary trauma or self-care policies found"],
  },
  {
    name: "Emergency Preparedness Plan", uploadDate: "Jan 2026", pages: 18,
    mappings: [
      { standard: "RPM 1", name: "Emergency Preparedness", strength: "strong", excerpt: "Comprehensive plan covering fire, weather, medical emergency, active threat, and utility failure scenarios." },
      { standard: "RPM 3", name: "Safety Protocols", strength: "strong", excerpt: "Evacuation routes, assembly points, head count procedures, and communication chain documented." },
      { standard: "RPM 5", name: "Environmental Safety", strength: "partial", excerpt: "Building safety addressed but no annual environmental safety audit schedule documented." },
    ],
    gaps: ["RPM 2: Incident Reporting — referenced but actual reporting form/process not included", "RPM 4: Critical Incident Review — no post-incident debrief process described"],
  },
  {
    name: "Board Governance Manual", uploadDate: "Mar 2026", pages: 24,
    mappings: [
      { standard: "GOV 1", name: "Board Structure & Composition", strength: "strong", excerpt: "Articles define board size (7-15 members), term limits, officer roles, and committee structure." },
      { standard: "GOV 2", name: "Board Responsibilities & Oversight", strength: "strong", excerpt: "Fiduciary duties, meeting frequency (monthly), quorum requirements, and voting procedures detailed." },
      { standard: "GOV 5", name: "Conflict of Interest Policies", strength: "strong", excerpt: "Annual COI disclosure form, recusal procedures, and related party transaction review process included." },
      { standard: "GOV 7", name: "CEO Evaluation", strength: "partial", excerpt: "Annual evaluation referenced in Section 4.2 but evaluation criteria and tool not included." },
    ],
    gaps: ["GOV 3: Strategic Planning — no strategic plan or planning process described", "GOV 6: DEI Infrastructure — no diversity, equity, or inclusion policies found", "GOV 8: Stakeholder Input — no mechanism for family or youth voice at board level"],
  },
  {
    name: "Treatment Program Description", uploadDate: "Feb 2026", pages: 31,
    mappings: [
      { standard: "RTX 1", name: "Trauma-Informed Treatment Model", strength: "strong", excerpt: "TF-CBT model described with staff training requirements, supervision integration, and fidelity monitoring." },
      { standard: "RTX 2", name: "Individualized Service Plans", strength: "strong", excerpt: "30-day assessment → ISP development → 90-day review cycle documented with required participants." },
      { standard: "RTX 4", name: "Noncoercive Environment", strength: "strong", excerpt: "Positive behavior support framework with token economy, privilege levels, and de-escalation-first approach." },
      { standard: "RTX 5", name: "Restraint Reduction", strength: "strong", excerpt: "Restraint as last resort policy, approved techniques, mandatory debriefing, and quarterly trend review." },
      { standard: "RTX 7", name: "Youth Skill Development", strength: "partial", excerpt: "Life skills curriculum mentioned but no specific skill assessment or progress tracking tool described." },
    ],
    gaps: ["RTX 3: Family Engagement — family involvement mentioned but no structured engagement plan", "RTX 6: Discharge Planning — transition planning referenced but aftercare tracking not addressed", "RTX 8: Education Support — no education partnership or IEP coordination process", "RTX 10: Transition & Aftercare — no post-discharge follow-up system described"],
  },
];

export default function PolicyMapperPage() {
  const [policies] = useState(DEMO_POLICIES);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef(null);

  const totalMappings = policies.reduce((s, p) => s + p.mappings.length, 0);
  const strongMappings = policies.reduce((s, p) => s + p.mappings.filter(m => m.strength === "strong").length, 0);
  const totalGaps = policies.reduce((s, p) => s + p.gaps.length, 0);
  const totalStandards = COA_STANDARDS.reduce((s, st) => s + st.count, 0);

  // Which standards are covered across all policies
  const coveredStandards = new Set(policies.flatMap(p => p.mappings.map(m => m.standard)));
  const standardCoverage = COA_STANDARDS.map(s => {
    const covered = Array.from(coveredStandards).filter(cs => cs.startsWith(s.code)).length;
    return { ...s, covered };
  });

  function handleUpload() {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 3000);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Policy Mapper</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,119,187,0.15)", color: "#7FB3E0", fontSize: 11, fontWeight: 700 }}>COA Standard Alignment</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Policies Analyzed", value: policies.length, color: C.accent },
            { label: "Standards Mapped", value: `${coveredStandards.size}/${totalStandards}`, color: coveredStandards.size > 30 ? C.green : C.orange },
            { label: "Strong Matches", value: strongMappings, color: C.green },
            { label: "Gaps Found", value: totalGaps, color: totalGaps > 0 ? C.red : C.green },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Upload bar */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Upload a Policy Document</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>RHONDA will read your policy and map every section to COA standards — highlighting what's covered and what's missing.</div>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: "none" }} onChange={handleUpload} />
          <button onClick={() => fileRef.current?.click()}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
            {analyzing ? "Analyzing..." : "Upload Policy"}
          </button>
        </div>

        {analyzing && (
          <div style={{ background: C.accentLight, borderRadius: 12, border: `1px solid ${C.accent}`, padding: 20, marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 8 }}>Analyzing document against COA standards...</div>
            <div style={{ width: "100%", height: 6, borderRadius: 3, background: C.borderLight, overflow: "hidden" }}>
              <div style={{ width: "60%", height: "100%", borderRadius: 3, background: C.accent, animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>Reading sections... matching to standards... identifying gaps...</div>
          </div>
        )}

        {/* Coverage heat map */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: C.text }}>Standard Coverage Map</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {standardCoverage.map(s => {
              const pct = Math.round((s.covered / s.count) * 100);
              return (
                <div key={s.code} style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.borderLight}`, background: pct > 60 ? "rgba(34,197,94,0.04)" : pct > 30 ? "rgba(245,158,11,0.04)" : "rgba(197,48,48,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.code}</span>
                      <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: pct > 60 ? C.green : pct > 30 ? C.orange : C.red }}>{pct}%</span>
                  </div>
                  <div style={{ width: "100%", height: 5, borderRadius: 3, background: C.borderLight }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: pct > 60 ? C.green : pct > 30 ? C.orange : C.red }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{s.covered} of {s.count} criteria addressed by uploaded policies</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Policy cards */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12 }}>Analyzed Policies</h2>
        <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
          {policies.map((p, i) => {
            const isOpen = selectedPolicy === i;
            return (
              <div key={i} style={{ background: C.surface, borderRadius: 12, border: `1.5px solid ${isOpen ? C.accent : C.border}`, overflow: "hidden" }}>
                <div onClick={() => setSelectedPolicy(isOpen ? null : i)}
                  style={{ padding: 20, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{p.pages} pages &middot; Uploaded {p.uploadDate}</div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{p.mappings.length} mapped</span>
                      <span style={{ color: C.textMuted, margin: "0 6px" }}>&middot;</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{p.gaps.length} gaps</span>
                    </div>
                    <span style={{ fontSize: 18, color: C.textMuted, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>&#9662;</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: 20 }}>
                    <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: C.accent }}>Mapped Standards</h3>
                    {p.mappings.map((m, j) => (
                      <div key={j} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, flexShrink: 0, height: "fit-content",
                          background: m.strength === "strong" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                          color: m.strength === "strong" ? C.green : C.orange,
                        }}>
                          {m.strength === "strong" ? "Strong" : "Partial"}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.standard}: {m.name}</div>
                          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4, lineHeight: 1.5 }}>{m.excerpt}</div>
                        </div>
                      </div>
                    ))}

                    <h3 style={{ margin: "20px 0 12px", fontSize: 14, fontWeight: 700, color: C.red }}>Gaps — Not Found in This Policy</h3>
                    {p.gaps.map((g, j) => (
                      <div key={j} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                        <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(197,48,48,0.08)", color: C.red, fontSize: 11, fontWeight: 700, flexShrink: 0, height: "fit-content" }}>Gap</span>
                        <div style={{ fontSize: 13, color: C.text }}>{g}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* All gaps summary */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.red }}>All Unmapped Standards — Policies Needed</h2>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>These COA standards have no supporting policy language in any uploaded document. Upload additional policies or draft new ones to close these gaps.</div>
          {policies.flatMap(p => p.gaps.map(g => {
            const code = g.split(":")[0].trim();
            const area = COA_STANDARDS.find(s => code.startsWith(s.code));
            return { gap: g, area: area?.code || "?", areaName: area?.name || "Unknown" };
          })).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
              <span style={{ padding: "2px 8px", borderRadius: 4, background: C.accentLight, color: C.accent, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{item.area}</span>
              <div style={{ fontSize: 13, color: C.text }}>{item.gap}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
