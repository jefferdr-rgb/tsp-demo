"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
  purple: "#7C3AED",
};

const SECTIONS = [
  {
    title: "De-Escalation Techniques",
    icon: "🌊",
    description: "When a youth or resident is escalating, use these evidence-based techniques before any physical intervention.",
    content: [
      { heading: "CALM Framework", body: "**C**onnect — Make eye contact, use their name, lower your voice. \"I can see you're upset. I'm here.\"\n**A**ssess — Is this flight, fight, or freeze? Adjust your approach accordingly.\n**L**isten — Reflect what you hear. \"It sounds like you're feeling...\" Don't argue or correct.\n**M**ove — Suggest a physical change. Walk together, go outside, get water. Movement resets the nervous system." },
      { heading: "Environmental Strategies", body: "• Reduce stimulation — turn off music, lower lights, ask bystanders to step away\n• Offer a private space — \"Want to talk somewhere quieter?\"\n• Remove audience — peers witnessing the escalation increases shame and intensity\n• Use transition objects — stress balls, weighted blankets, headphones with calming music" },
      { heading: "Things to AVOID", body: "• Standing over or towering — get on their level\n• Crossing arms or pointing — open, non-threatening posture\n• \"Calm down\" — this almost always escalates. Instead: \"I'm going to stay right here with you.\"\n• Ultimatums during crisis — consequences come after the storm, not during\n• Physical touch without permission — ask first, even a hand on the shoulder" },
      { heading: "After De-Escalation", body: "• Wait at least 30 minutes before processing the incident\n• Acknowledge their effort: \"That was really hard, and you got through it.\"\n• Document what worked so the team knows for next time\n• Check on yourself — secondary stress is real" },
    ],
  },
  {
    title: "TF-CBT Protocol Overview",
    icon: "🧠",
    description: "Trauma-Focused Cognitive Behavioral Therapy — Kings Home's primary evidence-based treatment model.",
    content: [
      { heading: "What is TF-CBT?", body: "Trauma-Focused Cognitive Behavioral Therapy is an evidence-based treatment for children and adolescents who have experienced trauma. It integrates trauma-sensitive interventions with cognitive behavioral, family, and humanistic principles.\n\nResearch shows TF-CBT reduces PTSD, depression, anxiety, and behavioral problems in traumatized youth. It is the gold standard for residential treatment." },
      { heading: "The PRACTICE Components", body: "**P**sychoeducation & **P**arenting skills — Teach about trauma reactions. Normalize responses.\n**R**elaxation — Deep breathing, progressive muscle relaxation, mindfulness\n**A**ffective modulation — Identify and manage difficult emotions\n**C**ognitive coping — Connect thoughts, feelings, and behaviors\n**T**rauma narrative — Gradually process the trauma story (with therapist only)\n**I**n vivo mastery — Gradually face trauma reminders in safe environments\n**C**onjoint sessions — Include caregivers when appropriate\n**E**nhancing safety — Build safety skills and future planning" },
      { heading: "Staff Role (Non-Clinical)", body: "Houseparents and direct care staff are NOT doing TF-CBT — that's the therapist's job. But you create the environment that makes therapy work:\n\n• Use the same language the therapist uses with each youth\n• Reinforce coping skills learned in session (\"I noticed you used your breathing technique — that was great\")\n• Report observations to the treatment team\n• Maintain predictability and safety in the cottage\n• Never ask a youth to retell their trauma story — that's for therapy only" },
    ],
  },
  {
    title: "Recognizing Trauma Responses",
    icon: "👁️",
    description: "Understanding WHY behavior happens changes HOW you respond.",
    content: [
      { heading: "Fight Responses", body: "Looks like: Aggression, defiance, arguing, physical confrontation, destroying property\nReally is: The nervous system perceiving threat and preparing to defend\nHow to respond: De-escalate (see above). Don't take it personally. The youth is fighting a threat from the past, not you." },
      { heading: "Flight Responses", body: "Looks like: Running away, hiding, skipping school, avoiding activities, social withdrawal\nReally is: The nervous system saying \"get away from danger\"\nHow to respond: Don't chase (unless safety risk). Create space. Offer a safe place to be. \"I'll be here when you're ready.\"" },
      { heading: "Freeze Responses", body: "Looks like: Shutting down, going blank, not responding, dissociation, \"spacing out\"\nReally is: Overwhelm — the nervous system has given up on fight or flight\nHow to respond: Ground them gently. \"Can you feel your feet on the floor?\" \"What do you see in this room?\" Don't demand eye contact or immediate responses." },
      { heading: "Fawn Responses", body: "Looks like: People-pleasing, being overly compliant, not expressing needs, agreeing to everything\nReally is: Survival strategy — \"if I make everyone happy, I won't get hurt\"\nHow to respond: Gently encourage authentic expression. \"It's okay to say no here.\" \"What do YOU actually want?\" This is easy to miss because it looks like good behavior." },
      { heading: "Triggers to Watch For", body: "• Anniversaries of traumatic events (birthdays, holidays, court dates)\n• Sensory reminders (smells, sounds, physical touch)\n• Authority figures raising voices\n• Transitions and changes in routine\n• Feeling trapped or cornered (literally or figuratively)\n• Rejection or perceived abandonment\n• Food insecurity — hoarding food is a trauma response, not stealing" },
    ],
  },
  {
    title: "Secondary Trauma & Self-Care",
    icon: "💚",
    description: "You can't pour from an empty cup. Caring for traumatized people affects YOU.",
    content: [
      { heading: "What is Secondary Traumatic Stress?", body: "Working closely with traumatized youth and families can cause symptoms that mirror PTSD:\n• Intrusive thoughts about residents' stories\n• Difficulty sleeping or nightmares\n• Emotional numbness or cynicism\n• Hypervigilance even when off duty\n• Feeling helpless or hopeless\n• Physical symptoms (headaches, stomach problems, fatigue)\n\nThis is NOT weakness. It is the cost of caring. It happens to the best staff." },
      { heading: "Daily Practices", body: "• Transition ritual when leaving work — change clothes, listen to music, take a different route home\n• Move your body — exercise is the most effective trauma discharge\n• Talk about it — use supervision, peer support, or EAP (not social media)\n• Set boundaries with work — you are not on call for everyone's pain 24/7\n• Do something that is YOURS — a hobby, a relationship, a space that has nothing to do with work" },
      { heading: "Warning Signs You Need Help", body: "• Dreading going to work when you used to love it\n• Snapping at family or friends at home\n• Using alcohol or substances to cope\n• Feeling like nothing you do matters\n• Avoiding certain residents or situations\n• Crying more easily or not being able to cry at all\n\nIf you notice these: Talk to your supervisor. Use the Kings Home EAP. You deserve the same care you give the residents." },
      { heading: "Kings Home Resources", body: "• Monthly supervision with your supervisor — USE IT for processing, not just logistics\n• Employee Assistance Program (EAP) — confidential, free, for you and your family\n• Peer support circles — second Thursday of each month\n• Quarterly wellness days — approved time off for self-care\n• RHONDA can help you find local counseling resources (ask me)" },
    ],
  },
  {
    title: "Restraint Policy Quick Reference",
    icon: "📋",
    description: "Kings Home restraint policy — know before you need it.",
    content: [
      { heading: "Core Principle", body: "Physical restraint is ALWAYS the last resort. Every other de-escalation technique must be attempted first. The goal is ZERO restraints — not as a rule, but as a reflection of our care quality." },
      { heading: "When Restraint is Permitted", body: "ONLY when there is imminent risk of:\n• Serious physical harm to the youth themselves\n• Serious physical harm to another person\n\nNOT permitted for:\n• Property destruction alone\n• Verbal aggression or threats\n• Non-compliance or defiance\n• Convenience or punishment\n• Running away (unless into immediate physical danger)" },
      { heading: "Approved Techniques", body: "• Only Kings Home-approved physical holds may be used\n• Standing or seated positions ONLY — prone (face-down) restraints are NEVER permitted\n• Minimum force necessary\n• Continuously monitor breathing, circulation, and emotional state\n• Release as soon as the imminent danger passes\n• Maximum duration: as brief as possible, never punitive" },
      { heading: "After Any Restraint", body: "1. Medical check of the youth within 15 minutes\n2. Staff debriefing within 1 hour\n3. Incident report completed before end of shift\n4. Youth debriefing within 24 hours (\"What happened? What could we do differently?\")\n5. Supervisor review within 48 hours\n6. Family notification within 24 hours\n7. Added to quarterly restraint reduction data review" },
    ],
  },
];

export default function TraumaGuidePage() {
  const [selectedSection, setSelectedSection] = useState(0);
  const section = SECTIONS[selectedSection];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Trauma-Informed Guide</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,119,187,0.15)", color: "#7FB3E0", fontSize: 11, fontWeight: 700 }}>Care Best Practices</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
          {/* Section nav */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Reference Guide</div>
            {SECTIONS.map((sec, i) => (
              <div key={i} onClick={() => setSelectedSection(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, marginBottom: 6, cursor: "pointer",
                  background: selectedSection === i ? C.accentLight : C.surface,
                  border: `1.5px solid ${selectedSection === i ? C.accent : C.border}`,
                }}>
                <span style={{ fontSize: 22 }}>{sec.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedSection === i ? C.accent : C.text }}>{sec.title}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sec.description.substring(0, 60)}...</div>
                </div>
              </div>
            ))}
            <div style={{ padding: 16, background: "rgba(59,119,187,0.06)", borderRadius: 10, marginTop: 12, border: `1px solid rgba(59,119,187,0.15)` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6 }}>Need more help?</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>Ask RHONDA for specific guidance — she can walk you through scenarios, help you write incident reports, or find resources for a particular situation.</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{section.icon}</span>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>{section.title}</h2>
            </div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>{section.description}</div>

            {section.content.map((item, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.accent, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${C.borderLight}` }}>{item.heading}</h3>
                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {item.body.split("\n").map((line, j) => {
                    if (line.startsWith("**") && line.includes("**")) {
                      const parts = line.split("**");
                      return (
                        <div key={j} style={{ marginBottom: 4 }}>
                          {parts.map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : <span key={k}>{part}</span>)}
                        </div>
                      );
                    }
                    if (line.startsWith("•")) {
                      return <div key={j} style={{ paddingLeft: 8, marginBottom: 4 }}>{line}</div>;
                    }
                    return <div key={j} style={{ marginBottom: line === "" ? 8 : 4 }}>{line}</div>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
