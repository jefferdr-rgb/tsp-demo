// ══════════════════════════════════════════════════
// POWER TOOLS REGISTRY — single source of truth
// ══════════════════════════════════════════════════

export const TIER = {
  UNIVERSAL: "universal",
  INDUSTRY: "industry",
  CUSTOM: "custom",
};

export const TOOL_REGISTRY = [
  // ── Universal (every client gets these) ──
  { id: "roi-dashboard",       label: "ROI Dashboard",       category: "Operations",  tier: TIER.UNIVERSAL, description: "Every dollar RHONDA saves — tracked" },
  { id: "shift-handoff",       label: "Shift Handoff",       category: "Operations",  tier: TIER.UNIVERSAL, description: "Auto-generated shift briefings" },
  { id: "scorecard",           label: "Scorecard",           category: "Operations",  tier: TIER.UNIVERSAL, description: "Personal ROI + safety streaks" },
  { id: "sop-generator",       label: "SOP Generator",       category: "Knowledge",   tier: TIER.UNIVERSAL, description: "Speak a procedure — RHONDA writes the SOP" },
  { id: "incident-report",     label: "Incident Report",     category: "Safety",      tier: TIER.UNIVERSAL, description: "Voice-powered safety reporting" },
  { id: "compliance-scan",     label: "Cert Tracker",        category: "Safety",      tier: TIER.UNIVERSAL, description: "Certs, inspections, training — never miss a renewal" },
  { id: "batch-scan",          label: "Batch Scanner",       category: "Operations",  tier: TIER.UNIVERSAL, description: "Feed a stack, RHONDA does the rest" },
  { id: "voice-broadcast",     label: "Voice Broadcast",     category: "People",      tier: TIER.UNIVERSAL, description: "Announcements to every phone" },
  { id: "onboard",             label: "Staff Onboard",       category: "People",      tier: TIER.UNIVERSAL, description: "New hire in 5 minutes" },
  { id: "safety-map",          label: "Safety Heat Map",     category: "Safety",      tier: TIER.UNIVERSAL, description: "See where hazards cluster" },
  { id: "ask-veteran",         label: "Ask the Veteran",     category: "Knowledge",   tier: TIER.UNIVERSAL, description: "Decades of expertise on tap" },
  { id: "bounty-board",        label: "Bounty Board",        category: "Knowledge",   tier: TIER.UNIVERSAL, description: "Get paid to document what you know" },
  { id: "asset-manager",       label: "Asset Manager",       category: "Operations",  tier: TIER.UNIVERSAL, description: "QR codes on equipment — scan for SOPs" },
  { id: "audit-package",       label: "Audit Package",       category: "Quality",     tier: TIER.UNIVERSAL, description: "One-click audit bundles" },
  { id: "defect-inspector",    label: "Defect Inspector",    category: "Quality",     tier: TIER.UNIVERSAL, description: "AI-powered visual QC" },
  { id: "equipment-whisperer", label: "Equipment Whisperer", category: "Operations",  tier: TIER.UNIVERSAL, description: "Diagnose any machine" },
  { id: "predictive-maintenance", label: "Predictive Maintenance", category: "Operations", tier: TIER.UNIVERSAL, description: "Fix it before it breaks" },

  // ── Industry (reusable with variants) ──
  { id: "production-pulse",    label: "Production Pulse",    category: "Operations",  tier: TIER.INDUSTRY, description: "Multi-plant production dashboard" },
  { id: "quality-lab",         label: "Quality Lab",         category: "Quality",     tier: TIER.INDUSTRY, description: "Test results, hold/release, audit readiness" },
  { id: "recall-response",     label: "Recall Response",     category: "Safety",      tier: TIER.INDUSTRY, description: "Lot tracing, FDA notifications, retailer alerts" },
  { id: "ingredient-checker",  label: "Ingredient Checker",  category: "Quality",     tier: TIER.INDUSTRY, description: "Scan a COA, cross-reference against specs" },
  { id: "distribution-pulse",  label: "Distribution Pulse",  category: "Operations",  tier: TIER.INDUSTRY, description: "Warehouse operations dashboard" },
  { id: "fleet-uptime",        label: "Fleet Uptime",        category: "Operations",  tier: TIER.INDUSTRY, description: "Fleet health + PM reminders" },
  { id: "parts-brain",         label: "Multi-Brand Parts",   category: "Operations",  tier: TIER.INDUSTRY, description: "Multi-OEM parts lookup" },
  { id: "acquisition-integrator", label: "Acquisition Integrator", category: "Operations", tier: TIER.INDUSTRY, description: "New location online in 30 days" },
  { id: "accreditation-center", label: "Accreditation Center", category: "Compliance", tier: TIER.INDUSTRY, description: "COA accreditation dashboard" },
  { id: "discharge-planner",   label: "Discharge Planner",   category: "Care",        tier: TIER.INDUSTRY, description: "Transition planning + aftercare" },
  { id: "intake-coordinator",  label: "Intake Coordinator",  category: "Care",        tier: TIER.INDUSTRY, description: "Streamline intake processing" },
  { id: "grant-writer",        label: "Grant Writer",        category: "Operations",  tier: TIER.INDUSTRY, description: "Draft grant narratives from your data" },
  { id: "narrative-writer",    label: "Narrative Writer",     category: "Compliance",  tier: TIER.INDUSTRY, description: "Self-study narratives from documents" },
  { id: "policy-mapper",       label: "Policy Mapper",       category: "Compliance",  tier: TIER.INDUSTRY, description: "Map policies to standards" },
  { id: "pqi-dashboard",       label: "PQI Dashboard",       category: "Compliance",  tier: TIER.INDUSTRY, description: "Outcome tracking + PDCA improvement" },
  { id: "trauma-guide",        label: "Trauma-Informed Guide", category: "Care",      tier: TIER.INDUSTRY, description: "TF-CBT protocols and de-escalation" },
  { id: "safety-planner",      label: "Safety Planner",      category: "Care",        tier: TIER.INDUSTRY, description: "Personalized DV safety plans" },
  { id: "resource-navigator",  label: "Resource Navigator",  category: "Care",        tier: TIER.INDUSTRY, description: "Connect residents to services" },
  { id: "progress-tracker",    label: "Progress Tracker",    category: "Care",        tier: TIER.INDUSTRY, description: "Track journey from crisis to independence" },
  { id: "service-plan-builder", label: "Service Plan Builder", category: "Care",      tier: TIER.INDUSTRY, description: "ISP builder with compliance checks" },

  // ── Custom (one client only) ──
  { id: "private-label",       label: "Private Label Portal", category: "Sales",      tier: TIER.CUSTOM, description: "Aldi, Lidl, Walmart spec compliance" },
  { id: "aflatoxin-response",  label: "Aflatoxin Response",   category: "Safety",     tier: TIER.CUSTOM, description: "Contamination response protocol" },
  { id: "warranty-wrangler",   label: "Warranty Wrangler",    category: "Operations", tier: TIER.CUSTOM, description: "Multi-OEM warranty management" },
  { id: "qrtp-tracker",        label: "QRTP Tracker",         category: "Compliance", tier: TIER.CUSTOM, description: "Family First compliance tracking" },
  { id: "dhr-reporter",        label: "DHR Reporter",         category: "Compliance", tier: TIER.CUSTOM, description: "Auto-format monthly DHR reports" },
  { id: "court-report-writer", label: "Court Report Writer",  category: "Care",       tier: TIER.CUSTOM, description: "Judicial review report drafting" },
  { id: "houseparent-hub",     label: "Houseparent Hub",      category: "Care",       tier: TIER.CUSTOM, description: "Daily cottage logs and handoffs" },
];

export function getToolMeta(toolId) {
  return TOOL_REGISTRY.find(t => t.id === toolId) || null;
}
