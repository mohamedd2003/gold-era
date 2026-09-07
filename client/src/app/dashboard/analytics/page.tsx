import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/features/Analytics/ui/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return (
    <main className="min-w-0 px-4 py-8 sm:px-8">
      <AnalyticsDashboard />
    </main>
  );
}
