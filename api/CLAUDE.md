# api/ — Serverless API Layer

## What this is

Single serverless function (`chat.js`) deployed on Vercel. It is the **only** layer that touches the Anthropic API key. The browser never sees it.

## How it works

Receives POST from the frontend, forwards the body directly to `https://api.anthropic.com/v1/messages`, returns the response. Thin proxy — no business logic here.

## Hard rules — do not violate

- **NEVER add `VITE_` prefix to any secret.** VITE_ variables are bundled into the browser build and exposed publicly. Secrets go in Vercel environment variables and are accessed server-side only via `process.env`.
- **NEVER log `req.body` in full.** It may contain user file content. Log only method, status, and errors.
- **NEVER expose `ANTHROPIC_API_KEY` in any response, error message, or log.**
- **NEVER bypass the POST method check.** The 405 guard must stay.

## Environment variables

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `ANTHROPIC_API_KEY` | Vercel dashboard (not .env) | Anthropic API authentication |

## What NOT to add here

- Auth logic → Phase 2, separate module
- File storage → not this function
- Rate limiting → Vercel handles at edge level

## Deployment

Vercel auto-deploys on push to `main`. This file is picked up automatically as a serverless function from the `api/` directory. No config needed.
