"use client";
import { useSearchParams, usePathname } from "next/navigation";

// Map URL slugs to template clientKeys
const SLUG_MAP = {
  "sunshine": "sunshine-mills",
  "sunshine-mills": "sunshine-mills",
  "thompson": "thompson-distribution",
  "thompson-distribution": "thompson-distribution",
  "kings-home": "kings-home",
  "kings": "kings-home",
  "senators": "senators-coaches",
  "demo": "demo",
};

// Rich client metadata — used by tool pages that need systemContext, departments, etc.
const CLIENT_META = {
  "sunshine-mills": {
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
    name: "Thompson Distribution",
    industry: "Heavy Equipment Distribution",
    backHref: "/thompson-distribution",
    chrome: "#2A2A2A",
    accent: "#C9A84C",
    accentSecondary: "#4a6540",
    departments: ["Parts", "Service", "Sales", "Fleet", "Warehouse", "Safety"],
    systemContext: "Thompson Distribution is a multi-brand heavy equipment dealer (International, Ford, Isuzu). 65,000 SKUs across 2 warehouses. Serial acquirer — 3 acquisitions in 5 years. Multi-location operations.",
  },
  "demo": {
    name: "Your Company",
    industry: "Business",
    backHref: "/",
    chrome: "#2c3528",
    accent: "#c49b2a",
    accentSecondary: "#4a6540",
    departments: ["Operations", "Admin", "Production", "Safety", "Quality", "Shipping"],
    systemContext: "A business using RHONDA AI tools for operations.",
  },
};

export function useClientConfig() {
  const params = useSearchParams();
  const pathname = usePathname();

  // Priority 1: ?client= param
  let clientKey = params.get("client");

  // Priority 2: path prefix
  if (!clientKey) {
    const seg = pathname.split("/")[1];
    clientKey = SLUG_MAP[seg];
  }

  // Priority 3: default
  if (!clientKey) clientKey = "demo";
  else clientKey = SLUG_MAP[clientKey] || clientKey;

  return { clientKey };
}

// Get rich metadata for a client — name, industry, departments, systemContext
export function getClientMeta(clientKey) {
  return CLIENT_META[clientKey] || CLIENT_META["demo"];
}
