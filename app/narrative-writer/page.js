"use client";
import { useState, useRef } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2F2A", accent: "#2E7D6F",
  accentLight: "rgba(46,125,111,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
};

const STANDARD_SECTIONS = [
  { code: "GOV", name: "Governance", description: "Board structure, strategic planning, oversight, and organizational leadership" },
  { code: "HR", name: "Human Resources", description: "Recruitment, training, supervision, evaluation, and staff support" },
  { code: "FIN", name: "Financial Management", description: "Budgeting, controls, audits, insurance, and funding compliance" },
  { code: "PQI", name: "Performance & Quality Improvement", description: "Data collection, outcome measurement, improvement cycles, and annual reporting" },
  { code: "RPM", name: "Risk Prevention & Management", description: "Emergency preparedness, incident reporting, safety, and medication management" },
  { code: "RTX", name: "Residential Treatment", description: "Treatment model, service plans, family engagement, restraint reduction, and aftercare" },
];

// Demo narratives — these are what RHONDA would generate from uploaded docs
const DEMO_NARRATIVES = {
  GOV: {
    status: "draft",
    wordCount: 1840,
    lastEdited: "Mar 18, 2026",
    narrative: `Kings Home is governed by a volunteer Board of Directors comprising 7-15 members who bring diverse professional expertise including legal, financial, clinical, and community leadership backgrounds. The Board meets monthly with documented minutes, and maintains an active committee structure including Finance, Program, and Governance committees.

The organization's strategic direction is guided by a three-year strategic plan most recently adopted in 2024, with annual progress reviews conducted at the September board retreat. The CEO reports directly to the Board and undergoes a formal annual performance evaluation using a standardized instrument aligned with organizational goals.

A comprehensive Conflict of Interest policy requires annual disclosure by all board members and senior staff, with documented recusal procedures for any matter presenting a potential conflict. Related party transactions receive additional review through the Finance Committee.

AREAS REQUIRING ATTENTION: The Board has drafted but not yet formally adopted a Diversity, Equity, and Inclusion policy (GOV 6). Additionally, while the organization values input from families and youth served, there is no formalized mechanism for incorporating stakeholder voice into governance decisions (GOV 8). The PQI committee recommends implementing an annual stakeholder advisory meeting and including a family representative in program committee discussions.`,
    sources: ["Board Governance Manual (pp. 1-18)", "Board Meeting Minutes 2025 (12 meetings)", "Strategic Plan 2024-2027", "CEO Evaluation Template"],
  },
  HR: {
    status: "draft",
    wordCount: 2100,
    lastEdited: "Mar 18, 2026",
    narrative: `Kings Home employs approximately 45 staff members including 18 direct care workers, 6 supervisors, clinical staff, and administrative support. All positions have written job descriptions with minimum qualifications aligned to licensing requirements and best practice standards.

The recruitment process includes structured interviews, reference verification, and a comprehensive background screening package: criminal background check (CBC), sex offender registry, child abuse and neglect registry, and driving record review. All screenings are completed and documented prior to the start of employment with no exceptions.

New employees complete a structured orientation program within their first two weeks covering organizational mission, policies, emergency procedures, trauma-informed care principles, mandatory reporting obligations, and role-specific competencies. Ongoing professional development is tracked through the HR system with a minimum of 40 hours annually required for direct care staff.

Performance evaluations are conducted annually for all staff using a standardized instrument, with additional 90-day probationary reviews for new hires. Evaluation criteria align with job descriptions and organizational competencies.

AREAS REQUIRING ATTENTION: Documentation of monthly supervisory sessions is inconsistent — 3 of 6 supervisors have gaps in their supervision logs (HR 5). The organization does not yet have a documented secondary trauma prevention program for staff, despite the emotionally demanding nature of direct care work (HR 8). Recommendations include implementing a structured supervision log in RHONDA and developing a staff wellness program that addresses vicarious trauma, self-care planning, and access to confidential support.`,
    sources: ["Employee Handbook (2024)", "Background Check Policy", "Training Records Summary", "Performance Evaluation Templates"],
  },
  PQI: {
    status: "in-progress",
    wordCount: 890,
    lastEdited: "Mar 17, 2026",
    narrative: `Kings Home maintains a Performance and Quality Improvement (PQI) plan that identifies key outcome areas across youth permanency, educational achievement, behavioral safety, staff retention, and family engagement. The PQI committee, chaired by the Program Director, meets quarterly to review data and guide improvement efforts.

Data collection has historically relied on spreadsheet-based tracking, which limits the organization's ability to perform trend analysis and real-time monitoring. The implementation of RHONDA's PQI Dashboard represents a significant step toward systematizing data collection and reporting.

AREAS REQUIRING SIGNIFICANT DEVELOPMENT: [Additional narrative needed — outcome measurement framework, PDCA cycle documentation, stakeholder satisfaction surveys, data-driven decision making processes, annual PQI report...]`,
    sources: ["PQI Plan (2025)", "PQI Committee Meeting Notes"],
  },
  RPM: {
    status: "not-started",
    wordCount: 0,
    lastEdited: null,
    narrative: "",
    sources: [],
  },
  FIN: {
    status: "not-started",
    wordCount: 0,
    lastEdited: null,
    narrative: "",
    sources: [],
  },
  RTX: {
    status: "not-started",
    wordCount: 0,
    lastEdited: null,
    narrative: "",
    sources: [],
  },
};

const STATUS_LABELS = {
  draft: { label: "Draft Ready", color: C.green, bg: "rgba(34,197,94,0.1)" },
  "in-progress": { label: "In Progress", color: C.orange, bg: "rgba(245,158,11,0.1)" },
  "not-started": { label: "Not Started", color: C.red, bg: "rgba(197,48,48,0.08)" },
};

export default function NarrativeWriterPage() {
  const [narratives] = useState(DEMO_NARRATIVES);
  const [selectedSection, setSelectedSection] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const drafted = Object.values(narratives).filter(n => n.status === "draft").length;
  const inProgress = Object.values(narratives).filter(n => n.status === "in-progress").length;
  const notStarted = Object.values(narratives).filter(n => n.status === "not-started").length;
  const totalWords = Object.values(narratives).reduce((s, n) => s + n.wordCount, 0);

  function handleGenerate(code) {
    setGenerating(true);
    setSelectedSection(code);
    setTimeout(() => setGenerating(false), 3000);
  }

  const selected = selectedSection ? { ...STANDARD_SECTIONS.find(s => s.code === selectedSection), ...narratives[selectedSection] } : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Narrative Writer</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(196,155,42,0.15)", color: C.gold, fontSize: 11, fontWeight: 700 }}>Self-Study Narratives</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Sections Drafted", value: drafted, color: C.green },
            { label: "In Progress", value: inProgress, color: C.orange },
            { label: "Not Started", value: notStarted, color: notStarted > 0 ? C.red : C.green },
            { label: "Total Words", value: totalWords.toLocaleString(), color: C.accent },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{ background: C.accentLight, borderRadius: 12, border: `1px solid rgba(46,125,111,0.2)`, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 6 }}>How Narrative Writer Works</div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
            RHONDA reads your uploaded policies, procedures, and evidence documents — then drafts self-study narratives for each COA standard area.
            Each narrative describes how your organization meets the standards, cites specific documents as evidence, and flags areas needing attention.
            You review, edit, and approve. RHONDA writes the first draft so your team can focus on substance, not starting from a blank page.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "340px 1fr" : "1fr", gap: 20 }}>
          {/* Section list */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12 }}>Self-Study Sections</h2>
            {STANDARD_SECTIONS.map(sec => {
              const n = narratives[sec.code];
              const st = STATUS_LABELS[n.status];
              const isSelected = selectedSection === sec.code;
              return (
                <div key={sec.code} onClick={() => { setSelectedSection(sec.code); setEditMode(false); }}
                  style={{
                    background: C.surface, borderRadius: 10, border: `1.5px solid ${isSelected ? C.accent : C.border}`,
                    padding: 16, marginBottom: 10, cursor: "pointer", transition: "all 0.2s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{sec.code} — {sec.name}</div>
                    <span style={{ padding: "3px 10px", borderRadius: 6, background: st.bg, color: st.color, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{sec.description}</div>
                  {n.wordCount > 0 && (
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>
                      {n.wordCount.toLocaleString()} words &middot; Last edited {n.lastEdited}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>{selected.code} — {selected.name}</h2>
                  {selected.lastEdited && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Last edited {selected.lastEdited} &middot; {selected.wordCount.toLocaleString()} words</div>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {selected.status !== "not-started" && (
                    <button onClick={() => setEditMode(!editMode)}
                      style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: editMode ? C.accent : "transparent", color: editMode ? "#fff" : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {editMode ? "Preview" : "Edit"}
                    </button>
                  )}
                  <button onClick={() => handleGenerate(selected.code)}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {generating ? "Generating..." : selected.status === "not-started" ? "Generate Draft" : "Regenerate"}
                  </button>
                </div>
              </div>

              {generating && (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 12 }}>RHONDA is drafting your narrative...</div>
                  <div style={{ width: "100%", height: 6, borderRadius: 3, background: C.borderLight, overflow: "hidden" }}>
                    <div style={{ width: "45%", height: "100%", borderRadius: 3, background: C.accent, animation: "pulse 1.5s ease-in-out infinite" }} />
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 10 }}>Reading uploaded documents... extracting evidence... writing narrative...</div>
                </div>
              )}

              {!generating && selected.narrative && (
                <>
                  {editMode ? (
                    <textarea
                      defaultValue={selected.narrative}
                      style={{
                        width: "100%", minHeight: 400, padding: 16, borderRadius: 8, border: `1px solid ${C.border}`,
                        fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, lineHeight: 1.7, color: C.text,
                        resize: "vertical", background: "#fdfcf8",
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 14, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap" }}>
                      {selected.narrative.split("\n\n").map((para, i) => {
                        if (para.startsWith("AREAS REQUIRING")) {
                          return (
                            <div key={i} style={{ background: "rgba(197,48,48,0.05)", border: `1px solid rgba(197,48,48,0.15)`, borderRadius: 8, padding: 16, margin: "16px 0" }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 8 }}>Areas Requiring Attention</div>
                              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{para.replace("AREAS REQUIRING ATTENTION: ", "").replace("AREAS REQUIRING SIGNIFICANT DEVELOPMENT: ", "")}</div>
                            </div>
                          );
                        }
                        return <p key={i} style={{ margin: "0 0 12px" }}>{para}</p>;
                      })}
                    </div>
                  )}

                  {selected.sources && selected.sources.length > 0 && (
                    <div style={{ marginTop: 20, padding: 16, background: C.accentLight, borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 8 }}>Evidence Sources Referenced</div>
                      {selected.sources.map((s, i) => (
                        <div key={i} style={{ fontSize: 13, color: C.text, padding: "3px 0" }}>• {s}</div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {!generating && !selected.narrative && (
                <div style={{ padding: 60, textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>No narrative drafted yet</div>
                  <div style={{ fontSize: 13, color: C.textMuted }}>Click "Generate Draft" to have RHONDA write the first version from your uploaded documents.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
