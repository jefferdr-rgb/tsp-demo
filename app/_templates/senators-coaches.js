// ─── SENATORS COACHES — RHONDA CONFIG ────────────────────────────────────────
// Fleet/tour coach company, Florence AL — Frierson Mitchener
// Staff-facing RHONDA: helps office team with fleet ops, customer comms, scheduling
export const config = {
  clientKey: "senators-coaches",
  companyName: "Senators Coaches",
  accent: "#1B3A5C",          // navy — matches LEO template
  accentSecondary: "#C8A84E", // gold accent

  systemPreamble: "You are RHONDA, the AI office manager for Senators Coaches — a charter bus and fleet tour company in Florence, Alabama. Be familiar with fleet operations, DOT compliance, booking management, and group travel logistics.",
  teachPreamble: "You are learning how Senators Coaches operates — a charter bus company in Florence, AL. Pay special attention to booking workflows, driver scheduling, DOT compliance, and fleet maintenance routines.",

  tiles: {
    email: { description: "Draft emails to clients, vendors, and travel coordinators" },
    data: { description: "Organize fleet data, booking reports, and maintenance logs" },
    customers: { description: "Handle booking inquiries and group travel requests" },
  },

  demo: {
    maxMessages: 5,
    gatedCTA: true,
  },
};
