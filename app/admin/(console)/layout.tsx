import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { getCounts, getJobs, type Light } from "@/lib/admin/data";
import { Seal } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

const LIGHT: Record<Light, string> = { ok: "#3FBF88", due: "#E39A4A", bad: "#E26A6A" };

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const [jobs, counts] = await Promise.all([getJobs(admin.db), getCounts(admin.db)]);

  return (
    <div className="flex min-h-screen flex-wrap">
      <nav aria-label="Admin" className="flex w-full flex-col gap-7 bg-[#111312] px-4 py-6 text-[#EDEDEA] md:w-[248px] md:shrink-0">
        <div className="flex items-center gap-3 px-2">
          <Seal />
          <div className="flex flex-col">
            <span className="font-display text-[16px] font-bold">The Halal Food Index</span>
            <span className="text-[12px] text-[#A3A39D]">Admin</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <a href="/admin" className="flex items-center justify-between rounded-lg bg-[#1F2321] px-3 py-2.5 font-semibold text-white">
            Review
            {counts.review > 0 && <span className="rounded-full bg-hfi-amber px-2 py-0.5 text-[12px] text-white">{counts.review}</span>}
          </a>
          <span className="flex items-center justify-between px-3 py-2.5 text-[#8F8F89]">
            Mission control <span className="text-[11px]">soon</span>
          </span>
          <span className="flex items-center justify-between px-3 py-2.5 text-[#8F8F89]">
            Add places <span className="text-[11px]">soon</span>
          </span>
        </div>
        <div className="flex flex-col gap-2.5 px-3">
          <span className="text-[11px] uppercase tracking-[.08em] text-[#8F8F89]">Jobs</span>
          {jobs.map((j) => (
            <div key={j.name} className="flex items-center gap-2.5 text-[13px]" title={`${j.status}. ${j.when}`}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: LIGHT[j.light] }} />
              <span className="flex-1 text-[#DADAD4]">{j.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-0.5 border-t border-[#2A2E2C] px-3 pt-4">
          <span className="font-display text-[26px] font-bold">{counts.published}</span>
          <span className="text-[12px] text-[#A3A39D]">places live · {counts.draft} in backlog</span>
          <form action="/admin/logout" method="post" className="mt-3">
            <button type="submit" className="text-[13px] text-[#A3A39D] underline-offset-2 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
