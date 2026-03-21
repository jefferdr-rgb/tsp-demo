// Shift Handoff seed data — per-client shift records

const SEEDS = {
  "sunshine-mills": [
    {
      id: "day-mar18", shift: "Day Shift", date: "March 18, 2026", time: "6:00 AM — 2:00 PM",
      supervisor: "Tommy Ratliff", crew: 34, status: "completed",
      summary: "Strong production day. Line 1 extruder ran clean — 98% uptime. Allergen changeover on Line 3 completed per SOP. One ingredient COA flagged and held. New hire Luis Garcia started in Packaging.",
      sections: [
        { title: "Production", icon: "🏭", items: [
          { text: "Line 1: Extruder ran 98% uptime. 47,000 lbs dry kibble produced. No unplanned stops.", status: "good" },
          { text: "Line 2: Scheduled maintenance on mixer bearings — back online by 10 AM. Lost 2 hours.", status: "warning" },
          { text: "Line 3: Allergen changeover completed (chicken → fish). Full line flush, swab test passed.", status: "good" },
          { text: "Packaging: New shrink wrapper calibration holding well. Zero rejects since Monday.", status: "good" },
        ]},
        { title: "Quality & Safety", icon: "🛡️", items: [
          { text: "Incoming COA flagged: Corn gluten meal protein at 58.2% — spec requires 60% min. Lot held pending QC review.", status: "danger" },
          { text: "Metal detector trip on Line 2 at 9:15 AM — false positive, verified with test wand. Documented.", status: "warning" },
          { text: "SQF internal audit: Warehouse Zone 3 passed. Next: Zone 4 (cold storage) tomorrow.", status: "good" },
        ]},
        { title: "Personnel", icon: "👥", items: [
          { text: "New hire Luis Garcia started — Packaging dept. Completed food safety orientation + allergen awareness.", status: "info" },
          { text: "Jim Rivera (Production Lead) leaving at noon Friday — dentist. Carlos covering Line 1.", status: "info" },
          { text: "Reminder: Monthly safety meeting Thursday 2 PM. All supervisors must attend.", status: "warning" },
        ]},
        { title: "Action Items for Swing Shift", icon: "📋", items: [
          { text: "PRIORITY: QC decision on held corn gluten meal lot. Need answer before morning receiving.", status: "danger" },
          { text: "Line 2 mixer — monitor bearing temp after repair. Log every 2 hours.", status: "warning" },
          { text: "Restock PPE station near Line 3 — gloves and ear plugs running low.", status: "info" },
        ]},
      ],
    },
    {
      id: "swing-mar17", shift: "Swing Shift", date: "March 17, 2026", time: "2:00 PM — 10:00 PM",
      supervisor: "Diane Atkins", crew: 28, status: "completed",
      summary: "Smooth shift. All three lines ran clean. Forklift inspection caught a hydraulic leak on Unit 7 — pulled from service. Night sanitation crew briefed on Line 3 allergen deep-clean.",
      sections: [
        { title: "Production", icon: "🏭", items: [
          { text: "Line 1: 44,200 lbs produced. Ran clean all shift. Kibble density within spec.", status: "good" },
          { text: "Line 2: Back to full speed after morning mixer repair. 38,100 lbs.", status: "good" },
          { text: "Line 3: Running fish formula until midnight. Packaging switching to 15lb bags for Aldi order.", status: "info" },
        ]},
        { title: "Safety", icon: "🛡️", items: [
          { text: "Forklift #7 hydraulic leak caught during pre-shift inspection. Tagged out. Maintenance notified.", status: "warning" },
          { text: "Slip hazard near wash station cleaned and coned. Drain cover replaced.", status: "good" },
        ]},
        { title: "Action Items for Night/Morning", icon: "📋", items: [
          { text: "Night sanitation: Line 3 allergen deep-clean before morning changeover to chicken formula.", status: "warning" },
          { text: "Forklift #7 needs hydraulic line replaced. Parts on-site. Maintenance to handle first thing AM.", status: "warning" },
        ]},
      ],
    },
  ],

  "thompson-distribution": [
    {
      id: "day-mar18", shift: "Day Shift", date: "March 18, 2026", time: "7:00 AM — 5:00 PM",
      supervisor: "Ray Booker", crew: 18, status: "completed",
      summary: "Busy day. 14 trucks in service bays, 3 warranty claims filed. Parts delivery from Nashville warehouse arrived — 47 line items, 2 shorts. New tech Marcus Hill started in Chattanooga.",
      sections: [
        { title: "Service Bays", icon: "🔧", items: [
          { text: "Bay 1-4 (International): 6 trucks completed. DT466 injector replace on Unit 2847 — warranty claim filed ($4,200).", status: "good" },
          { text: "Bay 5-6 (Ford): F-750 brake job and F-650 electrical issue. Electrical still diagnosing — intermittent no-start.", status: "warning" },
          { text: "Bay 7 (Isuzu): NPR cabover clutch replacement. Parts on backorder — ETA Thursday.", status: "warning" },
          { text: "Collision Center: Freightliner cab repair — 3 more days. Customer notified.", status: "info" },
        ]},
        { title: "Parts & Inventory", icon: "📦", items: [
          { text: "Nashville shipment received: 47 line items, 45 confirmed. 2 shorts — International air filters and Ford brake rotors. Reorder placed.", status: "warning" },
          { text: "Corona warehouse transfer request: 12 Honda generator units for rental fleet. Ships tomorrow.", status: "info" },
          { text: "Warranty recovery: $4,200 International injector + $1,800 Ford alternator = $6,000 filed today.", status: "good" },
        ]},
        { title: "Personnel", icon: "👥", items: [
          { text: "New tech Marcus Hill started — Chattanooga service. ASE certified, needs OEM portal training (International + Ford).", status: "info" },
          { text: "Charlie Mitchell (Master Tech) out Friday — daughter's graduation. Senior techs covering diagnostics.", status: "info" },
        ]},
        { title: "Action Items for Tomorrow", icon: "📋", items: [
          { text: "F-650 electrical diagnosis — Ray needs to pull wiring diagram. Check TSB for known no-start issues.", status: "warning" },
          { text: "3 CDL medical cards expiring within 30 days. HR notified — drivers need appointments.", status: "danger" },
          { text: "Isuzu NPR clutch parts — confirm backorder ETA Thursday. Customer waiting.", status: "warning" },
        ]},
      ],
    },
    {
      id: "day-mar17", shift: "Day Shift", date: "March 17, 2026", time: "7:00 AM — 5:00 PM",
      supervisor: "Linda Parsons", crew: 16, status: "completed",
      summary: "Parts-heavy day. Quarterly inventory count started — Corona warehouse. 3 discrepancies found so far. Service bays steady. DOT inspection tomorrow at Morristown — all trucks staged.",
      sections: [
        { title: "Parts & Distribution", icon: "📦", items: [
          { text: "Quarterly count started at Corona. 3 discrepancies found: 2 International oil filters miscounted, 1 Isuzu belt mislocated.", status: "warning" },
          { text: "MTA rental fleet: 8 Honda generators shipped to Nashville. All serial numbers logged.", status: "good" },
        ]},
        { title: "Service", icon: "🔧", items: [
          { text: "11 trucks through bays today. No warranty claims. Routine maintenance day.", status: "good" },
          { text: "Morristown DOT inspection tomorrow — 4 trucks staged. All pre-inspected and paperwork ready.", status: "good" },
        ]},
        { title: "Action Items", icon: "📋", items: [
          { text: "Resolve 3 inventory discrepancies before count resumes Wednesday.", status: "warning" },
          { text: "DOT inspection at Morristown — Ray driving over to supervise. Leave by 6:30 AM.", status: "info" },
        ]},
      ],
    },
  ],

  "kings-home": [
    {
      id: "day-mar18", shift: "Day Shift", date: "March 18, 2026", time: "7:00 AM — 3:00 PM",
      supervisor: "Shea Bailey", crew: 22, status: "completed",
      summary: "Solid day across all cottages. One behavioral incident at Cedar Ridge (resolved, no restraint). New intake at Bethany House 3 — woman and two children fleeing DV. All med passes on time. TLP youth SM and JC both at work on time.",
      sections: [
        { title: "Cottage Updates", icon: "🏠", items: [
          { text: "Oak Hill: Quiet day. RH adjusting well — engaged in group activity for first time. MT passed math test (big milestone).", status: "good" },
          { text: "Cedar Ridge: MC had verbal altercation with BT at 11 AM. De-escalated without restraint. Separated for 30-min cool-down. Counselor notified.", status: "warning" },
          { text: "Jane's House: All TLP girls managing routines independently. DR practiced grocery shopping with budget — stayed under $40.", status: "good" },
          { text: "Elm Cottage: TB's 6-month QRTP review is 10 days overdue. MUST be scheduled this week.", status: "danger" },
        ]},
        { title: "Safety & Incidents", icon: "🛡️", items: [
          { text: "MC/BT verbal altercation at Cedar Ridge — de-escalated successfully. Incident report filed by James Young.", status: "warning" },
          { text: "All medication passes completed on time across all cottages. Zero discrepancies.", status: "good" },
          { text: "Building safety walk completed: Chelsea Main campus — no issues found.", status: "good" },
        ]},
        { title: "Women & Children", icon: "💜", items: [
          { text: "NEW INTAKE: Woman + 2 children (ages 4, 7) admitted to Bethany House 3. Fleeing DV — husband arrested then released on bond. Sherry Gulsby completed intake.", status: "warning" },
          { text: "Hannah Home 2: Keisha W. had two apartment viewings — strong options near her work. Transition planning on track.", status: "good" },
          { text: "Ashley D. (Hannah Home 1): Move-in date confirmed April 1. Transition planning meeting completed.", status: "good" },
        ]},
        { title: "Personnel", icon: "👥", items: [
          { text: "New relief staff member (Tasha Davis) completed Day 1 orientation — shadowing at Oak Hill tomorrow.", status: "info" },
          { text: "Reminder: Mark & Sarah Collins (Oak Hill houseparents) on scheduled respite this weekend. Relief couple covering.", status: "info" },
          { text: "Monthly supervision logs: 3 of 6 supervisors have completed March logs. Remaining 3 due by March 25.", status: "warning" },
        ]},
        { title: "Action Items for Evening/Night", icon: "📋", items: [
          { text: "PRIORITY: Schedule TB's 6-month QRTP review — 10 days overdue. Contact Dr. Monroe's office first thing AM.", status: "danger" },
          { text: "Extra check-ins for new intake at Bethany House 3 — children may be unsettled first night.", status: "warning" },
          { text: "MC at Cedar Ridge needs monitoring tonight. Two incidents this week. Counselor session scheduled for tomorrow.", status: "warning" },
          { text: "RH at Oak Hill: extra bedtime check-in (still adjusting, day 8). Homesick pattern continues evenings.", status: "info" },
        ]},
      ],
    },
    {
      id: "night-mar17", shift: "Night Shift", date: "March 17, 2026", time: "11:00 PM — 7:00 AM",
      supervisor: "Kevin Marshall", crew: 8, status: "completed",
      summary: "Quiet night. One youth at Oak Hill (RH) needed extra support around midnight — missing family. Sat with him until he fell asleep. All cottages secure by 11:30 PM. No incidents.",
      sections: [
        { title: "Cottage Updates", icon: "🏠", items: [
          { text: "Oak Hill: RH woke up crying at midnight. Staff sat with him on the porch for 20 minutes. Settled back to sleep by 12:30.", status: "warning" },
          { text: "Cedar Ridge: All youth asleep by 10:30. Quiet night.", status: "good" },
          { text: "Jane's House: LW studying for college exam until 11:45 PM. All others asleep by 10.", status: "good" },
        ]},
        { title: "Safety", icon: "🛡️", items: [
          { text: "No incidents reported overnight.", status: "good" },
          { text: "All buildings secured. Perimeter check completed at 11:30 PM and 3:00 AM.", status: "good" },
        ]},
        { title: "Action Items for Day Shift", icon: "📋", items: [
          { text: "RH at Oak Hill needs extra morning attention — rough night. Consider calling DHR caseworker about scheduling phone call with mom.", status: "warning" },
          { text: "EG at Elm Cottage: watch for regression behaviors — transition from Moderate is still fresh.", status: "info" },
        ]},
      ],
    },
  ],

  "demo": [
    {
      id: "day-mar18", shift: "Day Shift", date: "March 18, 2026", time: "7:00 AM — 3:00 PM",
      supervisor: "Mike Johnson", crew: 24, status: "completed",
      summary: "Good production day. One safety near-miss caught and reported. New hire orientation completed. Equipment maintenance on schedule.",
      sections: [
        { title: "Operations", icon: "⚙️", items: [
          { text: "Production targets met across all lines. 97% efficiency.", status: "good" },
          { text: "Scheduled maintenance on Unit 4 completed — back online by 10 AM.", status: "good" },
          { text: "Inventory count: 3 discrepancies found in Warehouse B. Investigating.", status: "warning" },
        ]},
        { title: "Safety", icon: "🛡️", items: [
          { text: "Near-miss reported: Wet floor near loading dock. Cleaned and coned immediately.", status: "warning" },
          { text: "Monthly fire extinguisher inspection completed. All units passed.", status: "good" },
        ]},
        { title: "Personnel", icon: "👥", items: [
          { text: "New hire Maria Santos completed Day 1 orientation.", status: "info" },
          { text: "Reminder: Safety meeting Thursday at 2 PM.", status: "info" },
        ]},
        { title: "Action Items", icon: "📋", items: [
          { text: "Resolve warehouse inventory discrepancies by EOD Wednesday.", status: "warning" },
          { text: "Order replacement PPE — gloves running low.", status: "info" },
        ]},
      ],
    },
  ],
};

export default function shiftHandoffSeed(clientKey) {
  return SEEDS[clientKey] || SEEDS["demo"];
}
