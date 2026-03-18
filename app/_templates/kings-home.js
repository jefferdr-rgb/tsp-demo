// ─── KINGS HOME — RHONDA CONFIG ─────────────────────────────────────────────
// Residential child welfare nonprofit, Lew Burdette (President)
// COA-accredited through Social Current / Council on Accreditation
export const config = {
  clientKey: "kings-home",
  companyName: "Kings Home",
  accent: "#2E7D6F",          // deep teal — trust, care, stability
  accentSecondary: "#C49B2A", // warm gold — TSP brand tie-in
  chrome: "#1A2F2A",          // dark forest sidebar

  systemPreamble: `You are RHONDA, the AI operations assistant for Kings Home — a residential child welfare organization. Kings Home provides residential care, foster care, and family services. Be familiar with:
- COA (Council on Accreditation) standards and compliance requirements
- Residential treatment operations (RTX standards, trauma-informed care)
- Staff scheduling, training tracking, and HR documentation
- PQI (Performance and Quality Improvement) processes — outcome tracking, data collection, continuous improvement cycles
- Risk prevention and management, incident reporting, safety protocols
- Financial management and grant compliance for nonprofits
Be warm, professional, and always mindful that the mission is serving children and families.`,

  teachPreamble: `You are learning how Kings Home operates — a residential child welfare organization accredited by COA (Council on Accreditation). Pay special attention to care procedures, staff protocols, compliance workflows, and the documentation requirements that support accreditation. Every process you learn helps RHONDA support the mission of serving children and families.`,

  tiles: {
    email: { description: "Draft emails to staff, case workers, families, and agencies" },
    data: { description: "Organize resident data, compliance reports, and grant tracking" },
    customers: { label: "Families", description: "Handle family inquiries, case updates, and referral responses" },
  },

  languages: ["en", "es"],

  powerTools: [
    { category: "Accreditation", emoji: "🏅", items: [
      { label: "Accreditation Center", href: "/accreditation-center", desc: "COA readiness dashboard — every standard at a glance" },
      { label: "Policy Mapper", href: "/policy-mapper", desc: "Map your policies to COA standards, find the gaps" },
      { label: "Narrative Writer", href: "/narrative-writer", desc: "Draft self-study narratives from your own docs" },
      { label: "PQI Dashboard", href: "/pqi-dashboard", desc: "Outcome tracking + improvement cycles — automated" },
    ]},
    { category: "Safety & Compliance", emoji: "🛡️", items: [
      { label: "Incident Report", href: "/incident-report", desc: "Voice-powered incident reporting" },
      { label: "Cert Tracker", href: "/compliance-scan", desc: "Staff certs, training, and license renewals" },
      { label: "Safety Checkpoint", href: "/safety-map", desc: "Facility safety tracking across all buildings" },
    ]},
    { category: "Knowledge", emoji: "🧠", items: [
      { label: "Teach RHONDA", href: "#teach", desc: "Teach me how Kings Home runs — I'll remember everything" },
      { label: "SOP Generator", href: "/sop-generator", desc: "Turn spoken procedures into formatted SOPs" },
      { label: "Ask the Veteran", href: "/ask-veteran", desc: "Decades of care expertise on tap" },
    ]},
    { category: "Operations", emoji: "⚙️", items: [
      { label: "Batch Scanner", href: "/batch-scan", desc: "Scan stacks of documents — RHONDA classifies and files" },
      { label: "Shift Handoff", href: "/shift-handoff", desc: "Auto-generated shift briefings for care staff" },
      { label: "Scorecard", href: "/scorecard", desc: "Staff performance + care quality streaks" },
    ]},
    { category: "People", emoji: "👥", items: [
      { label: "Staff Onboard", href: "/onboard", desc: "New hire orientation in minutes" },
      { label: "Voice Broadcast", href: "/voice-broadcast", desc: "Announcements to all staff" },
      { label: "ROI Dashboard", href: "/roi-ticker", desc: "Grant dollars stretched, hours saved" },
    ]},
  ],

  demo: {
    maxMessages: 10,  // generous for Lew — this is a gift, not a demo gate
    gatedCTA: false,
  },
};
