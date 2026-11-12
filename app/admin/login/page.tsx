import { redirect } from "next/navigation";
import { anonClient, setSessionCookies } from "@/lib/admin/auth";
import { Seal } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

/*
 * Email + password sign-in (Supabase Auth). Easier on a phone than an email
 * link, and works with a password manager. You stay signed in for 30 days.
 * Being signed in is not enough on its own: the database only lets emails in
 * admin_users see or change anything.
 */
async function signIn(form: FormData) {
  "use server";
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password || email.length > 200 || password.length > 200) redirect("/admin/login?error=1");
  const { data, error } = await anonClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) redirect("/admin/login?error=1");
  setSessionCookies(data.session.access_token, data.session.refresh_token);
  redirect("/admin");
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const failed = searchParams.error === "1";
  return (
    <div className="flex min-h-screen items-center justify-center bg-hfi-bg px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-hfi-hair bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <Seal />
          <div>
            <p className="font-display text-[17px] font-bold leading-tight">The Halal Food Index</p>
            <p className="text-[13px] text-hfi-t3">Admin</p>
          </div>
        </div>
        <form action={signIn} className="flex flex-col gap-3">
          <h1 className="font-display text-[22px] font-bold">Sign in</h1>
          {failed && (
            <p className="rounded-lg bg-hfi-red-bg px-3 py-2 text-[13.5px] text-hfi-red">That email and password didn&apos;t match. Try again.</p>
          )}
          <label htmlFor="hfi-admin-email" className="text-[13.5px] font-semibold">
            Email
          </label>
          <input id="hfi-admin-email" name="email" type="email" required autoComplete="username" className="h-11 rounded-[10px] border border-hfi-hair px-3 text-[16px]" />
          <label htmlFor="hfi-admin-password" className="text-[13.5px] font-semibold">
            Password
          </label>
          <input id="hfi-admin-password" name="password" type="password" required autoComplete="current-password" className="h-11 rounded-[10px] border border-hfi-hair px-3 text-[16px]" />
          <button type="submit" className="mt-1 h-11 rounded-full bg-hfi-orn text-[15px] font-semibold text-white">
            Sign in
          </button>
          <p className="text-[12.5px] text-hfi-t3">You only need to do this once on each device.</p>
        </form>
      </div>
    </div>
  );
}
