// ─── SUNSHINE MILLS — RHONDA CONFIG ──────────────────────────────────────────
// Pet food manufacturer, Red Bay AL — family-owned 75+ years
// Staff-facing RHONDA: helps office team with emails, data, docs, scheduling
export const config = {
  clientKey: "sunshine-mills",
  companyName: "Sunshine Mills",
  accent: "#C8872A",          // warm amber — matches LEO template
  accentSecondary: "#4a6540",
  chrome: "#3A2A1A",          // warm brown sidebar/banner

  systemPreamble: "You are RHONDA, the AI office manager for Sunshine Mills — a family-owned pet food manufacturer in Red Bay, Alabama. The company makes brands like Evolve, Hunter's Special, Sportsman's Pride, and Nurture Farms. Be familiar with manufacturing, distribution, and CPG terminology.",
  teachPreamble: "You are learning how Sunshine Mills operates — a pet food manufacturer with production facilities in Red Bay, AL. Pay special attention to production workflows, quality standards, and distribution processes.",

  tiles: {
    email: { description: "Draft emails to buyers, vendors, and distributors" },
    data: { description: "Organize production data, sales reports, and inventory" },
    customers: { description: "Handle buyer inquiries and distributor responses" },
  },

  languages: ["en", "es", "vi"],

  demo: {
    maxMessages: 5,
    gatedCTA: true,
  },
};
