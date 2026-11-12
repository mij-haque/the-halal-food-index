import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Admin sign-in (Supabase Auth, email link, PKCE) without extra packages.
 *
 * Who you are: the Supabase session, kept in two httpOnly cookies scoped to /admin.
 * What you can do: decided by the database. Every admin query runs with the
 * signed-in user's token, and RLS policies only let `public.is_admin()` emails
 * see waiting venues or change anything. No service role key is used.
 */

export const ACCESS_COOKIE = "hfi_admin_at";
export const REFRESH_COOKIE = "hfi_admin_rt";
export const ADMIN_PATH = "/admin";

export const cookieBase = { httpOnly: true, secure: true, sameSite: "lax" as const, path: ADMIN_PATH };

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url, key };
}

const noStore = (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, cache: "no-store" });

/**
 * Client for the sign-in steps. Only the PKCE code verifier is kept (in a
 * short-lived cookie); the session itself is written to our own cookies.
 * Use only in server actions and route handlers, where cookies can be set.
 */
export function authClient(): SupabaseClient {
  const { url, key } = env();
  const jar = cookies();
  const memory = new Map<string, string>();
  const storage = {
    getItem: (k: string) => memory.get(k) ?? jar.get(k)?.value ?? null,
    setItem: (k: string, v: string) => {
      memory.set(k, v);
      if (k.endsWith("-code-verifier")) jar.set(k, v, { ...cookieBase, maxAge: 60 * 15 });
    },
    removeItem: (k: string) => {
      memory.delete(k);
      if (k.endsWith("-code-verifier")) jar.delete({ name: k, path: ADMIN_PATH });
    },
  };
  return createClient(url, key, {
    auth: { flowType: "pkce", storage, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: noStore },
  });
}

/** Anonymous client for the "is this email allowed" check. */
export function anonClient(): SupabaseClient {
  const { url, key } = env();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: noStore },
  });
}

/** Store a fresh session in the admin cookies. */
export function setSessionCookies(accessToken: string, refreshToken: string) {
  const jar = cookies();
  jar.set(ACCESS_COOKIE, accessToken, { ...cookieBase, maxAge: 60 * 60 });
  jar.set(REFRESH_COOKIE, refreshToken, { ...cookieBase, maxAge: 60 * 60 * 24 * 365 });
}

export function clearSessionCookies() {
  const jar = cookies();
  jar.delete({ name: ACCESS_COOKIE, path: ADMIN_PATH });
  jar.delete({ name: REFRESH_COOKIE, path: ADMIN_PATH });
}

export type Admin = { db: SupabaseClient };

/**
 * The signed-in admin, or null. Runs every query as the user, so RLS applies.
 * An expired or forged token fails the is_admin() call and returns null.
 */
export async function getAdmin(): Promise<Admin | null> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  const { url, key } = env();
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: noStore, headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await db.rpc("is_admin");
  if (error || data !== true) return null;
  return { db };
}
