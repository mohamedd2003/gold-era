import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <main className="min-w-0 px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Welcome back, {user.name.split(" ")[0]} 👋
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You&apos;re signed in to your secure Gold Cloud workspace.
      </p>
    </main>
  );
}
