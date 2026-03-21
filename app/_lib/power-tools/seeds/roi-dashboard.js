// ROI Dashboard seed data — realistic per-client events

const SEEDS = {
  "sunshine-mills": [
    { id: 1, category: "incident", label: "Batch Hold Triggered: Aflatoxin Check", savings: 45000, unit: "recall cost avoided", time: "2 hours ago", icon: "🛡️" },
    { id: 2, category: "compliance", label: "SQF Audit Package Generated: Red Bay Plant", savings: 6500, unit: "consultant fee avoided", time: "3 hours ago", icon: "✅" },
    { id: 3, category: "sop", label: "SOP Created: Extruder Startup Sequence", savings: 1200, unit: "training cost avoided", time: "5 hours ago", icon: "📋" },
    { id: 4, category: "incident", label: "Allergen Cross-Contact Flagged: Line 3 Changeover", savings: 12000, unit: "potential recall avoided", time: "Yesterday", icon: "🛡️" },
    { id: 5, category: "compliance", label: "Ingredient COA Rejected: Corn Gluten Meal — Protein Below Spec", savings: 8200, unit: "bad batch avoided", time: "Yesterday", icon: "✅" },
    { id: 6, category: "sop", label: "SOP Created: Packaging Line QC Check", savings: 1200, unit: "training cost avoided", time: "Yesterday", icon: "📋" },
    { id: 7, category: "onboard", label: "New Hire Onboarded: Luis Garcia — Tupelo Plant", savings: 950, unit: "HR processing saved", time: "2 days ago", icon: "👤" },
    { id: 8, category: "translate", label: "Safety Alert Broadcast: 3 Languages — All 7 Plants", savings: 350, unit: "interpreter cost avoided", time: "2 days ago", icon: "🔊" },
    { id: 9, category: "incident", label: "Metal Detector Trip: Packaging Line 2 — Foreign Object Caught", savings: 25000, unit: "consumer complaint avoided", time: "3 days ago", icon: "🛡️" },
    { id: 10, category: "teach", label: "Tribal Knowledge Captured: Jim Rivera — Extruder Calibration", savings: 15000, unit: "institutional knowledge preserved", time: "3 days ago", icon: "🧠" },
    { id: 11, category: "compliance", label: "Expired Cert Caught: Fire Suppression — Red Bay Warehouse", savings: 4200, unit: "OSHA citation avoided", time: "4 days ago", icon: "✅" },
    { id: 12, category: "sop", label: "SOP Created: Allergen Changeover Protocol", savings: 1200, unit: "training cost avoided", time: "4 days ago", icon: "📋" },
    { id: 13, category: "incident", label: "Wet Floor Flagged: B-Wing Hallway — Near-Miss Report Filed", savings: 8500, unit: "avg injury claim avoided", time: "5 days ago", icon: "🛡️" },
    { id: 14, category: "translate", label: "Onboarding Docs: Vietnamese — Dublin GA Plant", savings: 350, unit: "translation service avoided", time: "6 days ago", icon: "🔊" },
    { id: 15, category: "sop", label: "SOP Created: Forklift Pre-Shift Inspection", savings: 1200, unit: "training cost avoided", time: "1 week ago", icon: "📋" },
  ],

  "thompson-distribution": [
    { id: 1, category: "compliance", label: "CDL Medical Card Expiring: 3 Drivers Flagged — 14 Days Out", savings: 7500, unit: "DOT fine avoided", time: "2 hours ago", icon: "✅" },
    { id: 2, category: "incident", label: "Lift Cylinder Leak Caught: Service Bay 4 — Knoxville", savings: 3200, unit: "unplanned downtime avoided", time: "3 hours ago", icon: "🛡️" },
    { id: 3, category: "sop", label: "SOP Created: International DT466 Diagnostic Sequence", savings: 1200, unit: "training cost avoided", time: "5 hours ago", icon: "📋" },
    { id: 4, category: "teach", label: "Tribal Knowledge Captured: Charlie Mitchell — Multi-Brand Warranty Tricks", savings: 15000, unit: "institutional knowledge preserved", time: "Yesterday", icon: "🧠" },
    { id: 5, category: "compliance", label: "DOT Inspection Form Missing: Unit 2847 — Caught Before Audit", savings: 4200, unit: "FMCSA violation avoided", time: "Yesterday", icon: "✅" },
    { id: 6, category: "incident", label: "Parts Inventory Discrepancy: 47 SKUs Off — Corona Warehouse", savings: 6800, unit: "shrinkage loss prevented", time: "2 days ago", icon: "🛡️" },
    { id: 7, category: "onboard", label: "New Tech Onboarded: Marcus Hill — Chattanooga Service", savings: 950, unit: "HR processing saved", time: "2 days ago", icon: "👤" },
    { id: 8, category: "sop", label: "SOP Created: Ford F-750 Pre-Delivery Inspection", savings: 1200, unit: "training cost avoided", time: "3 days ago", icon: "📋" },
    { id: 9, category: "compliance", label: "OEM Training Cert Renewal: 5 Techs Flagged — Isuzu Requirements", savings: 3500, unit: "warranty authorization preserved", time: "3 days ago", icon: "✅" },
    { id: 10, category: "incident", label: "Warranty Claim Recovery: $4,200 International Engine Repair", savings: 4200, unit: "warranty recovery", time: "4 days ago", icon: "🛡️" },
    { id: 11, category: "sop", label: "SOP Created: Multi-Brand Parts Cross-Reference Lookup", savings: 1200, unit: "training cost avoided", time: "5 days ago", icon: "📋" },
    { id: 12, category: "translate", label: "Safety Bulletin: Spanish — All 5 Service Locations", savings: 350, unit: "translation service avoided", time: "5 days ago", icon: "🔊" },
    { id: 13, category: "compliance", label: "EPA Compliance Check: Paint Booth Ventilation — Bristol VA", savings: 5200, unit: "EPA fine avoided", time: "6 days ago", icon: "✅" },
    { id: 14, category: "teach", label: "Tribal Knowledge Captured: Linda Parsons — Parts Oracle Legacy System", savings: 15000, unit: "institutional knowledge preserved", time: "6 days ago", icon: "🧠" },
    { id: 15, category: "incident", label: "Fleet PM Overdue Alert: 12 Units Flagged — Customer Notification Sent", savings: 9600, unit: "breakdown cost avoided", time: "1 week ago", icon: "🛡️" },
  ],

  "kings-home": [
    { id: 1, category: "compliance", label: "QRTP 30-Day Assessment Due: TB at Elm Cottage — 3 Days Remaining", savings: 5000, unit: "compliance penalty avoided", time: "2 hours ago", icon: "✅" },
    { id: 2, category: "sop", label: "SOP Created: New Intake Procedure — Women & Children", savings: 1200, unit: "training cost avoided", time: "3 hours ago", icon: "📋" },
    { id: 3, category: "compliance", label: "COA Evidence Collected: HR Standard 2.03 — Staff Training Records", savings: 6500, unit: "accreditation gap closed", time: "5 hours ago", icon: "✅" },
    { id: 4, category: "incident", label: "Behavioral Incident Documented: Cedar Ridge — De-escalated, No Restraint", savings: 3500, unit: "proper documentation value", time: "Yesterday", icon: "🛡️" },
    { id: 5, category: "onboard", label: "New Houseparent Onboarded: Mark & Sarah Collins — Oak Hill Cottage", savings: 950, unit: "HR processing saved", time: "Yesterday", icon: "👤" },
    { id: 6, category: "compliance", label: "Court Report Auto-Drafted: JW 60-Day Judicial Review — Judge Thompson", savings: 4200, unit: "staff hours saved", time: "2 days ago", icon: "✅" },
    { id: 7, category: "teach", label: "Tribal Knowledge Captured: Dorothy Mae Williams — 25 Years Crisis De-escalation", savings: 15000, unit: "institutional knowledge preserved", time: "2 days ago", icon: "🧠" },
    { id: 8, category: "compliance", label: "Staff Training Cert Expiring: 8 Staff CPR/First Aid — 21 Days Out", savings: 3200, unit: "licensing violation avoided", time: "3 days ago", icon: "✅" },
    { id: 9, category: "sop", label: "SOP Created: Medication Administration — Double-Check Protocol", savings: 1200, unit: "training cost avoided", time: "3 days ago", icon: "📋" },
    { id: 10, category: "incident", label: "Elopement Attempt Prevented: MC at Cedar Ridge — Staff Alerted", savings: 8500, unit: "search & liability avoided", time: "4 days ago", icon: "🛡️" },
    { id: 11, category: "compliance", label: "DHR Monthly Report Auto-Generated: March — All 6 Campuses", savings: 4800, unit: "staff hours saved", time: "4 days ago", icon: "✅" },
    { id: 12, category: "onboard", label: "Relief Staff Onboarded: Tasha Davis — Trauma-Informed Care Training", savings: 950, unit: "HR processing saved", time: "5 days ago", icon: "👤" },
    { id: 13, category: "sop", label: "SOP Created: Houseparent Shift Handoff — Cottage Log Protocol", savings: 1200, unit: "training cost avoided", time: "5 days ago", icon: "📋" },
    { id: 14, category: "compliance", label: "PQI Dashboard Updated: Q1 Outcome Metrics — Ready for Board Review", savings: 3500, unit: "reporting hours saved", time: "6 days ago", icon: "✅" },
    { id: 15, category: "incident", label: "Medication Error Caught: Wrong Dosage Flagged Before Administration", savings: 12000, unit: "liability avoided", time: "1 week ago", icon: "🛡️" },
  ],

  "demo": [
    { id: 1, category: "sop", label: "SOP Created: Extruder Startup", savings: 1200, unit: "training cost avoided", time: "2 hours ago", icon: "📋" },
    { id: 2, category: "incident", label: "Near-Miss Caught: Wet Floor B-Wing", savings: 8500, unit: "avg injury claim avoided", time: "3 hours ago", icon: "🛡️" },
    { id: 3, category: "compliance", label: "Compliance Scan: Chemical Storage", savings: 4200, unit: "OSHA fine prevented", time: "5 hours ago", icon: "✅" },
    { id: 4, category: "onboard", label: "New Hire Onboarded: Maria Santos", savings: 950, unit: "HR processing saved", time: "Yesterday", icon: "👤" },
    { id: 5, category: "sop", label: "SOP Created: Packaging Line QC", savings: 1200, unit: "training cost avoided", time: "Yesterday", icon: "📋" },
    { id: 6, category: "translate", label: "Safety Alert Broadcast: 3 Languages", savings: 350, unit: "interpreter cost avoided", time: "Yesterday", icon: "🔊" },
    { id: 7, category: "incident", label: "Hazard Reported: Loose Guard Rail", savings: 12000, unit: "potential OSHA citation", time: "2 days ago", icon: "🛡️" },
    { id: 8, category: "compliance", label: "Audit Package Generated: FDA Ready", savings: 6500, unit: "consultant fee avoided", time: "2 days ago", icon: "✅" },
    { id: 9, category: "sop", label: "SOP Created: Forklift Inspection", savings: 1200, unit: "training cost avoided", time: "3 days ago", icon: "📋" },
    { id: 10, category: "teach", label: "Tribal Knowledge Captured: Jim Rivera", savings: 15000, unit: "institutional knowledge preserved", time: "3 days ago", icon: "🧠" },
    { id: 11, category: "incident", label: "Equipment Issue Flagged: Conveyor #3", savings: 3200, unit: "unplanned downtime avoided", time: "4 days ago", icon: "🛡️" },
    { id: 12, category: "translate", label: "Onboarding Docs: Vietnamese", savings: 350, unit: "translation service avoided", time: "5 days ago", icon: "🔊" },
    { id: 13, category: "compliance", label: "Expired Cert Caught: Fire Extinguisher", savings: 2800, unit: "citation avoided", time: "6 days ago", icon: "✅" },
    { id: 14, category: "sop", label: "SOP Created: Allergen Changeover", savings: 1200, unit: "training cost avoided", time: "1 week ago", icon: "📋" },
    { id: 15, category: "incident", label: "Batch Hold Triggered: Aflatoxin Check", savings: 45000, unit: "recall cost avoided", time: "1 week ago", icon: "🛡️" },
  ],
};

export default function roiDashboardSeed(clientKey) {
  return SEEDS[clientKey] || SEEDS["demo"];
}
