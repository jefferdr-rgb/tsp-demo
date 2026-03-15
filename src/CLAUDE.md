# RHONDA — src/

## What lives here
Single-file React SPA. Everything is in `App.jsx` — design system, all tiles, export utilities, chat logic. This is intentional. Do not split into components without a specific reason.

## Design system
Color palette lives in the `T` object at the top of `App.jsx`. G-Squared palette (gold, green, beige tones). Do not hardcode hex values anywhere — always reference `T.something`.

## Tiles
6 tiles: Email, Data, Documents, Calendar, Customers, AI Chat. Each has:
- A system prompt injected via `SYSTEM_PROMPT` constant
- Per-tile context passed as `tileContext` before the user message
- File upload support (txt, pdf, csv, xlsx) — extracted client-side before sending

## Key rules
- `max_tokens` is `Infinity` — never add a truncation limit. Cost per full file is fractions of a cent; wrong answers from truncation cost more.
- No `VITE_` prefix needed for env vars — Vercel handles them server-side via `api/chat.js`
- Model: `claude-haiku-4-5-20251001` — RHONDA stays on Haiku. Sonnet is LEO only.
- Export: `extractTableRows()` parses markdown tables and CSV from AI responses for Google Sheets export. Do not break this function.

## Stack
React + Vite, deployed to Vercel. No router — single page. `index.html` → `main.jsx` → `App.jsx`.
