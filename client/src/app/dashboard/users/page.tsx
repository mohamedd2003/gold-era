import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { AdminUsers } from "@/features/Admin/ui/AdminUsers";

export const metadata: Metadata = {
  title: "User management",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  return (
    <main className="min-w-0 px-4 py-8 sm:px-8">
      <AdminUsers currentUserId={admin.id} />
    </main>
  );
}
