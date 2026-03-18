"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
  purple: "#7C3AED",
};

// Community resources relevant to Kings Home's Women & Children program
// Covers: Jefferson, Shelby, Blount, Tuscaloosa counties
const RESOURCE_CATEGORIES = [
  {
    category: "Education & GED",
    icon: "📚",
    resources: [
      { name: "Jefferson State Community College — GED Program", location: "Birmingham", phone: "(205) 856-7764", notes: "Free GED prep classes. Evening sessions available. Childcare referrals.", counties: ["Jefferson", "Shelby"] },
      { name: "Shelby County Literacy Council", location: "Columbiana", phone: "(205) 669-4020", notes: "Free adult literacy and GED tutoring. Flexible scheduling.", counties: ["Shelby"] },
      { name: "Alabama Career Center — Homewood", location: "Homewood", phone: "(205) 942-3959", notes: "GED testing center. Job readiness workshops. Resume assistance.", counties: ["Jefferson"] },
      { name: "Tuscaloosa Adult Education Center", location: "Tuscaloosa", phone: "(205) 759-3585", notes: "GED prep, ESL classes, and digital literacy.", counties: ["Tuscaloosa"] },
    ],
  },
  {
    category: "Employment & Job Training",
    icon: "💼",
    resources: [
      { name: "Goodwill Industries — Career Services", location: "Birmingham", phone: "(205) 323-6331", notes: "Job training, placement assistance, interview coaching. Multiple locations.", counties: ["Jefferson", "Shelby"] },
      { name: "WorkForce Development — WIOA Programs", location: "Multiple", phone: "(205) 254-1300", notes: "Federally funded job training. Covers tuition for approved programs. Must qualify.", counties: ["Jefferson", "Shelby", "Blount", "Tuscaloosa"] },
      { name: "Dress for Success — Birmingham", location: "Birmingham", phone: "(205) 324-8947", notes: "Professional clothing for job interviews. Career development programs for women.", counties: ["Jefferson", "Shelby"] },
      { name: "Prodigal Pottery (Kings Home)", location: "Chelsea", phone: "(205) 678-8331", notes: "In-house therapeutic employment. Handmade pottery program for women in recovery.", counties: ["Shelby"] },
    ],
  },
  {
    category: "Legal Aid",
    icon: "⚖️",
    resources: [
      { name: "Legal Aid Society of Birmingham", location: "Birmingham", phone: "(205) 328-3540", notes: "Free legal services for low-income residents. Protective orders, custody, divorce.", counties: ["Jefferson", "Shelby", "Blount"] },
      { name: "Alabama Legal Help Hotline", location: "Statewide", phone: "1-866-456-4995", notes: "Free legal information and referral. Available Monday-Friday 9-4.", counties: ["Jefferson", "Shelby", "Blount", "Tuscaloosa"] },
      { name: "Volunteer Lawyers Birmingham", location: "Birmingham", phone: "(205) 250-5198", notes: "Pro bono legal representation. Domestic violence cases prioritized.", counties: ["Jefferson"] },
      { name: "West Alabama Legal Services", location: "Tuscaloosa", phone: "(205) 758-7503", notes: "Free civil legal aid including DV cases, housing, benefits.", counties: ["Tuscaloosa"] },
    ],
  },
  {
    category: "Childcare",
    icon: "👶",
    resources: [
      { name: "DHR Child Care Assistance (CCDF)", location: "County DHR offices", phone: "Varies by county", notes: "Subsidized childcare for working parents or those in training programs. Apply through county DHR.", counties: ["Jefferson", "Shelby", "Blount", "Tuscaloosa"] },
      { name: "Head Start — Jefferson County", location: "Multiple locations", phone: "(205) 923-0923", notes: "Free preschool for ages 3-5 from low-income families. Full-day and half-day options.", counties: ["Jefferson"] },
      { name: "Kings Home Childcare", location: "On-campus", phone: "(205) 678-8331", notes: "Free childcare provided to all Women & Children program residents during programming hours.", counties: ["Shelby"] },
    ],
  },
  {
    category: "Housing & Transitional Living",
    icon: "🏠",
    resources: [
      { name: "Birmingham Housing Authority", location: "Birmingham", phone: "(205) 521-0606", notes: "Section 8 vouchers, public housing. Long waitlists — apply early.", counties: ["Jefferson"] },
      { name: "Habitat for Humanity — Greater Birmingham", location: "Birmingham", phone: "(205) 592-8828", notes: "Affordable home ownership program. Must meet income guidelines and volunteer hours.", counties: ["Jefferson", "Shelby"] },
      { name: "One Roof — Homeless Services", location: "Birmingham", phone: "211", notes: "Coordinated entry for homeless services. Housing navigation and rapid re-housing.", counties: ["Jefferson", "Shelby"] },
      { name: "Shelby Emergency Assistance", location: "Pelham", phone: "(205) 663-1922", notes: "Emergency rent and utility assistance for Shelby County residents.", counties: ["Shelby"] },
    ],
  },
  {
    category: "Mental Health & Counseling",
    icon: "🧠",
    resources: [
      { name: "JBS Mental Health Authority", location: "Birmingham", phone: "(205) 836-1313", notes: "Sliding-scale mental health services. Crisis line: (205) 323-7777. Walk-ins accepted.", counties: ["Jefferson", "Shelby", "Blount"] },
      { name: "Kings Home Counseling Services", location: "On-campus", phone: "(205) 678-8331", notes: "Individual and group counseling for all residents. Trauma-informed approach.", counties: ["Shelby"] },
      { name: "Indian Rivers Community Mental Health", location: "Tuscaloosa", phone: "(205) 391-3131", notes: "Comprehensive mental health and substance abuse services.", counties: ["Tuscaloosa"] },
      { name: "National DV Hotline", location: "24/7", phone: "1-800-799-7233", notes: "24-hour crisis support, safety planning, and referrals. Text START to 88788.", counties: ["Jefferson", "Shelby", "Blount", "Tuscaloosa"] },
    ],
  },
  {
    category: "Financial Literacy & Benefits",
    icon: "💰",
    resources: [
      { name: "Operation HOPE — Financial Coaching", location: "Birmingham", phone: "(888) 388-4673", notes: "Free financial coaching, credit counseling, and budgeting workshops.", counties: ["Jefferson"] },
      { name: "Alabama Medicaid", location: "County offices", phone: "1-800-362-1504", notes: "Healthcare coverage for qualifying adults and children. Apply at county DHR.", counties: ["Jefferson", "Shelby", "Blount", "Tuscaloosa"] },
      { name: "SNAP / Food Assistance", location: "County DHR offices", phone: "1-800-382-0499", notes: "Food assistance benefits. Apply online at MyDHR.Alabama.gov.", counties: ["Jefferson", "Shelby", "Blount", "Tuscaloosa"] },
      { name: "Low Income Home Energy Assistance (LIHEAP)", location: "Community Action agencies", phone: "Varies", notes: "Help with utility bills. Apply through local Community Action agency.", counties: ["Jefferson", "Shelby", "Blount", "Tuscaloosa"] },
    ],
  },
];

export default function ResourceNavigatorPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [countyFilter, setCountyFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const counties = ["Jefferson", "Shelby", "Blount", "Tuscaloosa"];
  const totalResources = RESOURCE_CATEGORIES.reduce((s, c) => s + c.resources.length, 0);

  const filteredCategories = RESOURCE_CATEGORIES.map(cat => ({
    ...cat,
    resources: cat.resources.filter(r => {
      const matchesCounty = countyFilter === "all" || r.counties.includes(countyFilter);
      const matchesSearch = !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.notes.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCounty && matchesSearch;
    }),
  })).filter(cat => cat.resources.length > 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Resource Navigator</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(124,58,237,0.15)", color: "#C4B5FD", fontSize: 11, fontWeight: 700 }}>Women & Children</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Search and filter */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search resources..."
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, background: C.surface }} />
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setCountyFilter("all")}
              style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${countyFilter === "all" ? C.accent : C.border}`, background: countyFilter === "all" ? C.accentLight : C.surface, color: countyFilter === "all" ? C.accent : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              All Counties
            </button>
            {counties.map(county => (
              <button key={county} onClick={() => setCountyFilter(county)}
                style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${countyFilter === county ? C.accent : C.border}`, background: countyFilter === county ? C.accentLight : C.surface, color: countyFilter === county ? C.accent : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {county}
              </button>
            ))}
          </div>
        </div>

        {/* Category cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {RESOURCE_CATEGORIES.map(cat => {
            const filtered = cat.resources.filter(r => countyFilter === "all" || r.counties.includes(countyFilter));
            return (
              <div key={cat.category} onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
                style={{
                  background: C.surface, borderRadius: 10, border: `1.5px solid ${selectedCategory === cat.category ? C.accent : C.border}`,
                  padding: 16, cursor: "pointer", textAlign: "center",
                }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cat.category}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</div>
              </div>
            );
          })}
        </div>

        {/* Resource listings */}
        {filteredCategories.map(cat => (
          (selectedCategory === null || selectedCategory === cat.category) && (
            <div key={cat.category} style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{cat.icon}</span> {cat.category}
              </h2>
              {cat.resources.map((r, i) => (
                <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: 16, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                        {r.location} &middot; <span style={{ color: C.accent, fontWeight: 600 }}>{r.phone}</span>
                      </div>
                      <div style={{ fontSize: 13, color: C.text, marginTop: 6, lineHeight: 1.5 }}>{r.notes}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 12 }}>
                      {r.counties.map(county => (
                        <span key={county} style={{ padding: "2px 6px", borderRadius: 4, background: C.accentLight, color: C.accent, fontSize: 10, fontWeight: 600 }}>{county}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
