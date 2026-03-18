"use client";
import { useState, useCallback } from "react";
import { resizeImage, imageToContentBlock, pickImage } from "./imageUpload";

/**
 * React hook for image capture with preview + Claude Vision content block.
 *
 * Usage:
 *   const { captureImage, preview, imageData, contentBlock, clear, error } = useImageCapture();
 *   <button onClick={() => captureImage()}>Take Photo</button>
 *   {preview && <img src={preview} />}
 *   // Send contentBlock in Claude API messages
 */
export function useImageCapture() {
  const [preview, setPreview] = useState(null);    // data URL for display
  const [imageData, setImageData] = useState(null); // { base64, mediaType, width, height }
  const [error, setError] = useState("");

  const captureImage = useCallback(async ({ camera = false, file = null } = {}) => {
    setError("");
    try {
      const f = file || await pickImage({ camera });
      if (!f) return; // user cancelled

      const data = await resizeImage(f);
      setImageData(data);
      setPreview(`data:${data.mediaType};base64,${data.base64}`);
    } catch (err) {
      setError(err.message || "Failed to process image");
    }
  }, []);

  const clear = useCallback(() => {
    setPreview(null);
    setImageData(null);
    setError("");
  }, []);

  const contentBlock = imageData ? imageToContentBlock(imageData) : null;

  return { captureImage, preview, imageData, contentBlock, clear, error };
}
