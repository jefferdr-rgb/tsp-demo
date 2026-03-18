// ─── THOMPSON DISTRIBUTION — RHONDA CONFIG ──────────────────────────────────
// MTA Distributors + Thompson Truck Group — John Thompson, CEO
// International/Ford/Isuzu dealer + largest US rental equipment distributor
export const config = {
  clientKey: "thompson-distribution",
  companyName: "Thompson Distribution",
  accent: "#1B4D8F",          // deep blue — professional, multi-brand
  accentSecondary: "#C4352A", // International Truck red accent
  chrome: "#0D1B2A",          // dark navy sidebar/banner

  systemPreamble: `You are RHONDA, the AI operations manager for Thompson Distribution — a family of companies owned by John Thompson. The group includes:
- MTA Distributors: America's largest rental equipment distributor. Honda engines, 200+ product lines, 65,000+ parts SKUs. Warehouses in Nashville and Corona, CA.
- Thompson Truck Group: International, Ford, and Isuzu dealer with 5 locations (Knoxville, Chattanooga, Morristown, Cookeville TN + Bristol VA). Full-service dealer with 24/7 mobile service, collision center, and parts.
Be familiar with truck dealership operations (parts, service, sales, warranty), distribution/warehousing terminology, DOT compliance, CDL requirements, and multi-brand parts management. John has acquired 3 companies in 5 years — integration and standardization are core priorities.`,

  teachPreamble: `You are learning how Thompson Distribution operates — a multi-entity group including MTA Distributors (rental equipment distribution) and Thompson Truck Group (International/Ford/Isuzu dealer, 5 locations). Pay special attention to processes that vary by location, multi-brand parts differences, acquisition integration procedures, and tribal knowledge from senior techs.`,

  tiles: {
    email: { description: "Draft emails to OEM reps, parts vendors, and fleet customers" },
    data: { description: "Organize parts data, service reports, and location P&Ls" },
    customers: { description: "Handle fleet customer inquiries and service requests" },
  },

  languages: ["en", "es"],

  powerTools: [
    { category: "Safety & Compliance", emoji: "🛡️", items: [
      { label: "Safety Checkpoint", href: "/safety-map", desc: "OSHA + DOT compliance across all locations" },
      { label: "Cert Tracker", href: "/compliance-scan", desc: "CDL, DOT certs, OEM training — never miss a renewal" },
      { label: "Incident Report", href: "/incident-report", desc: "Voice-powered safety reporting" },
    ]},
    { category: "Acquisitions & Integration", emoji: "🏗️", items: [
      { label: "Acquisition Integrator", href: "/acquisition-integrator", desc: "New dealership online in 30 days, not 6 months" },
      { label: "Tech Onboard", href: "/onboard", desc: "Get new techs productive fast — any brand" },
      { label: "Teach RHONDA", href: "#teach", desc: "Capture how YOUR team does it before they retire" },
    ]},
    { category: "Parts & Distribution", emoji: "📦", items: [
      { label: "Multi-Brand Parts Brain", href: "/parts-brain", desc: "International + Ford + Isuzu — one answer" },
      { label: "Distribution Pulse", href: "/distribution-pulse", desc: "65K SKUs, 2 warehouses, 1 morning briefing" },
      { label: "Warranty Wrangler", href: "/warranty-wrangler", desc: "3 OEMs, 3 portals — never miss a claim" },
    ]},
    { category: "Fleet & Service", emoji: "🚛", items: [
      { label: "Fleet Uptime Advisor", href: "/fleet-uptime", desc: "Customer portal: truck health + PM reminders" },
      { label: "Shift Handoff", href: "/shift-handoff", desc: "Auto-generated service bay briefings" },
      { label: "SOP Generator", href: "/sop-generator", desc: "Turn talk into procedures" },
    ]},
    { category: "Operations", emoji: "⚙️", items: [
      { label: "Voice Broadcast", href: "/voice-broadcast", desc: "Announcements across all 7 locations" },
      { label: "Scorecard", href: "/scorecard", desc: "Location performance + safety streaks" },
      { label: "ROI Dashboard", href: "/roi-ticker", desc: "Every dollar RHONDA saves" },
    ]},
  ],

  demo: {
    maxMessages: 5,
    gatedCTA: true,
  },
};
