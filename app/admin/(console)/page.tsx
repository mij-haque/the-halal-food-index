import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { getReviewRows } from "@/lib/admin/data";
import { ReviewQueue } from "@/components/admin/review-queue";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review" };

export default async function ReviewPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const rows = await getReviewRows(admin.db);
  return (
    <main className="flex flex-col gap-5 px-4 pb-32 pt-8 md:px-10">
      <header>
        <h1 className="m-0 font-display text-[30px] font-bold tracking-[-.01em]">Waiting for your OK</h1>
        <p className="mt-1.5 text-hfi-t2">Tick the places you&apos;re happy with. Nothing goes live until you approve it.</p>
      </header>
      <ReviewQueue rows={rows} />
    </main>
  );
}
