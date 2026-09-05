import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Cloud, Home, Search } from "lucide-react";
import logo from "@/app/icon.png";

export const metadata: Metadata = {
  title: "Page not found — Gold Cloud",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b from-blue-50/80 via-indigo-50/40 to-background px-5 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.14),transparent_60%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2.5"
        >
          <Image
            src={logo}
            alt="Gold Cloud"
            width={40}
            height={40}
            className="size-10 drop-shadow-md"
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Gold Cloud
          </span>
        </Link>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
          <Search className="size-3.5" />
          Error 404
        </span>

        <div className="relative mt-6 flex items-center justify-center">
          <h1 className="bg-linear-to-b from-primary to-blue-400 bg-clip-text text-[6rem] font-bold leading-none tracking-tight text-transparent sm:text-[8rem]">
            404
          </h1>
          <Cloud className="absolute -right-6 -top-2 size-10 text-primary/30 sm:-right-10 sm:size-14" />
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          This page drifted away
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back to safe storage.
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
          >
            <Home className="size-4" />
            Back to Home
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
          >
            <ArrowLeft className="size-4" />
            Go to Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
