import { ThemeProvider } from "@/contexts/theme-context";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin — Halal Food Index",
    template: "%s | Admin — Halal Food Index",
  },
};

function getAdminSession() {
  return { user: { name: "Mij", email: "admin@halalfoodindex.co.uk", role: "Admin" } };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F0F0F]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Topbar />
          <Breadcrumb />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
