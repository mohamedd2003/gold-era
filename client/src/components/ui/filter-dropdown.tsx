"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const EMPTY = "__empty__";

export type FilterOption<T extends string = string> = {
  value: T;
  label: string;
};

/**
 * shadcn DropdownMenu used as a single-select filter (sort, type, role, period).
 * Empty option values are remapped internally because radio items need a key.
 */
export function FilterDropdown<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  disabled,
  className,
  align = "end",
  size = "default",
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly FilterOption<T>[];
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  size?: "default" | "sm";
}) {
  const selected =
    options.find((option) => option.value === value)?.label ??
    options[0]?.label ??
    "";
  const menuValue = value === "" ? EMPTY : value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label={ariaLabel}
        title={ariaLabel}
        render={
          <Button
            variant="outline"
            className={cn(
              "justify-between border-border bg-card font-medium text-foreground hover:bg-secondary",
              size === "default"
                ? "h-10 w-full rounded-xl px-3 text-sm sm:w-40"
                : "h-8 rounded-lg px-2 text-xs",
              className
            )}
          />
        }
      >
        <span className="min-w-0 truncate">{selected}</span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-36">
        <DropdownMenuRadioGroup
          value={menuValue}
          onValueChange={(next) => {
            if (next == null) return;
            onChange((next === EMPTY ? "" : next) as T);
          }}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value || EMPTY}
              value={option.value === "" ? EMPTY : option.value}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
