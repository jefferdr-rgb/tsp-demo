// ─── SUNSHINE MILLS — RHONDA CONFIG ──────────────────────────────────────────
// Pet food manufacturer, Red Bay AL — family-owned 75+ years
// $525M revenue, 900 employees, 7 plants across 6 states
// SQF Level 3 certified. Brands: Evolve, Hunter's Special, Sportsman's Pride, etc.
// Private label for Aldi, Lidl, national retailers (40-60% of revenue)
export const config = {
  clientKey: "sunshine-mills",
  companyName: "Sunshine Mills",
  accent: "#C8872A",          // warm amber — matches LEO template
  accentSecondary: "#4a6540",
  chrome: "#3A2A1A",          // warm brown sidebar/banner

  systemPreamble: `You are RHONDA, the AI office manager for Sunshine Mills — a family-owned pet food manufacturer in Red Bay, Alabama founded in 1947. Revenue: $525M. 900 employees across 7 plants in 6 states (Red Bay AL, Tupelo MS, Dublin GA, Greenville NC, Halifax VA, Elkhart IN, Joplin MO).

KEY KNOWLEDGE:
- Brands: Evolve, Hunter's Special, Sportsman's Pride, Nurture Farms, Triumph, PupCorn Plus, Meaty Treats, Hi-Tor Veterinary Select, Field Trial, Cat Café
- Private label: Aldi (Heart to Tail), Lidl (Orlando), plus undisclosed national brands (40-60% of revenue)
- Products: dry kibble, soft/dry kibble, soft & chewy treats, dehydrated treats, oven-baked biscuits
- All plants SQF Level 3 certified for food safety
- Production: 750,000 lbs dry pet food per 24 hours at Red Bay facility
- CEO: Alan Bostick (President since 1984, 3rd generation). VP Purchasing & Formulation: Marco Bostick (4th generation)
- Be familiar with pet food manufacturing, CPG distribution, food safety compliance, AAFCO standards, SQF requirements, and FSMA`,

  teachPreamble: `You are learning how Sunshine Mills operates — a $525M pet food manufacturer with 900 employees across 7 plants in 6 states. Pay special attention to:
- Production workflows and line changeover procedures
- Quality assurance protocols (SQF, HACCP, CGMP)
- Ingredient receiving and COA verification processes
- Private label specifications and retailer requirements
- Multi-plant coordination and logistics
- Food safety incident response procedures
- Formulation and batch adjustment processes`,

  tiles: {
    email: { description: "Draft emails to buyers, vendors, distributors, and retailers" },
    data: { description: "Organize production data, sales reports, inventory, and quality records" },
    customers: { label: "Buyers & Retailers", description: "Handle buyer inquiries, retailer specs, and distributor responses" },
  },

  languages: ["en", "es", "vi"],

  powerTools: [
    { category: "Food Safety & Quality", emoji: "🛡️", items: [
      { label: "Recall Response Center", href: "/recall-response?client=sunshine-mills", desc: "Lot tracing, FDA notifications, retailer alerts — minutes, not weeks" },
      { label: "Quality Lab", href: "/quality-lab?client=sunshine-mills", desc: "Test results, hold/release, SQF audit readiness — one dashboard" },
      { label: "Ingredient Checker", href: "/ingredient-checker?client=sunshine-mills", desc: "Scan a COA, cross-reference against specs — accept, flag, or reject" },
      { label: "Incident Report", href: "/incident-report?client=sunshine-mills", desc: "Voice-powered safety and quality incident reporting" },
    ]},
    { category: "Production & Operations", emoji: "🏭", items: [
      { label: "Production Pulse", href: "/production-pulse?client=sunshine-mills", desc: "7 plants, 1 morning briefing — output, efficiency, downtime" },
      { label: "Shift Handoff", href: "/shift-handoff?client=sunshine-mills", desc: "Auto-generated shift briefings for production line changeovers" },
      { label: "SOP Generator", href: "/sop-generator?client=sunshine-mills", desc: "Speak a procedure — RHONDA writes the SOP" },
      { label: "Batch Scanner", href: "/batch-scan?client=sunshine-mills", desc: "Scan documents — RHONDA classifies, extracts, and files" },
    ]},
    { category: "Private Label & Sales", emoji: "📦", items: [
      { label: "Private Label Portal", href: "/private-label?client=sunshine-mills", desc: "Aldi, Lidl, Walmart spec compliance + order tracking" },
      { label: "Scorecard", href: "/scorecard?client=sunshine-mills", desc: "Plant performance, quality streaks, on-time delivery" },
    ]},
    { category: "Staff & Training", emoji: "👥", items: [
      { label: "Cert Tracker", href: "/compliance-scan?client=sunshine-mills", desc: "SQF certifications, food safety training, OSHA renewals" },
      { label: "Staff Onboard", href: "/onboard?client=sunshine-mills", desc: "New hire orientation across all 7 plants" },
      { label: "Teach RHONDA", href: "#teach", desc: "Teach me how Sunshine Mills runs — I remember everything" },
    ]},
    { category: "Operations", emoji: "⚙️", items: [
      { label: "Voice Broadcast", href: "/voice-broadcast?client=sunshine-mills", desc: "Announcements across all 7 plant locations" },
      { label: "ROI Dashboard", href: "/roi-ticker?client=sunshine-mills", desc: "Every hour saved, every recall prevented — tracked" },
      { label: "Asset Manager", href: "/asset-manager?client=sunshine-mills", desc: "QR codes on equipment — scan for SOPs, report issues" },
    ]},
  ],

  demo: {
    maxMessages: 10,   // generous for Alan — this is a closing meeting
    gatedCTA: false,
  },
};
