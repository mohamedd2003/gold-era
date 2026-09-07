"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import logo from "@/app/icon.png";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { useSidebar } from "@/components/layout/sidebar-context";

export function DashboardHeader({
  name,
  email,
}: {
  name: string;
  email?: string;
}) {
  const { mobileOpen, toggleMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl md:col-span-2">
      <div className="flex items-center justify-between px-3 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleMobile}
            className="inline-flex size-9 items-center justify-center rounded-lg text-foreground transition hover:bg-secondary md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src={logo}
              alt="Gold Cloud"
              width={36}
              height={36}
              className="size-8 shrink-0 drop-shadow-md sm:size-9"
            />
            <span className="truncate text-sm font-semibold tracking-tight text-foreground max-[360px]:hidden">
              Gold Cloud
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="md:hidden">
            <ThemeToggle compact />
          </span>
          <span className="hidden md:inline-flex">
            <ThemeToggle />
          </span>
          <UserMenu name={name} email={email} />
        </div>
      </div>
    </header>
  );
}
