// ─── KINGS HOME — RHONDA CONFIG ─────────────────────────────────────────────
// 359 employees · $12M revenue · 21 homes · 6 campuses · 4 Alabama counties
// Programs: Abused Youth (12 homes, 87 daily avg), Women & Children (10 homes, 200 daily),
//   Therapeutic Foster Care, Juvenile Offenders, Social Enterprises (Stables, Pottery, 3 Thrift Stores)
// President: Lew Burdette (since 2002) · COA-accredited through Social Current
// Mission: "Serve and glorify God by providing Christ-centered homes and services in which
//   compassion and competence combine to meet the needs of women, children, and families."
export const config = {
  clientKey: "kings-home",
  companyName: "Kings Home",
  accent: "#3B77BB",          // Kings Home blue (from logo)
  accentSecondary: "#C49B2A", // warm gold — TSP brand tie-in
  chrome: "#1A2440",          // deep navy sidebar

  systemPreamble: `You are RHONDA, the AI operations assistant for Kings Home — a residential child welfare organization serving women, children, and families across 21 homes on 6 campuses in 4 Alabama counties (Blount, Jefferson, Shelby, Tuscaloosa). Kings Home has 359 employees and serves approximately 275 residents annually.

KEY PROGRAMS YOU SUPPORT:
- Abused Youth Program: 12 group homes serving youth ages 10-21 referred by Alabama DHR and courts. Live-in married houseparent couples provide 24-hour care. Sub-programs: Basic (8 boys), Moderate (68 youth, 24hr awake supervision), Transitional Living (11 foster youth ages 16-21, Jane's House for girls), DYS juvenile offenders (12 youth, Westover campus, 90-120 day stays).
- Women & Children's Program: 10 homes serving up to 200 abused mothers and children daily fleeing domestic violence, homelessness, and trafficking. Up to 2-year stays. Services include counseling, GED support, job training, financial literacy, free childcare, and parenting skills.
- Therapeutic Foster Care (TFC): Matching foster parents with children ages 6-18 in DHR custody needing additional therapeutic support. Only TFC agency based in Shelby County.
- Social Enterprises: King's Home Stables (equine therapy), Garden (horticultural therapy), Prodigal Pottery (handmade by women in recovery), 3 Thrift Stores (Pinson, Talladega, Homewood), King's Home Collections (Chelsea).

COMPLIANCE & REGULATORY KNOWLEDGE:
- COA (Council on Accreditation / Social Current) standards — GOV, HR, FIN, PQI, RPM, RTX
- QRTP (Qualified Residential Treatment Program) requirements under Family First Prevention Services Act — 30-day independent assessments, 60-day judicial reviews, 24/7 clinical staffing, trauma-informed model documentation, 6-month aftercare tracking
- Alabama DHR reporting requirements and monthly disbursement documentation
- State licensing for residential child care facilities
- Medicaid behavioral health billing and managed care re-authorization
- Court report preparation for judicial placement reviews

Be warm, professional, and mission-centered. Every interaction serves the mission of offering hope and a future to women, children, and families.`,

  teachPreamble: `You are learning how Kings Home operates — a large residential care organization with 359 employees across 21 homes on 6 campuses in 4 Alabama counties. Kings Home serves abused youth (ages 10-21), women and children fleeing domestic violence, therapeutic foster care families, and juvenile offenders.

Pay special attention to:
- Houseparent procedures (live-in married couples providing 24-hour care)
- Intake and discharge processes across different program types
- DHR documentation and court reporting requirements
- QRTP compliance workflows (30-day assessments, 60-day judicial reviews)
- COA accreditation standards and evidence collection
- Safety protocols across multiple campuses
- Women's program-specific procedures (DV safety planning, resource navigation)
- Therapeutic Foster Care matching and supervision processes

Every process you learn helps RHONDA support 359 staff members serving hundreds of residents daily. The documentation burden is the #1 bottleneck — your job is to make it disappear.`,

  tiles: {
    email: { description: "Draft emails to DHR caseworkers, courts, families, staff, and partner agencies" },
    data: { description: "Organize resident data, DHR reports, court documents, and grant tracking across all 6 campuses" },
    customers: { label: "Families & Referrals", description: "Handle family inquiries, DHR referrals, court placement requests, and intake coordination" },
  },

  languages: ["en", "es"],

  powerTools: [
    { category: "Accreditation & Compliance", emoji: "🏅", items: [
      { label: "Accreditation Center", href: "/accreditation-center", desc: "COA readiness — every standard, every gap, one dashboard" },
      { label: "QRTP Tracker", href: "/qrtp-tracker", desc: "Family First compliance — 30-day assessments, 60-day reviews, aftercare" },
      { label: "Policy Mapper", href: "/policy-mapper", desc: "Map policies to COA standards, surface the gaps" },
      { label: "Narrative Writer", href: "/narrative-writer", desc: "Draft self-study narratives from your own documents" },
      { label: "PQI Dashboard", href: "/pqi-dashboard", desc: "Outcome tracking + PDCA improvement cycles — automated" },
    ]},
    { category: "Youth Programs", emoji: "🏠", items: [
      { label: "Service Plan Builder", href: "/service-plan-builder", desc: "30-day assessment → ISP → 90-day reviews — guided and compliant" },
      { label: "Court Report Writer", href: "/court-report-writer", desc: "Auto-draft judicial review reports from case data" },
      { label: "Discharge Planner", href: "/discharge-planner", desc: "Transition planning + 6-month aftercare tracking" },
      { label: "Incident Report", href: "/incident-report", desc: "Voice-powered incident reporting — restraints, runaways, injuries" },
      { label: "Houseparent Hub", href: "/houseparent-hub", desc: "Daily logs, resident updates, and handoff notes for cottage parents" },
    ]},
    { category: "Women & Children", emoji: "💜", items: [
      { label: "Intake Coordinator", href: "/intake-coordinator", desc: "Streamline intake for women and children fleeing crisis" },
      { label: "Safety Planner", href: "/safety-planner", desc: "Personalized domestic violence safety plans" },
      { label: "Resource Navigator", href: "/resource-navigator", desc: "Connect residents to GED, jobs, legal aid, childcare, housing" },
      { label: "Progress Tracker", href: "/progress-tracker", desc: "Track each family's journey from crisis to independence" },
    ]},
    { category: "Staff & Training", emoji: "👥", items: [
      { label: "Cert Tracker", href: "/compliance-scan", desc: "Certs, training hours, and license renewals for 359 staff" },
      { label: "Staff Onboard", href: "/onboard", desc: "New hire orientation across all programs and campuses" },
      { label: "Shift Handoff", href: "/shift-handoff", desc: "Auto-generated shift briefings for 24/7 care staff" },
      { label: "Scorecard", href: "/scorecard", desc: "Staff performance, training compliance, and care quality" },
    ]},
    { category: "Operations", emoji: "⚙️", items: [
      { label: "Batch Scanner", href: "/batch-scan", desc: "Scan documents — RHONDA classifies, files, and connects to standards" },
      { label: "Teach RHONDA", href: "#teach", desc: "Teach me how Kings Home runs — I'll remember everything" },
      { label: "SOP Generator", href: "/sop-generator", desc: "Turn spoken procedures into formatted SOPs" },
      { label: "DHR Reporter", href: "/dhr-reporter", desc: "Auto-format monthly DHR reports and disbursement documentation" },
      { label: "Voice Broadcast", href: "/voice-broadcast", desc: "Announcements across all 6 campuses and 359 staff" },
    ]},
    { category: "Knowledge & Care", emoji: "🧠", items: [
      { label: "Ask the Veteran", href: "/ask-veteran", desc: "50+ years of care expertise — policies, procedures, wisdom on tap" },
      { label: "Trauma-Informed Guide", href: "/trauma-guide", desc: "TF-CBT protocols, de-escalation techniques, and care best practices" },
      { label: "Grant Writer", href: "/grant-writer", desc: "Draft grant narratives and compliance reports from your data" },
      { label: "ROI Dashboard", href: "/roi-ticker", desc: "Grant dollars stretched, staff hours saved, outcomes improved" },
    ]},
  ],

  demo: {
    maxMessages: 10,  // generous for Lew — this is a gift, not a demo gate
    gatedCTA: false,
  },
};
