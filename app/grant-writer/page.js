"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
};

const ACTIVE_GRANTS = [
  {
    id: "GR-001", funder: "Alabama DHR", title: "Title IV-E Residential Care Reimbursement",
    amount: "$3,454,272", type: "Government — Ongoing", status: "active",
    nextReport: "2026-04-15", reportType: "Quarterly Service Report",
    description: "Per-child monthly disbursements for youth in DHR custody placed at Kings Home. Covers approximately 60% of youth program operating costs.",
    requirements: ["Monthly census reports per cottage", "Individual service plan documentation", "QRTP compliance verification", "Incident report summaries", "Quarterly financial reconciliation"],
  },
  {
    id: "GR-002", funder: "Community Foundation of Greater Birmingham", title: "Women & Children Emergency Services",
    amount: "$125,000", type: "Foundation — Annual", status: "active",
    nextReport: "2026-06-30", reportType: "Annual Impact Report",
    description: "Supports emergency intake, counseling services, and childcare for Women & Children program residents fleeing domestic violence.",
    requirements: ["Number of women and children served", "Average length of stay", "Services provided per resident", "Outcome data (employment, housing, education)", "Client success stories (anonymized)", "Financial expenditure report"],
  },
  {
    id: "GR-003", funder: "United Way of Central Alabama", title: "Youth Education & Life Skills",
    amount: "$75,000", type: "Foundation — Annual", status: "report-due",
    nextReport: "2026-03-31", reportType: "Mid-Year Progress Report",
    description: "Funds educational support services, tutoring, GED prep, life skills programming, and job readiness training for youth ages 14-21.",
    requirements: ["Youth served by age and program", "Educational outcomes (grades, GED completion, graduation)", "Life skills competency assessments", "Job placement data for TLP youth", "Program narrative with case examples"],
  },
  {
    id: "GR-004", funder: "Daniel Foundation of Alabama", title: "Therapeutic Foster Care Expansion",
    amount: "$50,000", type: "Foundation — Multi-Year (Year 2 of 3)", status: "active",
    nextReport: "2026-05-15", reportType: "Year 2 Progress Report",
    description: "Supports expansion of the Therapeutic Foster Care program — recruitment, training, and support of TFC families in Shelby County.",
    requirements: ["TFC families recruited and certified", "Children placed in TFC homes", "Retention rate of TFC families", "Training hours delivered", "Budget vs. actual expenditures"],
  },
  {
    id: "GR-005", funder: "Lilly Endowment", title: "Faith-Based Residential Care Innovation",
    amount: "$200,000", type: "Foundation — Multi-Year (Year 1 of 2)", status: "active",
    nextReport: "2026-09-01", reportType: "Year 1 Annual Report",
    description: "Supports implementation of trauma-informed care model enhancements and staff wellness programming across all youth residential programs.",
    requirements: ["Staff trained in enhanced TF-CBT model", "Restraint reduction data", "Staff wellness program participation", "Secondary trauma screening results", "Qualitative outcomes from houseparents and counselors"],
  },
];

const TEMPLATES = [
  { name: "Foundation Impact Report", desc: "Annual/mid-year report for foundation funders — outcomes, stories, financials", sections: 6 },
  { name: "Government Compliance Report", desc: "Quarterly/annual report for DHR, Medicaid, or federal funders", sections: 8 },
  { name: "Grant Proposal — LOI", desc: "Letter of Inquiry for new funding opportunities", sections: 4 },
  { name: "Grant Proposal — Full", desc: "Complete proposal with need statement, program design, budget, evaluation plan", sections: 10 },
  { name: "Case for Support", desc: "Organizational overview for major donor cultivation", sections: 5 },
];

// Demo generated narrative
const DEMO_NARRATIVE = {
  grantId: "GR-003",
  sections: [
    {
      title: "Program Overview",
      content: "During the first six months of the grant period (October 2025 – March 2026), Kings Home's Youth Education & Life Skills program served 94 young people ages 14-21 across four residential programs: Basic (8 youth), Moderate (68 youth), Transitional Living (11 youth), and Department of Youth Services (7 youth). Programming included daily educational support, weekly life skills instruction, GED preparation, and job readiness training for eligible youth.",
    },
    {
      title: "Educational Outcomes",
      content: "Of the 82 youth enrolled in public school during the reporting period, 71 (87%) maintained or improved their grade point average. Six youth completed their GED through the Chelsea Adult Education Center partnership. Average school attendance rate across all cottages was 94%, up from 88% in the prior period. Fourteen youth received IEP accommodations coordinated between Kings Home education staff and local school districts.\n\nNotably, one youth in the Moderate program — who arrived reading at a 4th-grade level — tested at grade level for the first time in March 2026 after six months of intensive tutoring funded by this grant.",
    },
    {
      title: "Life Skills & Job Readiness",
      content: "The Transitional Living Program (TLP) delivered 240 hours of structured life skills instruction covering budgeting, meal planning, job applications, interview skills, and apartment searching. All 11 TLP youth maintained personal budgets throughout the reporting period. Three TLP youth secured part-time employment — at Chick-fil-A, an auto repair shop, and King's Home Stables.\n\nJob readiness workshops were expanded to Moderate program youth ages 16+ this period, reaching an additional 22 participants. Topics included workplace communication, time management, and financial literacy.",
    },
    {
      title: "Challenges & Adjustments",
      content: "Staff turnover in the education support role created a 6-week gap in dedicated tutoring services (December 2025 – January 2026). During this period, houseparents and counselors provided supplementary homework support, but one-on-one tutoring was reduced. The position was filled in February 2026 and services are fully restored.\n\nAdditionally, two youth discharged early to foster care placements before completing life skills programming, which modestly reduces our completion rate metrics.",
    },
    {
      title: "Financial Summary",
      content: "Of the $75,000 grant, $34,200 has been expended through March 2026 (46%):\n- Education staff salary & benefits: $22,800\n- Tutoring materials & GED testing fees: $4,100\n- Life skills programming supplies: $3,600\n- Job readiness workshop materials: $2,400\n- Transportation to off-site educational activities: $1,300\n\nSpending is on pace with budget projections. Remaining funds are sufficient for the second half of the grant period.",
    },
  ],
};

export default function GrantWriterPage() {
  const [view, setView] = useState("grants"); // grants | templates | preview
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const reportsDue = ACTIVE_GRANTS.filter(g => g.status === "report-due").length;
  const totalFunding = ACTIVE_GRANTS.reduce((s, g) => s + parseInt(g.amount.replace(/[$,]/g, "")), 0);

  function handleGenerate(grantId) {
    setGenerating(true);
    setSelectedGrant(grantId);
    setTimeout(() => { setGenerating(false); setShowPreview(true); }, 2500);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Grant Writer</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,119,187,0.15)", color: "#7FB3E0", fontSize: 11, fontWeight: 700 }}>Narratives & Compliance</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Active Grants", value: ACTIVE_GRANTS.length, color: C.accent },
            { label: "Total Funding", value: `$${(totalFunding / 1000000).toFixed(1)}M`, color: C.green },
            { label: "Reports Due Soon", value: reportsDue, color: reportsDue > 0 ? C.red : C.green },
            { label: "Report Templates", value: TEMPLATES.length, color: C.blue },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {[
            { id: "grants", label: "Active Grants" },
            { id: "templates", label: "Report Templates" },
          ].map(t => (
            <button key={t.id} onClick={() => { setView(t.id); setShowPreview(false); }}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: view === t.id ? C.accent : "transparent", color: view === t.id ? "#fff" : C.textMuted }}>
              {t.label}
            </button>
          ))}
        </div>

        {view === "grants" && !showPreview && (
          <div>
            {ACTIVE_GRANTS.map(grant => (
              <div key={grant.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${grant.status === "report-due" ? C.red : C.border}`, padding: 20, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{grant.title}</span>
                      {grant.status === "report-due" && (
                        <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(197,48,48,0.1)", color: C.red, fontSize: 11, fontWeight: 700 }}>Report Due</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>{grant.funder} &middot; {grant.type}</div>
                    <div style={{ fontSize: 13, color: C.text, marginTop: 8, lineHeight: 1.5 }}>{grant.description}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>{grant.amount}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderLight}` }}>
                  <div>
                    <span style={{ fontSize: 12, color: C.textMuted }}>Next: </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: grant.status === "report-due" ? C.red : C.text }}>{grant.reportType} — {grant.nextReport}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setSelectedGrant(selectedGrant === grant.id ? null : grant.id)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {selectedGrant === grant.id ? "Hide Requirements" : "Requirements"}
                    </button>
                    <button onClick={() => handleGenerate(grant.id)}
                      style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {generating && selectedGrant === grant.id ? "Generating..." : "Draft Report"}
                    </button>
                  </div>
                </div>

                {selectedGrant === grant.id && !generating && (
                  <div style={{ marginTop: 12, padding: 14, background: C.accentLight, borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 8 }}>Report Requirements</div>
                    {grant.requirements.map((req, i) => (
                      <div key={i} style={{ fontSize: 13, color: C.text, padding: "3px 0", display: "flex", gap: 8 }}>
                        <span style={{ color: C.accent }}>•</span> {req}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === "grants" && showPreview && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button onClick={() => setShowPreview(false)}
                style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                &larr; Back to Grants
              </button>
              <button style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Export as PDF
              </button>
            </div>

            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Mid-Year Progress Report</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 8 }}>Youth Education & Life Skills Program</div>
                <div style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>United Way of Central Alabama &middot; Grant Period: Oct 2025 – Sep 2026</div>
                <div style={{ fontSize: 13, color: C.accent, marginTop: 4 }}>Prepared by Kings Home &middot; March 2026</div>
              </div>

              {DEMO_NARRATIVE.sections.map((sec, i) => (
                <div key={i} style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.accent, marginBottom: 8, borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 6 }}>{sec.title}</h3>
                  <div style={{ fontSize: 14, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap" }}>{sec.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "templates" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {TEMPLATES.map((t, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5, marginBottom: 12 }}>{t.desc}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{t.sections} sections</span>
                  <button style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
