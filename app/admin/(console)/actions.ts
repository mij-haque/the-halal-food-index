"use server";

import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin/auth";

/* Every change runs as the signed-in admin; RLS refuses anyone else. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: boolean; count?: number; message?: string };

async function need() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Signed out. Sign in again.");
  return admin.db;
}

export async function approveVenues(ids: string[]): Promise<Result> {
  try {
    const db = await need();
    const clean = ids.filter((i) => UUID.test(i));
    if (!clean.length) return { ok: true, count: 0 };
    const { data, error } = await db
      .from("venues")
      .update({ status: "published", published_at: new Date().toISOString() })
      .in("id", clean)
      .eq("status", "review")
      .select("id");
    if (error) throw error;
    revalidatePath("/admin", "layout");
    return { ok: true, count: data?.length ?? 0 };
  } catch (e) {
    return { ok: false, message: String((e as Error).message ?? e) };
  }
}

export async function skipVenues(ids: string[]): Promise<Result> {
  try {
    const db = await need();
    const clean = ids.filter((i) => UUID.test(i));
    if (!clean.length) return { ok: true, count: 0 };
    const { data, error } = await db.from("venues").update({ status: "delisted" }).in("id", clean).eq("status", "review").select("id");
    if (error) throw error;
    revalidatePath("/admin", "layout");
    return { ok: true, count: data?.length ?? 0 };
  } catch (e) {
    return { ok: false, message: String((e as Error).message ?? e) };
  }
}

/** Mij's own alcohol answer. Automated checks never overwrite it. */
export async function setAlcohol(id: string, value: boolean | null): Promise<Result> {
  try {
    if (!UUID.test(id)) return { ok: false, message: "Unknown place." };
    const db = await need();
    const { error } = await db.from("venues").update({ serves_alcohol: value }).eq("id", id);
    if (error) throw error;
    const { data: rows } = await db.from("external_place_cache").select("id, payload").eq("venue_id", id);
    for (const r of rows ?? []) {
      const p = { ...((r.payload as Record<string, unknown>) ?? {}) };
      if (value === null) {
        delete p.alcohol_source;
        delete p.alcohol_evidence;
        p.alcohol_checked = false;
      } else {
        Object.assign(p, {
          alcohol_checked: true,
          alcohol_source: "mij",
          alcohol_evidence: "Set by Mij in the admin (local knowledge).",
          alcohol_checked_at: new Date().toISOString().slice(0, 10),
        });
      }
      await db.from("external_place_cache").update({ payload: p }).eq("id", r.id);
    }
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: String((e as Error).message ?? e) };
  }
}
