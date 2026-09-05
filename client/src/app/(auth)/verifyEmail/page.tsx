import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Cloud, FolderLock, ShieldCheck, Sparkles, Users } from "lucide-react";
import logo from "@/app/icon.png";
import { VerifyEmailForm } from "@/features/Auth/verifyEmail/ui/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify email — Gold Cloud",
  description: "Verify your email to activate your Gold Cloud account.",
};

const highlights = [
  { Icon: FolderLock, title: "File Management", desc: "Upload & organize files" },
  { Icon: ShieldCheck, title: "Secure Backup", desc: "Auto-recovery built in" },
  { Icon: Users, title: "Team Access", desc: "Share & collaborate" },
  {
    Icon: Sparkles,
    title: "End-to-End Encryption",
    desc: "Zero-knowledge storage",
  },
];

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;

  return (
    <main className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-16 top-1/3 size-80 rounded-full bg-primary/20 blur-3xl" />
        <Image
          src={logo}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -right-6 w-72 opacity-10"
        />

        <Link href="/" className="relative flex items-center gap-2.5">
          <Image
            src={logo}
            alt="Gold Cloud"
            width={40}
            height={40}
            className="size-10 drop-shadow-md"
          />
          <span className="text-lg font-semibold tracking-tight">
            Gold Cloud
          </span>
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-sm">
            <Cloud className="size-3.5" />
            Secure Cloud Storage
          </span>
          <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            ONE LAST
            <br />
            <span className="text-primary">STEP</span>
            <br />
            TO GO
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            Confirm your email address to keep your account secure and unlock
            your encrypted workspace.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {highlights.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <Icon className="mb-2 size-5 text-blue-300" />
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} Gold Cloud. All rights reserved.
        </p>
      </section>

      {/* Form panel */}
      <section className="relative flex flex-col items-center justify-center bg-background px-5 py-10 sm:px-8">
        {/* Mobile brand */}
        <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <Image
            src={logo}
            alt="Gold Cloud"
            width={36}
            height={36}
            className="size-9 drop-shadow-md"
          />
          <span className="text-base font-semibold tracking-tight text-foreground">
            Gold Cloud
          </span>
        </Link>

        <VerifyEmailForm email={email} />
      </section>
    </main>
  );
}
