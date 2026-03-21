// Scorecard seed data — per-client worker profiles + zone streaks

const SEEDS = {
  "sunshine-mills": {
    workers: [
      { id: 1, name: "Jim Rivera", dept: "Production", role: "Senior Operator", avatar: "JR", color: "#8E6B3E", safetyStreak: 142, personalBest: 142, incidentFreeZone: "Line A", weeklyStats: { sopsCreated: 2, incidentsReported: 1, complianceScans: 3, bountiesClaimed: 1, shiftsCompleted: 5 }, roi: 4850, roiBreakdown: { sopValue: 2400, safetyValue: 1200, complianceValue: 1250 }, badges: ["🏆 Top Contributor", "🔥 142-Day Streak", "📋 SOP Master"], trend: "up" },
      { id: 2, name: "Mary Chen", dept: "Quality", role: "QA Lead", avatar: "MC", color: "#4a6540", safetyStreak: 89, personalBest: 120, incidentFreeZone: "QC Lab", weeklyStats: { sopsCreated: 1, incidentsReported: 0, complianceScans: 8, bountiesClaimed: 0, shiftsCompleted: 5 }, roi: 6200, roiBreakdown: { sopValue: 1200, safetyValue: 0, complianceValue: 5000 }, badges: ["✅ Compliance Champion", "🔬 QC Expert"], trend: "up" },
      { id: 3, name: "Carlos Vega", dept: "Maintenance", role: "Maintenance Lead", avatar: "CV", color: "#6495ED", safetyStreak: 67, personalBest: 95, incidentFreeZone: "Maintenance Shop", weeklyStats: { sopsCreated: 1, incidentsReported: 2, complianceScans: 1, bountiesClaimed: 2, shiftsCompleted: 5 }, roi: 8400, roiBreakdown: { sopValue: 1200, safetyValue: 3200, complianceValue: 4000 }, badges: ["⚙️ Equipment Whisperer", "💰 Bounty Hunter"], trend: "stable" },
      { id: 4, name: "Maria Santos", dept: "Packaging", role: "Line Worker (New)", avatar: "MS", color: "#E67E22", safetyStreak: 3, personalBest: 3, incidentFreeZone: "Packaging", weeklyStats: { sopsCreated: 0, incidentsReported: 0, complianceScans: 0, bountiesClaimed: 0, shiftsCompleted: 2 }, roi: 0, roiBreakdown: { sopValue: 0, safetyValue: 0, complianceValue: 0 }, badges: ["🌱 New Hire"], trend: "new" },
      { id: 5, name: "Diane Atkins", dept: "Safety", role: "Safety Coordinator", avatar: "DA", color: "#8E44AD", safetyStreak: 210, personalBest: 210, incidentFreeZone: "Facility-Wide", weeklyStats: { sopsCreated: 0, incidentsReported: 3, complianceScans: 12, bountiesClaimed: 0, shiftsCompleted: 5 }, roi: 14200, roiBreakdown: { sopValue: 0, safetyValue: 8700, complianceValue: 5500 }, badges: ["🛡️ Safety Guardian", "🔥 210-Day Record", "👀 Eagle Eye"], trend: "up" },
    ],
    zoneStreaks: [
      { zone: "QC Lab", streak: 320, icon: "🔬", color: "#4a6540" },
      { zone: "Break Room", streak: 245, icon: "☕", color: "#6495ED" },
      { zone: "Production Line A", streak: 142, icon: "🏭", color: "#c49b2a" },
      { zone: "Maintenance Shop", streak: 67, icon: "⚙️", color: "#E67E22" },
      { zone: "Packaging", streak: 31, icon: "📦", color: "#8E44AD" },
      { zone: "Warehouse", streak: 4, icon: "📦", color: "#c0392b" },
      { zone: "Loading Dock", streak: 18, icon: "🚛", color: "#7a7462" },
      { zone: "Chemical Storage", streak: 52, icon: "⚗️", color: "#27AE60" },
    ],
  },

  "thompson-distribution": {
    workers: [
      { id: 1, name: "Charlie Mitchell", dept: "Service", role: "Master Tech — International", avatar: "CM", color: "#C9A84C", safetyStreak: 188, personalBest: 188, incidentFreeZone: "Bay 1-4", weeklyStats: { sopsCreated: 1, incidentsReported: 0, complianceScans: 4, bountiesClaimed: 2, shiftsCompleted: 5 }, roi: 11200, roiBreakdown: { sopValue: 1200, safetyValue: 4000, complianceValue: 6000 }, badges: ["🏆 Master Tech", "🔥 188-Day Streak", "🔧 Diagnostic King"], trend: "up" },
      { id: 2, name: "Linda Parsons", dept: "Parts", role: "Parts Manager", avatar: "LP", color: "#6495ED", safetyStreak: 95, personalBest: 130, incidentFreeZone: "Parts Counter", weeklyStats: { sopsCreated: 0, incidentsReported: 0, complianceScans: 6, bountiesClaimed: 1, shiftsCompleted: 5 }, roi: 7800, roiBreakdown: { sopValue: 0, safetyValue: 0, complianceValue: 7800 }, badges: ["📦 Parts Oracle", "✅ Inventory Ace"], trend: "up" },
      { id: 3, name: "Marcus Hill", dept: "Service", role: "Technician (New)", avatar: "MH", color: "#E67E22", safetyStreak: 5, personalBest: 5, incidentFreeZone: "Bay 5-6", weeklyStats: { sopsCreated: 0, incidentsReported: 0, complianceScans: 1, bountiesClaimed: 0, shiftsCompleted: 3 }, roi: 0, roiBreakdown: { sopValue: 0, safetyValue: 0, complianceValue: 0 }, badges: ["🌱 New Hire"], trend: "new" },
      { id: 4, name: "Ray Booker", dept: "Service", role: "Service Manager — Knoxville", avatar: "RB", color: "#4a6540", safetyStreak: 120, personalBest: 145, incidentFreeZone: "Knoxville Shop", weeklyStats: { sopsCreated: 2, incidentsReported: 1, complianceScans: 5, bountiesClaimed: 0, shiftsCompleted: 5 }, roi: 9400, roiBreakdown: { sopValue: 2400, safetyValue: 3200, complianceValue: 3800 }, badges: ["🛡️ Safety Leader", "📋 SOP Builder"], trend: "stable" },
      { id: 5, name: "Tammy Fulton", dept: "Admin", role: "Warranty Coordinator", avatar: "TF", color: "#8E44AD", safetyStreak: 310, personalBest: 310, incidentFreeZone: "Office", weeklyStats: { sopsCreated: 0, incidentsReported: 0, complianceScans: 15, bountiesClaimed: 0, shiftsCompleted: 5 }, roi: 18500, roiBreakdown: { sopValue: 0, safetyValue: 0, complianceValue: 18500 }, badges: ["💰 Warranty Recovery Queen", "🔥 310-Day Record"], trend: "up" },
    ],
    zoneStreaks: [
      { zone: "Parts Counter", streak: 280, icon: "📦", color: "#C9A84C" },
      { zone: "Service Bay 1-4", streak: 188, icon: "🔧", color: "#4a6540" },
      { zone: "Collision Center", streak: 95, icon: "🎨", color: "#6495ED" },
      { zone: "Wash Bay", streak: 67, icon: "💧", color: "#3498DB" },
      { zone: "Service Bay 5-6", streak: 42, icon: "🔧", color: "#E67E22" },
      { zone: "Customer Lot", streak: 15, icon: "🚛", color: "#8E44AD" },
      { zone: "Loading Dock", streak: 8, icon: "📦", color: "#c0392b" },
    ],
  },

  "kings-home": {
    workers: [
      { id: 1, name: "Shea Bailey", dept: "Youth Programs", role: "Day Shift Supervisor", avatar: "SB", color: "#3B77BB", safetyStreak: 156, personalBest: 156, incidentFreeZone: "Chelsea Campus", weeklyStats: { sopsCreated: 1, incidentsReported: 2, complianceScans: 6, bountiesClaimed: 0, shiftsCompleted: 5 }, roi: 8200, roiBreakdown: { sopValue: 1200, safetyValue: 3500, complianceValue: 3500 }, badges: ["🏆 Shift Leader", "🔥 156-Day Streak", "📋 Documentation Pro"], trend: "up" },
      { id: 2, name: "Dorothy Mae Williams", dept: "Youth Programs", role: "Senior Houseparent — Oak Hill", avatar: "DW", color: "#8E44AD", safetyStreak: 245, personalBest: 245, incidentFreeZone: "Oak Hill Cottage", weeklyStats: { sopsCreated: 0, incidentsReported: 1, complianceScans: 3, bountiesClaimed: 3, shiftsCompleted: 5 }, roi: 15800, roiBreakdown: { sopValue: 0, safetyValue: 5800, complianceValue: 10000 }, badges: ["🧠 Knowledge Keeper", "🔥 245-Day Record", "💜 25 Years of Service"], trend: "up" },
      { id: 3, name: "Tasha Davis", dept: "Youth Programs", role: "Relief Staff (New)", avatar: "TD", color: "#E67E22", safetyStreak: 2, personalBest: 2, incidentFreeZone: "Oak Hill", weeklyStats: { sopsCreated: 0, incidentsReported: 0, complianceScans: 0, bountiesClaimed: 0, shiftsCompleted: 1 }, roi: 0, roiBreakdown: { sopValue: 0, safetyValue: 0, complianceValue: 0 }, badges: ["🌱 New Hire"], trend: "new" },
      { id: 4, name: "Kevin Marshall", dept: "Youth Programs", role: "Night Shift Supervisor", avatar: "KM", color: "#4a6540", safetyStreak: 180, personalBest: 200, incidentFreeZone: "All Cottages", weeklyStats: { sopsCreated: 1, incidentsReported: 0, complianceScans: 2, bountiesClaimed: 1, shiftsCompleted: 5 }, roi: 5400, roiBreakdown: { sopValue: 1200, safetyValue: 0, complianceValue: 4200 }, badges: ["🌙 Night Watch", "🛡️ Zero Incidents"], trend: "stable" },
      { id: 5, name: "Sherry Gulsby", dept: "Women & Children", role: "Intake Coordinator", avatar: "SG", color: "#3B77BB", safetyStreak: 110, personalBest: 110, incidentFreeZone: "Bethany House", weeklyStats: { sopsCreated: 0, incidentsReported: 1, complianceScans: 8, bountiesClaimed: 0, shiftsCompleted: 5 }, roi: 12400, roiBreakdown: { sopValue: 0, safetyValue: 4400, complianceValue: 8000 }, badges: ["✅ Compliance Champion", "💜 Intake Expert"], trend: "up" },
    ],
    zoneStreaks: [
      { zone: "Oak Hill Cottage", streak: 245, icon: "🏠", color: "#3B77BB" },
      { zone: "Jane's House (TLP)", streak: 180, icon: "🏠", color: "#4a6540" },
      { zone: "Bethany House", streak: 110, icon: "💜", color: "#8E44AD" },
      { zone: "Hannah Home", streak: 95, icon: "💜", color: "#6495ED" },
      { zone: "Admin Building", streak: 320, icon: "🏢", color: "#C49B2A" },
      { zone: "Cedar Ridge", streak: 12, icon: "🏠", color: "#E67E22" },
      { zone: "Elm Cottage", streak: 8, icon: "🏠", color: "#c0392b" },
    ],
  },

  "demo": {
    workers: [
      { id: 1, name: "Jim Rivera", dept: "Production", role: "Senior Operator", avatar: "JR", color: "#8E6B3E", safetyStreak: 142, personalBest: 142, incidentFreeZone: "Line A", weeklyStats: { sopsCreated: 2, incidentsReported: 1, complianceScans: 3, bountiesClaimed: 1, shiftsCompleted: 5 }, roi: 4850, roiBreakdown: { sopValue: 2400, safetyValue: 1200, complianceValue: 1250 }, badges: ["🏆 Top Contributor", "🔥 142-Day Streak", "📋 SOP Master"], trend: "up" },
      { id: 2, name: "Mary Chen", dept: "Quality", role: "QA Lead", avatar: "MC", color: "#4a6540", safetyStreak: 89, personalBest: 120, incidentFreeZone: "QC Lab", weeklyStats: { sopsCreated: 1, incidentsReported: 0, complianceScans: 8, bountiesClaimed: 0, shiftsCompleted: 5 }, roi: 6200, roiBreakdown: { sopValue: 1200, safetyValue: 0, complianceValue: 5000 }, badges: ["✅ Compliance Champion", "🔬 QC Expert"], trend: "up" },
      { id: 3, name: "Carlos Vega", dept: "Maintenance", role: "Maintenance Lead", avatar: "CV", color: "#6495ED", safetyStreak: 67, personalBest: 95, incidentFreeZone: "Maintenance Shop", weeklyStats: { sopsCreated: 1, incidentsReported: 2, complianceScans: 1, bountiesClaimed: 2, shiftsCompleted: 5 }, roi: 8400, roiBreakdown: { sopValue: 1200, safetyValue: 3200, complianceValue: 4000 }, badges: ["⚙️ Equipment Whisperer", "💰 Bounty Hunter"], trend: "stable" },
      { id: 4, name: "Maria Santos", dept: "Packaging", role: "Line Worker (New)", avatar: "MS", color: "#E67E22", safetyStreak: 3, personalBest: 3, incidentFreeZone: "Packaging", weeklyStats: { sopsCreated: 0, incidentsReported: 0, complianceScans: 0, bountiesClaimed: 0, shiftsCompleted: 2 }, roi: 0, roiBreakdown: { sopValue: 0, safetyValue: 0, complianceValue: 0 }, badges: ["🌱 New Hire"], trend: "new" },
      { id: 5, name: "Diane Atkins", dept: "Safety", role: "Safety Coordinator", avatar: "DA", color: "#8E44AD", safetyStreak: 210, personalBest: 210, incidentFreeZone: "Facility-Wide", weeklyStats: { sopsCreated: 0, incidentsReported: 3, complianceScans: 12, bountiesClaimed: 0, shiftsCompleted: 5 }, roi: 14200, roiBreakdown: { sopValue: 0, safetyValue: 8700, complianceValue: 5500 }, badges: ["🛡️ Safety Guardian", "🔥 210-Day Record", "👀 Eagle Eye"], trend: "up" },
    ],
    zoneStreaks: [
      { zone: "QC Lab", streak: 320, icon: "🔬", color: "#4a6540" },
      { zone: "Break Room", streak: 245, icon: "☕", color: "#6495ED" },
      { zone: "Production Line A", streak: 142, icon: "🏭", color: "#c49b2a" },
      { zone: "Maintenance Shop", streak: 67, icon: "⚙️", color: "#E67E22" },
      { zone: "Packaging", streak: 31, icon: "📦", color: "#8E44AD" },
      { zone: "Warehouse", streak: 4, icon: "📦", color: "#c0392b" },
      { zone: "Loading Dock", streak: 18, icon: "🚛", color: "#7a7462" },
      { zone: "Chemical Storage", streak: 52, icon: "⚗️", color: "#27AE60" },
    ],
  },
};

export default function scorecardSeed(clientKey) {
  return SEEDS[clientKey] || SEEDS["demo"];
}
