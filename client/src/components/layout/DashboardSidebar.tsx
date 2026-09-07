"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart,
  Clock,
  Folder,
  PanelLeftClose,
  PanelLeftOpen,

  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar-context";

const STORAGE_KEY = "gold-era-sidebar-collapsed";

const libraryItems = [
  { id: "all", label: "All Files", href: "/dashboard", Icon: Folder },
  { id: "analytics", label: "Analytics", href: "/dashboard", Icon: BarChart },
  
] as const;

export type DashboardView = (typeof libraryItems)[number]["id"];

export function DashboardSidebar({
  active: activeProp,
}: {
  active?: DashboardView;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mobileOpen, closeMobile } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);
  const viewParam = searchParams.get("view");
  const activeFromUrl: DashboardView | undefined = libraryItems.some(
    (item) => item.id === viewParam
  )
    ? (viewParam as DashboardView)
    : pathname === "/dashboard"
      ? "all"
      : undefined;
  const active = activeProp ?? activeFromUrl;

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobile();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen, closeMobile]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <>
      <aside
        className={cn(
          "sticky top-[69px] hidden h-[calc(100dvh-81px)] flex-col rounded-2xl bg-secondary shadow-sm transition-[width] duration-300 md:mx-3 md:mb-3 md:mt-3 md:flex",
          collapsed ? "w-[4.75rem] items-center px-2.5 py-4" : "w-60 p-5"
        )}
      >
        <SidebarHeader
          collapsed={collapsed}
          onToggle={toggleCollapsed}
        />
        <LibraryNav active={active} collapsed={collapsed} />
      </aside>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-[57px] z-20 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobile}
          className={cn(
            "absolute inset-0 bg-foreground/30 backdrop-blur-[2px] transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col bg-secondary p-5 shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Library
            </p>
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close sidebar"
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <LibraryNav active={active} onNavigate={closeMobile} />
        </aside>
      </div>
    </>
  );
}

function SidebarHeader({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        collapsed ? "justify-center" : "justify-between px-1"
      )}
    >
      {!collapsed && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Library
        </p>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </button>
    </div>
  );
}

function LibraryNav({
  active,
  collapsed = false,
  onNavigate,
}: {
  active?: DashboardView;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {libraryItems.map(({ id, label, href, Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            href={href}
            title={collapsed ? label : undefined}
            onClick={onNavigate}
            className={cn(
              "flex items-center rounded-xl text-sm font-medium transition-colors",
              collapsed ? "size-10 justify-center" : "gap-2.5 px-3 py-2.5",
              isActive
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && label}
          </Link>
        );
      })}
    </nav>
  );
}
