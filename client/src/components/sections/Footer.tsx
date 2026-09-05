import Image from "next/image";
import Link from "next/link";
import { Cloud, Lock, Mail } from "lucide-react";
import logo from "@/app/icon.png";

const productLinks = [
  { name: "Features", href: "/#features" },
  { name: "Solutions", href: "/#solutions" },
  { name: "Pricing", href: "/#pricing" },
];

const accountLinks = [
  { name: "Sign in", href: "/login" },
  { name: "Get Started", href: "/register" },
];

const companyLinks = [
  { name: "Privacy", href: "#" },
  { name: "Terms", href: "#" },
  { name: "Support", href: "mailto:hello@goldcloud.app" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pt-20">
        <div className="rounded-3xl border border-primary/10 bg-secondary px-4 py-8 shadow-sm shadow-primary/5 sm:rounded-[2rem] sm:px-10 sm:py-10 lg:px-14">
          <div className="flex flex-col items-stretch justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                <Cloud className="size-3.5" />
                Gold Cloud
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Store your files{" "}
                <span className="text-primary">securely</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Encrypted workspace for teams that need speed without losing
                control.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background/80"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
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
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Secure cloud storage and file management — upload, organize, and
              share in one place.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <Lock className="size-3.5" />
              End-to-end encryption
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Product
            </p>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Account
            </p>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </p>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@goldcloud.app"
              className="mt-5 inline-flex max-w-full items-center gap-2 break-all text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Mail className="size-3.5" />
              hello@goldcloud.app
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 text-center sm:mt-12 sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gold Cloud. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for secure file management
          </p>
        </div>
      </div>
    </footer>
  );
}
