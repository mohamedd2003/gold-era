"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { logoutAction } from "@/app/dashboard/logout.action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function UserMenu({
  name,
  email,
  compact = false,
}: {
  name: string;
  email?: string;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const onDashboard = pathname === "/dashboard";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition hover:bg-primary/90",
          compact ? "size-8 text-xs" : "size-9 text-sm"
        )}
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {name}
            </p>
            {email && (
              <p className="truncate text-xs font-normal text-muted-foreground">
                {email}
              </p>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
            <UserRound className="size-4" />
            Profile
          </DropdownMenuItem>
          {!onDashboard && (
            <DropdownMenuItem render={<Link href="/dashboard" />}>
              <LayoutDashboard className="size-4" />
              Dashboard
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => void logoutAction()}>
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
