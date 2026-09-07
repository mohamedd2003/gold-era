"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        if (!mounted) return;
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }}
      aria-label={
        mounted && resolvedTheme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className={cn(
        compact
          ? "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/80 text-foreground shadow-sm transition-colors hover:bg-secondary"
          : "inline-flex h-8 shrink-0 items-center rounded-full border border-border bg-secondary/80 p-0.5 text-muted-foreground shadow-sm transition-colors hover:text-foreground",
        className
      )}
    >
      {compact ? (
        <>
          <Sun className="size-3.5 dark:hidden" />
          <Moon className="hidden size-3.5 dark:block" />
        </>
      ) : (
        <>
          <span className="flex size-6 items-center justify-center rounded-full bg-background text-foreground shadow-sm dark:bg-transparent dark:text-muted-foreground dark:shadow-none">
            <Sun className="size-3.5" />
          </span>
          <span className="flex size-6 items-center justify-center rounded-full dark:bg-background dark:text-foreground dark:shadow-sm">
            <Moon className="size-3.5" />
          </span>
        </>
      )}
    </button>
  );
}
