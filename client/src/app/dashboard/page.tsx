import type { Metadata } from "next";
import { isAdmin, requireUser } from "@/lib/session";
import { AdminOverview } from "@/features/Admin/ui/AdminOverview";
import { UploadFiles } from "@/features/UploadFiles/ui/UploadFiles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="min-w-0 px-4 py-8 sm:px-8">
      {isAdmin(user) ? (
        <AdminOverview name={user.name.split(" ")[0] ?? user.name} />
      ) : (
        <UploadFiles />
      )}
    </main>
  );
}
