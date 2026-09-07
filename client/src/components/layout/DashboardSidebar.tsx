"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  Files,
  Folder,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { useSidebar } from "@/components/layout/sidebar-context";

const STORAGE_KEY = "gold-era-sidebar-collapsed";

type NavItem = { label: string; href: string; Icon: LucideIcon };

const userItems: NavItem[] = [
  { label: "All Files", href: "/dashboard", Icon: Folder },
  { label: "Analytics", href: "/dashboard/analytics", Icon: BarChart },
];

const adminItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/users", Icon: Users },
  { label: "Files", href: "/dashboard/files", Icon: Files },
  { label: "Analytics", href: "/dashboard/analytics", Icon: BarChart },
];

export function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const { mobileOpen, closeMobile } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);
  const items = role === "ADMIN" ? adminItems : userItems;

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

  const label = role === "ADMIN" ? "Administration" : "Library";

  return (
    <>
      <aside
        className={cn(
          "sticky top-[69px] hidden h-[calc(100dvh-81px)] flex-col rounded-2xl bg-secondary shadow-sm transition-[width] duration-300 md:mx-3 md:mt-3 md:mb-3 md:flex",
          collapsed ? "w-[4.75rem] items-center px-2.5 py-4" : "w-60 p-5"
        )}
      >
        <SidebarHeader
          label={label}
          collapsed={collapsed}
          onToggle={toggleCollapsed}
        />
        <SidebarNav items={items} pathname={pathname} collapsed={collapsed} />
      </aside>

      <div
        className={cn(
          "fixed inset-x-0 top-[57px] bottom-0 z-20 md:hidden",
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
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {label}
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
          <SidebarNav
            items={items}
            pathname={pathname}
            onNavigate={closeMobile}
          />
        </aside>
      </div>
    </>
  );
}

function SidebarHeader({
  label,
  collapsed,
  onToggle,
}: {
  label: string;
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
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {label}
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

function SidebarNav({
  items,
  pathname,
  collapsed = false,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map(({ label, href, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
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
