import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Server-side Supabase clients. Both use the public anon key, so RLS decides
 * what they can see: published venues and reference data only.
 * The service role key must never be used here (or anywhere in the app).
 */

// How long cached reads live before Next.js refetches them, in seconds.
export const READ_REVALIDATE_SECONDS = 600;

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return { url, key };
}

const authOptions = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };

let readClient: SupabaseClient<Database> | null = null;

/** For page data. Responses go through the Next.js data cache. */
export function supabaseRead(): SupabaseClient<Database> {
  if (readClient) return readClient;
  const { url, key } = env();
  readClient = createClient<Database>(url, key, {
    auth: authOptions,
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: READ_REVALIDATE_SECONDS } }),
    },
  });
  return readClient;
}

/** For inserts from server actions (reports). Never cached. */
export function supabaseWrite(): SupabaseClient<Database> {
  const { url, key } = env();
  return createClient<Database>(url, key, {
    auth: authOptions,
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
