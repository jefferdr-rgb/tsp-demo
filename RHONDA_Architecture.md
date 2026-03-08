# RHONDA — Architecture & Deployment

**Status:** In Development
**Company:** Tree Stand Partners
**Last Updated:** 2026-03-07

---

## What RHONDA Is

AI dashboard for businesses — powered by Claude (Anthropic). Helps businesses weave AI into existing workflows without changing how they work. Clients log in via Google or Microsoft, then get access to email drafting, doc summarization, data organization, calendar help, customer responses, and general AI assistance.

**Pricing:** $500 setup + $250/month, no contracts
**API costs:** Covered by Tree Stand Partners (baked into pricing)
**Contact:** (256) 710-5689 · info@treestandpartners.com

---

## Current Stack

| Layer | Tech | Status |
|-------|------|--------|
| Frontend | React + Vite | ✅ Live on Vercel |
| Source control | GitHub (jefferdr-rgb/tsp-demo) | ✅ Active |
| Domain | treestandpartners.com (via Squarespace → Vercel) | ✅ Live |
| Demo | demo.treestandpartners.com | ✅ Live |
| Backend/API proxy | None | ❌ Missing |
| Auth | None (placeholder only) | ❌ Missing |
| File integrations | None | ❌ Not started |

---

## Critical Issue — API Key Exposed

**Problem:** `VITE_ANTHROPIC_API_KEY` is bundled into browser JavaScript. Anyone can open DevTools and steal it — then make unlimited API calls billed to Tree Stand Partners.

The code uses `anthropic-dangerous-direct-browser-access: true` — Anthropic named it that on purpose.

**Fix:** Add a Vercel serverless function as a proxy.

### Step 1 — Create `/api/chat.js`

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
```

### Step 2 — Update `App.jsx` fetch call

```javascript
// Replace the direct Anthropic call with:
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: SYSTEM_PROMPT + "\n\n" + (task?.systemExtra || ""),
    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
  }),
});
```

### Step 3 — Vercel environment variable

In Vercel dashboard → Settings → Environment Variables:
- Remove: `VITE_ANTHROPIC_API_KEY`
- Add: `ANTHROPIC_API_KEY` (no VITE_ prefix = server-side only)

---

## Deployment Roadmap

### Phase 1 — Secure the Foundation (Do First)
- [ ] Add `/api/chat.js` serverless proxy
- [ ] Move API key to server-side env var
- [ ] Move 5-message gate server-side (currently bypassable in DevTools)

### Phase 2 — Auth + Multi-Tenant
- [ ] Google OAuth (console.cloud.google.com — OAuth 2.0 client ID)
- [ ] Microsoft 365 OAuth (Azure AD app registration)
- [ ] Per-client branding ("Your Company" → actual client name)
- [ ] Client-specific configuration/routing

### Phase 3a — Standing Orders (Scheduled Automation)
*No auth required. Ships right after Phase 1.*

RHONDA works for clients even when they're not logged in. Clients give RHONDA instructions once — she follows them automatically on a schedule and delivers results to their inbox.

**Pre-built Standing Orders:**
1. Morning Briefing — weekdays 7am, priorities for the day
2. Weekly Digest — Monday 8am, week-ahead preparation
3. End of Week — Friday 4pm, recap and carry-overs
4. Custom — client writes their own instruction in plain English

**Technical stack (all on existing Vercel infrastructure):**
- Vercel Cron Jobs → triggers `/api/standing-orders/run` on schedule
- Vercel KV (Redis) → stores configs + output history per client (free tier)
- Resend → email delivery (free tier: 3k/month)
- Existing `/api/chat` proxy → no new Claude integration needed

**UI:** "Standing Orders" tab — toggle cards with schedule, last-ran timestamp, "Run Now" for testing, simple edit form (instruction + schedule + delivery email).

**Upsell path:** Free plan = 1 standing order. Paid = unlimited + trigger-based automations.

### Phase 3b — Connected Standing Orders
*Requires Phase 2 (OAuth).*
- Inbox Triage — scan emails, flag urgent items from key contacts
- Document Arrivals — summarize new Drive/OneDrive files automatically
- Customer Response Drafts — draft replies for review before sending

### Phase 4 — File Integrations
- [ ] Google Drive read access
- [ ] Gmail read access
- [ ] OneDrive / Outlook (Microsoft)
- [ ] Additional business tool connectors (CRM, Slack, etc.)

---

## Standing Orders — Design Principles

**Naming matters:** "Standing Orders" not "Automations" or "Workflows." Small business owners don't think in nodes and triggers. They think: *"I want RHONDA to handle this every morning."* The name fits the AI-as-assistant metaphor and sounds premium.

**Three primitives only — everything else is UI:**

| Primitive | What it is | Example |
|-----------|-----------|---------|
| Instruction | What Claude does | "Summarize my top priorities for today" |
| Schedule | When she does it | Every weekday at 7am |
| Delivery | Where the result goes | My email inbox |

**Why this beats Zapier/n8n for clients:** No visual node builder, no technical mental model. Clients describe what they want in plain English. RHONDA does the rest.

---

## Agent Library

Agents from [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) — pull the linked prompt when working on that feature. No install needed; paste into Claude Code session as context.

### Security & Infrastructure (Phase 1 priority)

| Agent | File | Use When |
|-------|------|----------|
| Security Engineer | [engineering/engineering-security-engineer.md](https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-security-engineer.md) | Fixing API key exposure, auth hardening, reviewing serverless proxy |
| DevOps Automator | [engineering/engineering-devops-automator.md](https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-devops-automator.md) | Setting up Vercel Cron, KV, CI/CD pipeline for Standing Orders |
| Backend Architect | [engineering/engineering-backend-architect.md](https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-backend-architect.md) | Designing the API proxy layer, auth routes, Standing Orders endpoints |

### Frontend & Design (ongoing)

| Agent | File | Use When |
|-------|------|----------|
| Frontend Developer | [engineering/engineering-frontend-developer.md](https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-frontend-developer.md) | Building React/Vite UI components, Standing Orders tab |
| UI Designer | [design/design-ui-designer.md](https://github.com/msitarzewski/agency-agents/blob/main/design/design-ui-designer.md) | Designing dashboard layouts, component visual design |
| UX Architect | [design/design-ux-architect.md](https://github.com/msitarzewski/agency-agents/blob/main/design/design-ux-architect.md) | Information architecture, user flow planning |
| Brand Guardian | [design/design-brand-guardian.md](https://github.com/msitarzewski/agency-agents/blob/main/design/design-brand-guardian.md) | Maintaining white-label consistency across client deployments |

### AI & Data (Phase 3 — Standing Orders + Dashboard Intelligence)

| Agent | File | Use When |
|-------|------|----------|
| AI Engineer | [engineering/engineering-ai-engineer.md](https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-ai-engineer.md) | Claude integration, prompt engineering, Standing Orders AI logic |
| Analytics Reporter | [support/support-analytics-reporter.md](https://github.com/msitarzewski/agency-agents/blob/main/support/support-analytics-reporter.md) | Building KPI dashboard output, scheduled reporting |
| Data Analytics Reporter | [specialized/data-analytics-reporter.md](https://github.com/msitarzewski/agency-agents/blob/main/specialized/data-analytics-reporter.md) | Generating structured business intelligence from client data |
| Data Consolidation Agent | [specialized/data-consolidation-agent.md](https://github.com/msitarzewski/agency-agents/blob/main/specialized/data-consolidation-agent.md) | Aggregating data from multiple client sources (Drive, email, CRM) |
| Sales Data Extraction | [specialized/sales-data-extraction-agent.md](https://github.com/msitarzewski/agency-agents/blob/main/specialized/sales-data-extraction-agent.md) | Pulling sales metrics from client systems |
| Report Distribution | [specialized/report-distribution-agent.md](https://github.com/msitarzewski/agency-agents/blob/main/specialized/report-distribution-agent.md) | Delivering Standing Orders output via email/notification |
| Finance Tracker | [support/support-finance-tracker.md](https://github.com/msitarzewski/agency-agents/blob/main/support/support-finance-tracker.md) | Financial dashboard tiles, revenue tracking |
| Executive Summary Generator | [support/support-executive-summary-generator.md](https://github.com/msitarzewski/agency-agents/blob/main/support/support-executive-summary-generator.md) | Generating morning briefings and weekly digests for Standing Orders |

### Client-Facing Features (Phase 3b+)

| Agent | File | Use When |
|-------|------|----------|
| Support Responder | [support/support-support-responder.md](https://github.com/msitarzewski/agency-agents/blob/main/support/support-support-responder.md) | Customer reply drafting feature, email triage Standing Order |
| Legal/Compliance Checker | [support/support-legal-compliance-checker.md](https://github.com/msitarzewski/agency-agents/blob/main/support/support-legal-compliance-checker.md) | Compliance review for business clients in regulated industries |

### Orchestration & Quality

| Agent | File | Use When |
|-------|------|----------|
| Agents Orchestrator | [specialized/agents-orchestrator.md](https://github.com/msitarzewski/agency-agents/blob/main/specialized/agents-orchestrator.md) | Coordinating multiple agents on complex tasks (e.g. full client onboarding analysis) |
| Reality Checker | [testing/testing-reality-checker.md](https://github.com/msitarzewski/agency-agents/blob/main/testing/testing-reality-checker.md) | Pre-launch production readiness gate, phase completion checks |
| API Tester | [testing/testing-api-tester.md](https://github.com/msitarzewski/agency-agents/blob/main/testing/testing-api-tester.md) | Testing `/api/chat` proxy, Standing Orders endpoints |
| Rapid Prototyper | [engineering/engineering-rapid-prototyper.md](https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-rapid-prototyper.md) | Fast POC for new features before full build |

### TSP Growth (Tree Stand Partners business)

| Agent | File | Use When |
|-------|------|----------|
| Growth Hacker | [marketing/marketing-growth-hacker.md](https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-growth-hacker.md) | Planning RHONDA client acquisition strategy |
| Product Trend Researcher | [product/product-trend-researcher.md](https://github.com/msitarzewski/agency-agents/blob/main/product/product-trend-researcher.md) | Researching SMB AI tool trends, competitive landscape |
| Feedback Synthesizer | [product/product-feedback-synthesizer.md](https://github.com/msitarzewski/agency-agents/blob/main/product/product-feedback-synthesizer.md) | Processing client feedback into product decisions |

---

## Architecture Target State

```
Client browser
    ↓ HTTPS
Vercel (React frontend)
    ↓ /api/chat (serverless function)
Anthropic Claude API (key never leaves server)

Auth flow:
Client → Google/M365 OAuth → Vercel → session token → access client's Drive/email

Standing Orders flow:
Vercel Cron
  → /api/standing-orders/run
  → Vercel KV (read client config)
  → /api/chat (Claude generates output)
  → Resend (email to client)
  → Vercel KV (write output to history)
```

---

## Notes & Decisions

- **White-label approach:** "Your Company" in sidebar is intentional — each client gets branded version
- **iMac:** Development machine only, not running any production services
- **Hosting:** Vercel handles everything — no separate server needed for Phases 1–3
- **File integrations are Phase 4** — most complex, worth doing last. RHONDA delivers real value without file access.
- **Standing Orders ship before OAuth** — Phase 3a has no dependency on file access or auth; can launch immediately after Phase 1
- **Model:** Currently `claude-sonnet-4-20250514` — good choice for the use case

---

## Resources

- Demo: https://demo.treestandpartners.com
- Marketing: https://treestandpartners.com
- Vercel serverless docs: https://vercel.com/docs/functions
- Vercel KV docs: https://vercel.com/docs/storage/vercel-kv
- Vercel Cron docs: https://vercel.com/docs/cron-jobs
- Resend docs: https://resend.com/docs
- Google OAuth setup: https://console.cloud.google.com
- Microsoft OAuth setup: https://portal.azure.com (App registrations)
- Agent library: https://github.com/msitarzewski/agency-agents
