"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2F2A", accent: "#2E7D6F",
  accentLight: "rgba(46,125,111,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
};

const DEMO_REPORTS = [
  {
    id: "CR-2026-014",
    youthInitials: "MT",
    age: 15,
    caseNumber: "JV-2025-1847",
    court: "Jefferson County Family Court",
    judge: "Hon. Patricia Harwell",
    hearingDate: "2026-04-03",
    hearingType: "90-Day QRTP Review",
    status: "draft",
    caseworker: "Dana Phillips, Jefferson County DHR",
    placementDate: "2026-01-08",
    cottage: "Oak Hill",
    program: "Moderate",
    sections: {
      placement: "Youth was placed at Kings Home on January 8, 2026, following removal from biological home due to substantiated physical abuse and neglect. Prior placement at emergency foster home was disrupted after 3 days due to behavioral escalation. Youth was referred by Jefferson County DHR for residential treatment as the least restrictive setting capable of meeting documented behavioral and therapeutic needs.",
      treatment: "Youth is actively engaged in individual therapy (weekly, TF-CBT model) and group counseling (twice weekly). Trauma-focused Cognitive Behavioral Therapy addresses identified trauma responses including hypervigilance, anger dysregulation, and sleep disruption. Youth has attended 10 of 11 scheduled individual sessions and 8 of 9 group sessions. Psychiatrist evaluation completed January 22 — medication management initiated for ADHD and anxiety.",
      behavior: "Behavioral trajectory is positive. Initial adjustment period (weeks 1-3) included three verbal escalation incidents, one requiring brief physical intervention per approved protocol. Since February 1, zero physical interventions required. Youth is responding well to the positive behavior support framework and has earned Level 3 privileges. De-escalation skills are developing — youth self-identified an anger trigger and requested a break independently on March 10.",
      education: "Youth is enrolled at Chelsea Middle School and attending daily. Current grades: Math B+ (improved from D), English B, Science C+, History B-. Youth passed a math test for the first time in two years on March 12. IEP is current with accommodations for extended test time and preferential seating. School reports improved peer interactions and classroom participation.",
      family: "Supervised visitation with biological mother occurring biweekly at DHR office. Phone contact (supervised) weekly on Thursdays. Mother has completed 4 of 12 required parenting classes. Reunification remains the stated permanency goal pending completion of mother's service plan. Family engagement specialist coordinates with DHR caseworker on progress.",
      recommendation: "Kings Home respectfully recommends continued placement in the QRTP setting. Youth is making measurable therapeutic progress but clinical assessment indicates premature step-down would risk regression. Recommend 90-day continuation with next review scheduled for July 2026. Specific benchmarks for step-down consideration: (1) sustained zero-restraint status for 90 consecutive days, (2) consistent Level 3-4 behavioral status, (3) completion of Phase 2 TF-CBT treatment protocol.",
    },
  },
  {
    id: "CR-2026-011",
    youthInitials: "AJ",
    age: 16,
    caseNumber: "JV-2024-2103",
    court: "Shelby County Family Court",
    judge: "Hon. Marcus Rivera",
    hearingDate: "2026-03-28",
    hearingType: "Permanency Hearing",
    status: "ready",
    caseworker: "Tamara Wilson, Shelby County DHR",
    placementDate: "2025-07-15",
    cottage: "Cedar Ridge",
    program: "Moderate → Discharge Planning",
    sections: {
      placement: "Youth has been placed at Kings Home since July 15, 2025 (8 months). Original placement due to severe neglect and substance abuse in the home. Two prior foster placements disrupted. Youth has successfully completed the Moderate program treatment objectives and is currently in active discharge planning.",
      treatment: "Youth has completed the full TF-CBT treatment protocol (24 sessions). Individual therapy transitioned to maintenance frequency (biweekly). Youth demonstrates strong coping skills, emotional regulation, and has processed primary trauma narratives. Psychiatric medication (Sertraline 50mg) stable for 4 months with good response. Therapist assessment indicates readiness for community-based outpatient care.",
      behavior: "Outstanding behavioral trajectory. Zero restraints during entire placement. Sustained Level 4 (highest) privileges for 14 consecutive weeks. Youth serves as a peer mentor in the cottage and assists with new resident orientation. Consistently demonstrates prosocial decision-making and conflict resolution skills.",
      education: "Enrolled at Chelsea High School. GPA: 3.1 (up from 1.8 at admission). Perfect attendance since October 2025. Active in art club and has expressed interest in community college graphic design program. All credits on track for on-time graduation.",
      family: "Reunification ruled out — parental rights terminated October 2025. Permanency plan changed to APPLA (Another Planned Permanent Living Arrangement) with identified foster family match. Mr. and Mrs. Brian Thompson (Shelby County) have completed all TFC requirements and have developed a strong relationship with youth through 6 weekend visits and 2 extended stays. Youth reports feeling comfortable and wanting to move forward with placement.",
      recommendation: "Kings Home recommends discharge to identified therapeutic foster family (Thompson) effective approximately April 15, 2026. Transition plan includes: (1) two additional extended weekend visits, (2) school enrollment transfer to Thompson's district, (3) outpatient therapy referral established with Dr. Sarah Chen, (4) 6-month aftercare monitoring per QRTP requirements. Youth is a success story who is ready for a family setting.",
    },
  },
];

export default function CourtReportWriterPage() {
  const [selectedReport, setSelectedReport] = useState(DEMO_REPORTS[0].id);
  const [editingSection, setEditingSection] = useState(null);
  const report = DEMO_REPORTS.find(r => r.id === selectedReport);

  const sectionLabels = {
    placement: "Placement History & Basis",
    treatment: "Treatment Progress",
    behavior: "Behavioral Status",
    education: "Educational Progress",
    family: "Family Engagement & Permanency",
    recommendation: "Placement Recommendation",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Court Report Writer</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,130,246,0.15)", color: "#93C5FD", fontSize: 11, fontWeight: 700 }}>Judicial Reviews</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Report selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {DEMO_REPORTS.map(r => (
            <div key={r.id} onClick={() => setSelectedReport(r.id)}
              style={{
                background: C.surface, borderRadius: 12, padding: 20, cursor: "pointer",
                border: `1.5px solid ${selectedReport === r.id ? C.accent : C.border}`,
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{r.youthInitials}</span>
                  <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 8 }}>Age {r.age}</span>
                </div>
                <span style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: r.status === "ready" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                  color: r.status === "ready" ? C.green : C.orange,
                }}>{r.status === "ready" ? "Ready for Review" : "Draft"}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.hearingType}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                {r.court} &middot; {r.judge} &middot; {r.hearingDate}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Case: {r.caseNumber} &middot; {r.caseworker}</div>
            </div>
          ))}
        </div>

        {report && (
          <>
            {/* Report header */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Confidential Court Report</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 8 }}>Kings Home Residential Treatment Update</div>
                <div style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>{report.hearingType} — {report.hearingDate}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, padding: 16, background: C.accentLight, borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 4 }}>YOUTH</div>
                  <div style={{ fontSize: 13, color: C.text }}>{report.youthInitials}, Age {report.age}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{report.cottage} &middot; {report.program}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 4 }}>COURT</div>
                  <div style={{ fontSize: 13, color: C.text }}>{report.judge}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{report.court}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 4 }}>CASE</div>
                  <div style={{ fontSize: 13, color: C.text }}>{report.caseNumber}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Placed: {report.placementDate}</div>
                </div>
              </div>
            </div>

            {/* Report sections */}
            {Object.entries(report.sections).map(([key, content]) => (
              <div key={key} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.accent }}>{sectionLabels[key]}</h3>
                  <button onClick={() => setEditingSection(editingSection === key ? null : key)}
                    style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: editingSection === key ? C.accent : "transparent", color: editingSection === key ? "#fff" : C.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    {editingSection === key ? "Preview" : "Edit"}
                  </button>
                </div>
                {editingSection === key ? (
                  <textarea defaultValue={content}
                    style={{ width: "100%", minHeight: 120, padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, lineHeight: 1.7, color: C.text, resize: "vertical", background: "#fdfcf8" }} />
                ) : (
                  <div style={{ fontSize: 13, lineHeight: 1.8, color: C.text }}>{content}</div>
                )}
              </div>
            ))}

            {/* Action bar */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8, marginBottom: 40 }}>
              <button style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Regenerate Draft
              </button>
              <button style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Export as PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
