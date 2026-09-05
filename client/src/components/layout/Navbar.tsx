"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/app/icon.png";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "Solutions", href: "/#solutions" },
  { name: "Pricing", href: "/#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-100 w-full transition-all duration-500",
        scrolled ? "py-2 sm:py-3" : "py-3 sm:py-5"
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
        <nav
          className={cn(
            "mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border border-border bg-background/90 px-2.5 py-1.5 shadow-sm shadow-primary/10 backdrop-blur-xl transition-all duration-500 sm:px-6 sm:py-2",
            scrolled && "sm:py-1.5"
          )}
        >
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <Image
              src={logo}
              alt="Gold Cloud"
              width={36}
              height={36}
              priority
              className="size-8 shrink-0 drop-shadow-md sm:size-9"
            />
            <span className="truncate text-sm font-semibold tracking-tight text-foreground max-[360px]:hidden">
              Gold Cloud
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 md:hidden">
            {!isMenuOpen && (
              <Link
                href="/login"
                className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground"
              >
                Sign in
              </Link>
            )}
            <button
              className="rounded-full p-1.5 text-foreground"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[-1] flex flex-col items-center overflow-y-auto bg-secondary/95 px-6 pb-10 pt-28 backdrop-blur-xl transition-all duration-500 md:hidden",
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        )}
      >
        <div className="flex w-full max-w-xs flex-col items-center gap-5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-semibold text-foreground hover:text-primary"
            >
              {link.name}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="text-2xl font-semibold text-primary"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
