// app/_lib/api-auth.js
import { timingSafeEqual } from "crypto";

const SECRET = process.env.INTERNAL_API_SECRET;

export const VALID_CLIENTS = new Set([
  "kings-home",
  "sunshine-mills",
  "demo",
]);

/**
 * Call at the top of every route handler.
 * Returns a Response if auth fails (caller must return it immediately),
 * or null if auth passes.
 *
 * Uses constant-time comparison (timingSafeEqual) to prevent timing oracle attacks.
 *
 * NOTE on tenant isolation (C-FIX-2): This shared-secret pattern authenticates
 * the caller but does NOT bind them to a specific client_key. A caller with the
 * secret can request data for any valid client. True tenant isolation requires
 * per-tenant credentials (e.g. short-lived JWTs issued by a session endpoint).
 * Each route must independently validate the requested client_key against the
 * session's authorized scope. For now, routes validate against VALID_CLIENTS
 * (prevents unknown clients) but do not prevent lateral movement between known ones.
 */
export function requireAuth(request) {
  if (!SECRET) {
    console.error("[auth] INTERNAL_API_SECRET is not configured");
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const provided = request.headers.get("x-internal-secret");
  if (!provided) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // C-FIX-1: constant-time comparison prevents timing oracle byte-by-byte recovery.
  // Pad both buffers to equal length before compare — timingSafeEqual requires same length.
  const maxLen = Math.max(provided.length, SECRET.length);
  const a = Buffer.alloc(maxLen);
  const b = Buffer.alloc(maxLen);
  a.write(provided);
  b.write(SECRET);
  if (!timingSafeEqual(a, b)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

/**
 * Validates a clientKey against the allowlist.
 * Returns a Response on failure, null on success.
 */
export function requireValidClient(clientKey) {
  if (!clientKey || !VALID_CLIENTS.has(clientKey)) {
    return Response.json({ error: "Invalid client" }, { status: 400 });
  }
  return null;
}
