"use client";
import { useSearchParams } from "next/navigation";
import { getToolClient, getToolColors } from "./toolConfig";

// Hook for Power Tool pages — reads ?client=xxx from URL, returns config + colors
export function useToolClient() {
  const params = useSearchParams();
  const clientKey = params.get("client") || "default";
  const client = getToolClient(clientKey);
  const colors = getToolColors(client);
  return { client, colors, clientKey };
}
