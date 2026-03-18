// ── Image Upload Pipeline ────────────────────────────────────────────────────
// Client-side resize to Claude Vision optimal (1568px max), base64 conversion
// Supports file picker and camera capture on mobile

/**
 * Resize an image file to fit within maxDim (default 1568px — Claude Vision optimal).
 * Returns { base64, mediaType, width, height }
 */
export async function resizeImage(file, maxDim = 1568) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        let { width, height } = img;

        // Scale down if larger than maxDim
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Use JPEG for photos (smaller), PNG for screenshots/documents
        const isPhoto = file.type === "image/jpeg" || file.type === "image/jpg";
        const outputType = isPhoto ? "image/jpeg" : "image/png";
        const quality = isPhoto ? 0.85 : undefined;
        const dataUrl = canvas.toDataURL(outputType, quality);
        const base64 = dataUrl.split(",")[1];
        const mediaType = outputType;

        resolve({ base64, mediaType, width, height });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Build a Claude Vision content block from a resized image.
 */
export function imageToContentBlock({ base64, mediaType }) {
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: mediaType,
      data: base64,
    },
  };
}

/**
 * Create a file input that opens camera on mobile or file picker on desktop.
 * Returns a Promise<File> or null if cancelled.
 */
export function pickImage({ camera = false } = {}) {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (camera) input.capture = "environment"; // rear camera on mobile
    input.onchange = () => resolve(input.files?.[0] || null);
    // Handle cancel — no reliable event, so we resolve null on blur after delay
    window.addEventListener("focus", function onFocus() {
      window.removeEventListener("focus", onFocus);
      setTimeout(() => {
        if (!input.files?.length) resolve(null);
      }, 500);
    }, { once: true });
    input.click();
  });
}
