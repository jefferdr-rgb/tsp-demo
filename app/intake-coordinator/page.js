"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
  purple: "#7C3AED",
};

const INTAKE_QUEUE = [
  {
    id: "INT-2026-089", date: "2026-03-18", time: "10:30 AM", status: "new",
    referralSource: "Self-referred via hotline", type: "Woman + 2 children",
    name: "Pending intake interview",
    situation: "Caller fleeing DV situation. Husband arrested last night but released on bond. Needs immediate safe housing. Two children ages 4 and 7.",
    urgency: "high",
    needs: ["Safe housing — immediate", "Children's basic supplies", "Protective order assistance", "Counseling referral"],
    assignedTo: "Sherry Gulsby",
  },
  {
    id: "INT-2026-088", date: "2026-03-17", time: "2:15 PM", status: "interview-scheduled",
    referralSource: "Jefferson County DHR", type: "Woman + 1 child",
    name: "Pending intake interview",
    situation: "Referred by DHR after investigation. Mother and 3-year-old daughter. Mother has no family support in state. Currently in emergency shelter with 30-day limit approaching.",
    urgency: "medium",
    needs: ["Transitional housing (up to 2 years)", "GED program", "Job training", "Childcare"],
    assignedTo: "Sherry Gulsby",
    interviewDate: "2026-03-19 at 9:00 AM",
  },
  {
    id: "INT-2026-085", date: "2026-03-14", time: "11:00 AM", status: "admitted",
    referralSource: "One Roof Birmingham (coordinated entry)", type: "Woman + 3 children",
    name: "Admitted to Hannah Home 2",
    situation: "Mother and three children (ages 2, 5, 8) experiencing homelessness after fleeing abusive partner. Previously stayed with family but was asked to leave. Has been in emergency shelter for 2 weeks.",
    urgency: "medium",
    needs: ["Long-term housing plan", "Counseling for mother and 8-year-old", "School enrollment for 5 and 8 year-old", "Medicaid enrollment", "Parenting support"],
    assignedTo: "Keisha Williams",
    cottage: "Hannah Home 2",
    admitDate: "2026-03-15",
  },
  {
    id: "INT-2026-082", date: "2026-03-12", time: "4:00 PM", status: "waitlisted",
    referralSource: "Church referral (First Baptist Hoover)", type: "Woman only",
    name: "Pending — waitlisted for bed",
    situation: "Woman in her 40s, no children. Left abusive marriage. Currently staying with church member temporarily. Needs longer-term transitional support. Employed part-time.",
    urgency: "low",
    needs: ["Transitional housing", "Financial literacy", "Legal aid for divorce", "Counseling"],
    assignedTo: "Sherry Gulsby",
    waitlistPosition: 3,
  },
];

const STATUS_CONFIG = {
  new: { label: "New Referral", color: C.red, bg: "rgba(197,48,48,0.1)" },
  "interview-scheduled": { label: "Interview Scheduled", color: C.orange, bg: "rgba(245,158,11,0.1)" },
  admitted: { label: "Admitted", color: C.green, bg: "rgba(34,197,94,0.1)" },
  waitlisted: { label: "Waitlisted", color: C.purple, bg: "rgba(124,58,237,0.1)" },
  declined: { label: "Declined", color: C.textMuted, bg: C.borderLight },
};

const URGENCY_CONFIG = {
  high: { label: "Urgent", color: C.red },
  medium: { label: "Standard", color: C.orange },
  low: { label: "Low", color: C.textMuted },
};

// Intake form sections
const INTAKE_SECTIONS = [
  "Basic Information", "Safety Assessment", "Children's Information",
  "Housing History", "Health & Mental Health", "Legal Situation",
  "Education & Employment", "Support Network", "Immediate Needs",
];

export default function IntakeCoordinatorPage() {
  const [view, setView] = useState("queue"); // queue | form
  const [selectedIntake, setSelectedIntake] = useState(null);
  const [formStep, setFormStep] = useState(0);

  const newCount = INTAKE_QUEUE.filter(i => i.status === "new").length;
  const scheduledCount = INTAKE_QUEUE.filter(i => i.status === "interview-scheduled").length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Intake Coordinator</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(124,58,237,0.15)", color: "#C4B5FD", fontSize: 11, fontWeight: 700 }}>Women & Children</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "In Queue", value: INTAKE_QUEUE.length, color: C.accent },
            { label: "New Today", value: newCount, color: newCount > 0 ? C.red : C.green },
            { label: "Interviews Scheduled", value: scheduledCount, color: C.orange },
            { label: "Avg Response Time", value: "4.2 hrs", color: C.green },
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
            { id: "queue", label: "Referral Queue" },
            { id: "form", label: "New Intake Form" },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: view === t.id ? C.accent : "transparent", color: view === t.id ? "#fff" : C.textMuted }}>
              {t.label}
            </button>
          ))}
        </div>

        {view === "queue" && (
          <div>
            {INTAKE_QUEUE.map(intake => {
              const st = STATUS_CONFIG[intake.status];
              const urg = URGENCY_CONFIG[intake.urgency];
              const isOpen = selectedIntake === intake.id;
              return (
                <div key={intake.id} style={{ background: C.surface, borderRadius: 12, border: `1.5px solid ${intake.urgency === "high" && intake.status === "new" ? C.red : isOpen ? C.accent : C.border}`, marginBottom: 12, overflow: "hidden" }}>
                  <div onClick={() => setSelectedIntake(isOpen ? null : intake.id)}
                    style={{ padding: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ padding: "3px 8px", borderRadius: 4, background: st.bg, color: st.color, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                        <span style={{ padding: "3px 8px", borderRadius: 4, background: urg.color + "15", color: urg.color, fontSize: 11, fontWeight: 600 }}>{urg.label}</span>
                        <span style={{ fontSize: 12, color: C.textMuted }}>{intake.id}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 4 }}>{intake.type}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{intake.referralSource} &middot; {intake.date} {intake.time}</div>
                    </div>
                    <span style={{ fontSize: 18, color: C.textMuted, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>&#9662;</span>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: 20 }}>
                      <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, marginBottom: 16 }}>{intake.situation}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8 }}>Immediate Needs</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                        {intake.needs.map((need, i) => (
                          <span key={i} style={{ padding: "4px 10px", borderRadius: 6, background: C.accentLight, color: C.accent, fontSize: 12, fontWeight: 600 }}>{need}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.textMuted }}>
                        <span>Assigned: <span style={{ color: C.text, fontWeight: 600 }}>{intake.assignedTo}</span></span>
                        {intake.interviewDate && <span>Interview: <span style={{ color: C.text, fontWeight: 600 }}>{intake.interviewDate}</span></span>}
                        {intake.cottage && <span>Cottage: <span style={{ color: C.text, fontWeight: 600 }}>{intake.cottage}</span></span>}
                        {intake.waitlistPosition && <span>Waitlist position: <span style={{ color: C.text, fontWeight: 600 }}>#{intake.waitlistPosition}</span></span>}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        {intake.status === "new" && (
                          <button style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Schedule Interview</button>
                        )}
                        {intake.status === "interview-scheduled" && (
                          <button style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: C.green, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Begin Intake</button>
                        )}
                        <button style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add Note</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {view === "form" && (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
            <div>
              {INTAKE_SECTIONS.map((sec, i) => (
                <div key={i} onClick={() => setFormStep(i)}
                  style={{
                    padding: "10px 14px", borderRadius: 8, marginBottom: 4, cursor: "pointer", fontSize: 13,
                    fontWeight: formStep === i ? 700 : 400,
                    background: formStep === i ? C.accentLight : "transparent",
                    color: formStep === i ? C.accent : C.textMuted,
                    border: `1px solid ${formStep === i ? C.accent : "transparent"}`,
                  }}>
                  <span style={{ marginRight: 8, fontSize: 12 }}>{i + 1}.</span>{sec}
                </div>
              ))}
            </div>
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: C.text }}>{INTAKE_SECTIONS[formStep]}</h2>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Complete this section during the intake interview. RHONDA will auto-populate related fields across the system.</div>
              {formStep === 0 && (
                <div style={{ display: "grid", gap: 14 }}>
                  {["Full Name", "Date of Birth", "Phone Number", "Referral Source", "How did you hear about Kings Home?"].map((label, i) => (
                    <div key={i}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}</label>
                      <input type="text" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, background: "#fdfcf8" }} />
                    </div>
                  ))}
                </div>
              )}
              {formStep === 1 && (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ padding: 16, borderRadius: 8, background: "rgba(197,48,48,0.04)", border: `1px solid rgba(197,48,48,0.15)` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 8 }}>Safety First</div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>Assess immediate safety before proceeding. If the person is in immediate danger, contact law enforcement first.</div>
                  </div>
                  {["Are you currently safe?", "Is the abuser aware of your location?", "Do you have a protective order?", "Are there weapons in the home you left?", "Have you been to a hospital or doctor for injuries?"].map((q, i) => (
                    <div key={i}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>{q}</label>
                      <input type="text" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, background: "#fdfcf8" }} />
                    </div>
                  ))}
                </div>
              )}
              {formStep > 1 && (
                <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>
                  <div style={{ fontSize: 13 }}>Section form fields render here based on intake type.</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>Voice input available — tap the microphone to narrate responses.</div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button disabled={formStep === 0} onClick={() => setFormStep(formStep - 1)}
                  style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: formStep === 0 ? C.borderLight : C.textMuted, fontSize: 13, fontWeight: 600, cursor: formStep === 0 ? "default" : "pointer" }}>
                  Previous
                </button>
                <button onClick={() => setFormStep(Math.min(formStep + 1, INTAKE_SECTIONS.length - 1))}
                  style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {formStep === INTAKE_SECTIONS.length - 1 ? "Complete Intake" : "Next Section"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
