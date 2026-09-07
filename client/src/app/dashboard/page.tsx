import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { UploadFiles } from "@/features/UploadFiles/ui/UploadFiles";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <main className="min-w-0 px-4 py-8 sm:px-8">
      <UploadFiles />
    </main>
  );
}
