import type { Metadata } from "next";
import { isAdmin, requireUser } from "@/lib/session";
import { AdminAnalytics } from "@/features/Admin/ui/AdminAnalytics";
import { AnalyticsDashboard } from "@/features/Analytics/ui/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const user = await requireUser();

  return (
    <main className="min-w-0 px-4 py-8 sm:px-8">
      {isAdmin(user) ? <AdminAnalytics /> : <AnalyticsDashboard />}
    </main>
  );
}
