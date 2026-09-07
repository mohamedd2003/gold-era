import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgeCheck, Mail, Shield, User } from "lucide-react";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <main className="min-w-0 px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Profile
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your Gold Cloud account details.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard Icon={User} label="Name" value={user.name} />
        <InfoCard Icon={Mail} label="Email" value={user.email} />
        <InfoCard Icon={Shield} label="Role" value={user.role} />
        <InfoCard
          Icon={BadgeCheck}
          label="Email status"
          value={user.isVerified ? "Verified" : "Not verified"}
          highlight={user.isVerified}
        />
      </div>
    </main>
  );
}

function InfoCard({
  Icon,
  label,
  value,
  highlight,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={
          "mt-1 truncate text-sm font-semibold " +
          (highlight ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")
        }
      >
        {value}
      </p>
    </div>
  );
}
