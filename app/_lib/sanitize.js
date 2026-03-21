// app/_lib/sanitize.js

// ─── C-5: Prompt injection ───────────────────────────────────────────────────

/**
 * Strip control characters and limit length before interpolating
 * any user-supplied string into an LLM system prompt.
 *
 * Strips both ASCII control chars AND Unicode control/format chars used in
 * adversarial prompt injection (bidi overrides, line/paragraph separators,
 * zero-width spaces, etc.).
 */
export function sanitizeForPrompt(str, maxLength = 200) {
  if (typeof str !== "string") return "";
  return str
    // ASCII control chars (includes \n \r \t)
    .replace(/[\x00-\x1F\x7F]/g, " ")
    // Unicode control / format chars used in prompt injection research:
    // Line/paragraph separators, bidi overrides, zero-width space, joiners
    .replace(/[\u2028\u2029\u200B\u200C\u200D\u202A-\u202E\u2066-\u2069\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, maxLength)
    .trim();
}

// ─── H-1: Image block validation ────────────────────────────────────────────

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates an Anthropic-format image block from an untrusted client.
 * Returns an error string on failure, null on success.
 *
 * Size check runs BEFORE the regex to prevent CPU saturation from large payloads.
 */
export function validateImageBlock(block) {
  if (!block || typeof block !== "object") return "imageBlock must be an object";
  if (block.type !== "image") return "imageBlock.type must be 'image'";

  const src = block.source;
  if (!src || typeof src !== "object") return "imageBlock.source is required";
  if (src.type !== "base64") return "Only base64 image sources are accepted";

  // H-FIX-1: size check BEFORE regex — prevents CPU saturation from large payloads.
  const data = src.data;
  if (typeof data !== "string" || data.length === 0) return "imageBlock.source.data is empty";

  const approxBytes = data.length * 0.75;
  if (approxBytes > MAX_IMAGE_BYTES) {
    return `Image exceeds 5 MB limit`;
  }

  // MIME check after size — avoids reflecting attacker-controlled media_type in errors
  if (!ALLOWED_IMAGE_MIME.has(src.media_type)) {
    return "Unsupported image type. Allowed: jpeg, png, gif, webp";
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(data)) return "imageBlock.source.data is not valid base64";

  return null;
}

// ─── H-3: Record sanitization (prototype pollution + arbitrary columns) ──────

const BANNED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Strips prototype-pollution keys and any column name that doesn't
 * match a safe identifier pattern from a plain record object.
 * Throws if the input is not a plain object.
 */
export function sanitizeRecord(record) {
  if (
    typeof record !== "object" ||
    record === null ||
    Array.isArray(record)
  ) {
    throw new TypeError("record must be a plain object");
  }

  const out = Object.create(null);
  for (const key of Object.keys(record)) {
    if (BANNED_KEYS.has(key)) continue;
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) continue;
    out[key] = record[key];
  }
  return out;
}
