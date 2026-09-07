import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { getSessionUser } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <SidebarProvider>
      <div className="grid min-h-screen grid-rows-[auto_1fr] bg-linear-to-b from-blue-50/70 via-indigo-50/30 to-background md:grid-cols-[auto_1fr] dark:from-primary/10 dark:via-background dark:to-background">
        <DashboardHeader name={user.name} email={user.email} />

        <Suspense>
          <DashboardSidebar />
        </Suspense>

        {children}
      </div>
    </SidebarProvider>
  );
}
