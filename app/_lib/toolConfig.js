// ── Shared Tool Config ──────────────────────────────────────────────────────
// Generic client config for Power Tool pages. Each tool reads ?client=xxx
// from the URL and gets the right colors, company name, and industry terms.
// Add a new client = tools just work.

const clients = {
  "sunshine-mills": {
    key: "sunshine-mills",
    name: "Sunshine Mills",
    industry: "Pet Food Manufacturing",
    backHref: "/sunshine",
    chrome: "#3A2A1A",
    accent: "#C8872A",
    accentSecondary: "#4a6540",
    departments: ["Production", "Quality", "Warehouse", "Maintenance", "Shipping", "Safety", "Purchasing", "R&D", "Lab"],
    systemContext: "Sunshine Mills is a family-owned pet food manufacturer in Red Bay, Alabama. Founded 1947. $525M revenue, 900 employees, 7 plants across 6 states. Brands include Evolve, Hunter's Special, Sportsman's Pride, Nurture Farms. Also major private label manufacturer for Aldi, Lidl, and national retailers. All plants SQF Level 3 certified. Production: 750,000 lbs of dry pet food per 24 hours at Red Bay.",
  },
  "kings-home": {
    key: "kings-home",
    name: "Kings Home",
    industry: "Residential Child Welfare",
    backHref: "/kings-home",
    chrome: "#1A2440",
    accent: "#3B77BB",
    accentSecondary: "#C49B2A",
    departments: ["Youth Programs", "Women & Children", "Administration", "Counseling", "Foster Care", "Social Enterprise"],
    systemContext: "Kings Home is a residential child welfare organization serving women, children, and families across 21 homes on 6 campuses in 4 Alabama counties. 359 employees. Programs: Abused Youth (12 homes), Women & Children (10 homes, 200 daily), Therapeutic Foster Care, Social Enterprises. COA-accredited.",
  },
  "thompson-distribution": {
    key: "thompson-distribution",
    name: "Thompson Distribution",
    industry: "Heavy Equipment Distribution",
    backHref: "/thompson-distribution",
    chrome: "#2A2A2A",
    accent: "#C9A84C",
    accentSecondary: "#4a6540",
    departments: ["Parts", "Service", "Sales", "Fleet", "Warehouse", "Safety"],
    systemContext: "Thompson Distribution is a multi-brand heavy equipment dealer (International, Ford, Isuzu). 65,000 SKUs across 2 warehouses. Serial acquirer — 3 acquisitions in 5 years. Multi-location operations.",
  },
};

// Default/fallback — TSP green+gold
const defaultClient = {
  key: "default",
  name: "Your Company",
  industry: "Business",
  backHref: "/",
  chrome: "#2c3528",
  accent: "#c49b2a",
  accentSecondary: "#4a6540",
  departments: ["Operations", "Admin", "Production", "Safety", "Quality", "Shipping"],
  systemContext: "A business using RHONDA AI tools for operations.",
};

export function getToolClient(clientKey) {
  if (!clientKey) return defaultClient;
  return clients[clientKey] || defaultClient;
}

// Build a color palette from client config — used by all tool pages
export function getToolColors(client) {
  const c = typeof client === "string" ? getToolClient(client) : client;
  return {
    bg: "#f4f1ea",
    surface: "#ffffff",
    chrome: c.chrome,
    accent: c.accent,
    accentLight: `${c.accent}1F`,  // ~12% opacity
    accentGlow: `${c.accent}40`,   // ~25% opacity
    forest: c.chrome,
    border: "#d6d1c4",
    borderLight: "#e8e3d9",
    text: c.chrome,
    textMuted: "#7a7462",
    danger: "#c0392b",
    dangerBg: "rgba(192,57,43,0.08)",
  };
}

export { clients };
