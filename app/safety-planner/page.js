"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2F2A", accent: "#2E7D6F",
  accentLight: "rgba(46,125,111,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
  purple: "#7C3AED",
};

// Domestic violence safety plan template — standard tool in DV shelter work
const PLAN_SECTIONS = [
  {
    id: "warning-signs",
    title: "Warning Signs & Triggers",
    icon: "⚡",
    prompt: "What behaviors or situations indicate danger is increasing? Think about changes in tone, actions, patterns.",
    fields: [
      { label: "Signs I notice when the situation is becoming unsafe", type: "textarea" },
      { label: "Behaviors that tell me I need to leave immediately", type: "textarea" },
    ],
  },
  {
    id: "safe-places",
    title: "Safe Places to Go",
    icon: "🏠",
    prompt: "Identify 3-4 places you can go if you need to leave quickly. Include addresses and contact info if possible.",
    fields: [
      { label: "Option 1 (friend, family, or shelter)", type: "text" },
      { label: "Option 2", type: "text" },
      { label: "Option 3", type: "text" },
      { label: "Option 4 (backup)", type: "text" },
    ],
  },
  {
    id: "contacts",
    title: "Emergency Contacts",
    icon: "📱",
    prompt: "People you can call in an emergency. Include at least one person who knows your situation.",
    fields: [
      { label: "Trusted person #1 (name & phone)", type: "text" },
      { label: "Trusted person #2 (name & phone)", type: "text" },
      { label: "Local DV hotline", type: "text", default: "National DV Hotline: 1-800-799-7233" },
      { label: "Kings Home crisis line", type: "text", default: "(205) 678-8331" },
      { label: "Local police non-emergency", type: "text" },
    ],
  },
  {
    id: "essentials",
    title: "Essential Items to Take",
    icon: "🎒",
    prompt: "Items to gather if you need to leave. Keep copies in a safe place outside the home if possible.",
    fields: [
      { label: "Documents (ID, birth certificates, SSN cards, protective orders, immigration papers)", type: "checklist" },
      { label: "Financial (cash, debit card, bank info, benefit cards)", type: "checklist" },
      { label: "Keys (house, car, safe deposit box)", type: "checklist" },
      { label: "Medications (for you and children)", type: "checklist" },
      { label: "Phone and charger", type: "checklist" },
      { label: "Children's essentials (comfort items, school info, medical records)", type: "checklist" },
      { label: "Other important items", type: "textarea" },
    ],
  },
  {
    id: "children",
    title: "Safety Plan for Children",
    icon: "👶",
    prompt: "Age-appropriate plans so children know what to do.",
    fields: [
      { label: "Safe room in the house for children to go to", type: "text" },
      { label: "Code word children know means 'go to the safe place'", type: "text" },
      { label: "Neighbor or nearby adult children can go to", type: "text" },
      { label: "What children should NOT do (intervene, call 911 themselves — age dependent)", type: "textarea" },
    ],
  },
  {
    id: "technology",
    title: "Technology Safety",
    icon: "🔒",
    prompt: "Abusers often monitor phones, email, and social media. Plan for digital safety.",
    fields: [
      { label: "Safe phone or device to use (not monitored)", type: "text" },
      { label: "Email account abuser does not know about", type: "text" },
      { label: "Location services turned off on devices?", type: "text" },
      { label: "Social media privacy settings reviewed?", type: "text" },
      { label: "Other technology concerns", type: "textarea" },
    ],
  },
  {
    id: "legal",
    title: "Legal Protections",
    icon: "⚖️",
    prompt: "Legal steps that can help protect you.",
    fields: [
      { label: "Protection order status", type: "text" },
      { label: "Attorney name and contact", type: "text" },
      { label: "Court dates upcoming", type: "text" },
      { label: "Legal aid resources", type: "text", default: "Alabama Legal Aid: 1-866-456-4995" },
    ],
  },
  {
    id: "self-care",
    title: "Emotional Safety & Self-Care",
    icon: "💜",
    prompt: "This is hard. What helps you stay grounded?",
    fields: [
      { label: "Things I do when I feel overwhelmed", type: "textarea" },
      { label: "People who support me emotionally", type: "textarea" },
      { label: "Affirmation I need to remember", type: "textarea", default: "I deserve to be safe. This is not my fault. I am doing the right thing for myself and my children." },
    ],
  },
];

// Demo completed plans (summary view)
const COMPLETED_PLANS = [
  { id: "SP-041", resident: "Maria R.", children: 2, created: "Mar 10, 2026", lastReviewed: "Mar 10, 2026", cottage: "Bethany House 3", status: "current" },
  { id: "SP-038", resident: "Keisha W.", children: 3, created: "Feb 28, 2026", lastReviewed: "Mar 14, 2026", cottage: "Hannah Home 2", status: "current" },
  { id: "SP-035", resident: "Jennifer L.", children: 1, created: "Feb 15, 2026", lastReviewed: "Mar 1, 2026", cottage: "Bethany House 1", status: "current" },
  { id: "SP-033", resident: "Tanya M.", children: 0, created: "Feb 8, 2026", lastReviewed: "Feb 8, 2026", cottage: "Hannah Home 4", status: "needs-review" },
  { id: "SP-029", resident: "Ashley D.", children: 2, created: "Jan 20, 2026", lastReviewed: "Jan 20, 2026", cottage: "Hannah Home 1", status: "needs-review" },
];

export default function SafetyPlannerPage() {
  const [view, setView] = useState("plans"); // plans | builder
  const [activeSection, setActiveSection] = useState(0);

  const needsReview = COMPLETED_PLANS.filter(p => p.status === "needs-review").length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Safety Planner</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(124,58,237,0.15)", color: "#C4B5FD", fontSize: 11, fontWeight: 700 }}>Women & Children</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Active Safety Plans", value: COMPLETED_PLANS.length, color: C.accent },
            { label: "Needs 30-Day Review", value: needsReview, color: needsReview > 0 ? C.orange : C.green },
            { label: "Children Covered", value: COMPLETED_PLANS.reduce((s, p) => s + p.children, 0), color: C.purple },
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
            { id: "plans", label: "Active Plans" },
            { id: "builder", label: "Create New Plan" },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: view === t.id ? C.accent : "transparent", color: view === t.id ? "#fff" : C.textMuted }}>
              {t.label}
            </button>
          ))}
        </div>

        {view === "plans" && (
          <div>
            {COMPLETED_PLANS.map(plan => (
              <div key={plan.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${plan.status === "needs-review" ? C.orange : C.border}`, padding: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{plan.resident}</span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{plan.children} child{plan.children !== 1 ? "ren" : ""}</span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>&middot; {plan.cottage}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    Created {plan.created} &middot; Last reviewed {plan.lastReviewed}
                  </div>
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: plan.status === "needs-review" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                  color: plan.status === "needs-review" ? C.orange : C.green,
                }}>{plan.status === "needs-review" ? "Review Due" : "Current"}</span>
                <button style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  View/Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {view === "builder" && (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
            {/* Section nav */}
            <div>
              {PLAN_SECTIONS.map((sec, i) => (
                <div key={sec.id} onClick={() => setActiveSection(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                    background: activeSection === i ? C.accentLight : "transparent",
                    border: `1px solid ${activeSection === i ? C.accent : "transparent"}`,
                  }}>
                  <span style={{ fontSize: 18 }}>{sec.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: activeSection === i ? C.accent : C.text }}>{sec.title}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Active section */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{PLAN_SECTIONS[activeSection].icon}</span>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>{PLAN_SECTIONS[activeSection].title}</h2>
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>{PLAN_SECTIONS[activeSection].prompt}</div>

              {PLAN_SECTIONS[activeSection].fields.map((field, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea defaultValue={field.default || ""}
                      style={{ width: "100%", minHeight: 80, padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, lineHeight: 1.5, color: C.text, resize: "vertical", background: "#fdfcf8" }}
                      placeholder="Type here or use voice input..." />
                  ) : field.type === "checklist" ? (
                    <div style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fdfcf8", fontSize: 13, color: C.textMuted }}>
                      {field.label}
                    </div>
                  ) : (
                    <input type="text" defaultValue={field.default || ""}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, background: "#fdfcf8" }}
                      placeholder="Type here..." />
                  )}
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button disabled={activeSection === 0} onClick={() => setActiveSection(activeSection - 1)}
                  style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: activeSection === 0 ? C.borderLight : C.textMuted, fontSize: 13, fontWeight: 600, cursor: activeSection === 0 ? "default" : "pointer" }}>
                  Previous
                </button>
                <button onClick={() => setActiveSection(Math.min(activeSection + 1, PLAN_SECTIONS.length - 1))}
                  style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {activeSection === PLAN_SECTIONS.length - 1 ? "Save Plan" : "Next Section"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
