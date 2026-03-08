# RHONDA — Architecture & Deployment

**Status:** In Development
**Company:** Tree Stand Partners
**Last Updated:** 2026-03-06

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

### Phase 3 — File Integrations
- [ ] Google Drive read access
- [ ] Gmail read access
- [ ] OneDrive / Outlook (Microsoft)
- [ ] Additional business tool connectors (CRM, Slack, etc.)

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
```

---

## Notes & Decisions

- **White-label approach:** "Your Company" in sidebar is intentional — each client gets branded version
- **iMac:** Development machine only, not running any production services
- **Hosting:** Vercel handles everything — no separate server needed for Phase 1 & 2
- **File integrations are Phase 3** — most complex, worth doing last. Start simple: RHONDA just responds, no file access needed to launch.
- **Model:** Currently `claude-sonnet-4-20250514` — good choice for the use case

---

## Resources

- Demo: https://demo.treestandpartners.com
- Marketing: https://treestandpartners.com
- Vercel serverless docs: https://vercel.com/docs/functions
- Google OAuth setup: https://console.cloud.google.com
- Microsoft OAuth setup: https://portal.azure.com (App registrations)
