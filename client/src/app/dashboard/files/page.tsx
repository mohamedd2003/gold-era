import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { AdminFiles } from "@/features/Admin/ui/AdminFiles";

export const metadata: Metadata = {
  title: "Files management",
  robots: { index: false, follow: false },
};

export default async function AdminFilesPage() {
  await requireAdmin();

  return (
    <main className="min-w-0 px-4 py-8 sm:px-8">
      <AdminFiles />
    </main>
  );
}
