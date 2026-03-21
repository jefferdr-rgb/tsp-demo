// Seed dispatcher — only imports seeds that exist.
// Returns null for tools without seed files (most of them).

import roiDashboard from "./roi-dashboard.js";
import shiftHandoff from "./shift-handoff.js";
import scorecard from "./scorecard.js";

const SEED_MAP = {
  "roi-dashboard": roiDashboard,
  "shift-handoff": shiftHandoff,
  "scorecard": scorecard,
};

export function getSeedData(toolId, clientKey) {
  const seedFn = SEED_MAP[toolId];
  if (!seedFn) return null;
  return seedFn(clientKey || "demo");
}
