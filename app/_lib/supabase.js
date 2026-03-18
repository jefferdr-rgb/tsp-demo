import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (use in API routes)
let _serverClient = null;
export function getSupabase() {
  if (_serverClient) return _serverClient;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("Supabase not configured — using demo mode (localStorage fallback)");
    return null;
  }
  _serverClient = createClient(url, key);
  return _serverClient;
}

// Client-side Supabase (use in "use client" components)
let _browserClient = null;
export function getBrowserSupabase() {
  if (_browserClient) return _browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _browserClient = createClient(url, key);
  return _browserClient;
}
