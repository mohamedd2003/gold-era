import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BadgeCheck, LogOut, Mail, Shield, User } from "lucide-react";
import logo from "@/app/icon.png";
import { logoutAction } from "./logout.action";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://gold-era-production-a530.up.railway.app/api/v1";

interface ProfileUser {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isVerified: boolean;
}

async function getProfile(token: string): Promise<ProfileUser | null> {
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as
      | { success: boolean; data: ProfileUser }
      | null;
    return body?.success ? body.data : null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gold_era_token")?.value;
  const roleCookie = cookieStore.get("gold_era_role")?.value;

  // Route guard: no session -> back to login.
  if (!token) redirect("/login");

  const user = await getProfile(token);

  // Token expired / invalid -> force re-login.
  if (!user) redirect("/login");

  const role = user.role ?? roleCookie ?? "USER";
  const isAdmin = role === "ADMIN";

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50/70 via-indigo-50/30 to-background">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src={logo}
              alt="Gold Cloud"
              width={36}
              height={36}
              className="size-9 drop-shadow-md"
            />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Gold Cloud
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold " +
                (isAdmin
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground")
              }
            >
              <Shield className="size-3.5" />
              {role}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re signed in to your secure Gold Cloud workspace.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard Icon={User} label="Name" value={user.name} />
          <InfoCard Icon={Mail} label="Email" value={user.email} />
          <InfoCard Icon={Shield} label="Role" value={role} />
          <InfoCard
            Icon={BadgeCheck}
            label="Email status"
            value={user.isVerified ? "Verified" : "Not verified"}
            highlight={user.isVerified}
          />
        </div>

        {isAdmin && (
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <p className="text-sm font-semibold text-primary">
              Admin access
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You have administrator privileges. User and file management tools
              will appear here.
            </p>
          </div>
        )}
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
    <div className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={
          "mt-1 truncate text-sm font-semibold " +
          (highlight ? "text-emerald-600" : "text-foreground")
        }
      >
        {value}
      </p>
    </div>
  );
}
