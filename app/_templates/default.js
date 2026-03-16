// Default RHONDA demo config — no client-specific branding
export const config = {
  clientKey: "demo",
  companyName: "Your Company",
  accent: "#c49b2a",           // gold
  accentSecondary: "#4a6540",  // green

  systemPreamble: "",          // prepended to every RHONDA prompt
  teachPreamble: "",           // prepended to Teach RHONDA prompt

  tiles: {
    // Per-tile overrides (labels, descriptions, visibility)
    // e.g.  email: { label: "Outreach", description: "Draft client emails" }
    // e.g.  leo: { hidden: true }
  },

  demo: {
    maxMessages: 5,
    gatedCTA: true,
  },
};
