// app/_lib/api-auth.js
// No Node.js crypto import — uses pure JS constant-time comparison
// that works in both Node.js and Edge runtimes.

const SECRET = process.env.INTERNAL_API_SECRET;

export const VALID_CLIENTS = new Set([
  "kings-home",
  "sunshine-mills",
  "demo",
]);

/**
 * Constant-time string comparison — prevents timing oracle attacks.
 * Pure JS, no Node.js builtins required.
 */
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  // Compare against the longer string's length to avoid length oracle
  const maxLen = Math.max(a.length, b.length);
  let result = 0;
  for (let i = 0; i < maxLen; i++) {
    // charCodeAt returns NaN for out-of-bounds, XOR with 0 keeps the diff
    result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  // Also flag length mismatch
  result |= a.length ^ b.length;
  return result === 0;
}

/**
 * Call at the top of every route handler.
 * Returns a Response if auth fails (caller must return it immediately),
 * or null if auth passes.
 *
 * NOTE on tenant isolation: This shared-secret authenticates the caller
 * but does NOT bind them to a specific client_key. Each route independently
 * validates client_key against VALID_CLIENTS, but lateral movement between
 * known clients is a structural limitation requiring per-tenant credentials.
 */
export function requireAuth(request) {
  if (!SECRET) {
    console.error("[auth] INTERNAL_API_SECRET is not configured");
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const provided = request.headers.get("x-internal-secret");
  if (!provided || !safeEqual(provided, SECRET)) {
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
