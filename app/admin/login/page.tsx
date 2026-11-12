import { redirect } from "next/navigation";
import { anonClient, authClient } from "@/lib/admin/auth";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

async function sendLink(form: FormData) {
  "use server";
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) redirect("/admin/login?sent=1");
  // Only allowed emails get a link. Everyone sees the same reply either way.
  const { data: allowed } = await anonClient().rpc("admin_email_allowed", { p_email: email });
  if (allowed === true) {
    await authClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${SITE_URL}/admin/callback`, shouldCreateUser: true },
    });
  }
  redirect("/admin/login?sent=1");
}

export default function LoginPage({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  const sent = searchParams.sent === "1";
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
        {sent ? (
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[22px] font-bold">Check your email</h1>
            <p className="text-[14.5px] text-hfi-t2">
              If that email can use the admin, a sign-in link is on its way. Open it in this same browser.
            </p>
            <a href="/admin/login" className="mt-2 text-[14px] font-semibold text-hfi-link">
              Use a different email
            </a>
          </div>
        ) : (
          <form action={sendLink} className="flex flex-col gap-3">
            <h1 className="font-display text-[22px] font-bold">Sign in</h1>
            {failed && (
              <p className="rounded-lg bg-hfi-red-bg px-3 py-2 text-[13.5px] text-hfi-red">
                That link didn&apos;t work. It may have expired, or been opened in a different browser. Ask for a new one.
              </p>
            )}
            <label htmlFor="hfi-admin-email" className="text-[13.5px] font-semibold">
              Email
            </label>
            <input
              id="hfi-admin-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-11 rounded-[10px] border border-hfi-hair px-3 text-[15px]"
            />
            <button type="submit" className="mt-1 h-11 rounded-full bg-hfi-orn text-[15px] font-semibold text-white">
              Email me a sign-in link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Seal() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="15.5" fill="none" stroke="#B8924E" strokeWidth="1.5" />
      <circle cx="17" cy="17" r="10.5" fill="#0B6B45" />
      <path d="M17 10.5l1.8 4.2 4.5.4-3.4 3 1 4.4-3.9-2.3-3.9 2.3 1-4.4-3.4-3 4.5-.4z" fill="#FCFCFC" />
    </svg>
  );
}
