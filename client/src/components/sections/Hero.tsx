"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  FileSpreadsheet,
  FileText,
  Folder,
  Image as ImageIcon,
  Presentation,
  Share2,
  Shield,
  Star,
  Trash2,
} from "lucide-react";
import cloudIcon from "@/app/icon.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const folders = [
  { name: "Documents", count: 24, color: "text-primary" },
  { name: "Projects", count: 12, color: "text-sky-500" },
  { name: "Photos", count: 86, color: "text-indigo-500" },
  { name: "Designs", count: 9, color: "text-blue-400" },
];

const recentFiles = [
  { name: "Q3_Budget.xlsx", size: "1.2 MB", Icon: FileSpreadsheet },
  { name: "Contract.pdf", size: "840 KB", Icon: FileText },
  { name: "Cover.jpg", size: "2.4 MB", Icon: ImageIcon },
  { name: "Pitch.pptx", size: "5.1 MB", Icon: Presentation },
];

const sidebarItems = [
  { label: "All Files", Icon: Folder, active: true },
  { label: "Recent", Icon: Clock },
  { label: "Shared", Icon: Share2 },
  { label: "Favorites", Icon: Star },
  { label: "Trash", Icon: Trash2 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-blue-50/80 via-indigo-50/40 to-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.14),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-40 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-[11px] font-medium text-primary shadow-sm backdrop-blur-sm sm:mb-6 sm:text-xs"
          >
            <Shield className="size-3.5 shrink-0" />
            <span className="truncate">Secure Cloud Storage & File Management</span>
          </motion.div>

          <motion.h1
            custom={0.08}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[1.75rem] font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Store, Access, and Share Files{" "}
            <span className="text-primary">Securely</span>
          </motion.h1>

          <motion.p
            custom={0.16}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Upload, organize, and collaborate on your files in one encrypted
            workspace. Built for teams that need speed without compromising
            control.
          </motion.p>

          <motion.div
            custom={0.24}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-8 flex w-full max-w-sm flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center"
          >
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
            >
              Start Free Trial
            </Link>
            <Link
              href="#pricing"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
            >
              View Plans
            </Link>
          </motion.div>

          <motion.ul
            custom={0.32}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground sm:flex-row sm:gap-5"
          >
            {[
              "14-Day Free Trial",
              "No Credit Card Required",
              "End-to-End Encryption",
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-12 max-w-4xl sm:mt-16"
        >
          <div className="pointer-events-none absolute left-1/2 top-8 size-40 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:size-64" />

          <div className="relative z-10 -mb-6 flex justify-center sm:-mb-10">
            <Image
              src={cloudIcon}
              alt="Cloud Upload"
              width={120}
              height={120}
              priority
              className="size-20 drop-shadow-2xl sm:size-30"
            />
          </div>

          <div className="relative overflow-hidden rounded-xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-md sm:rounded-2xl">
            <div className="flex sm:min-h-95">
              <aside className="hidden w-44 shrink-0 flex-col border-r border-border/70 bg-secondary/60 p-4 sm:flex">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Library
                </p>
                <nav className="flex flex-1 flex-col gap-1">
                  {sidebarItems.map(({ label, Icon, active }) => (
                    <span
                      key={label}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium ${
                        active
                          ? "bg-background text-primary shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </span>
                  ))}
                </nav>
                <div className="mt-4 rounded-lg bg-background/80 p-2.5">
                  <div className="mb-1.5 flex justify-between text-[10px] text-muted-foreground">
                    <span>Storage</span>
                    <span>64%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-accent">
                    <div className="h-full w-[64%] rounded-full bg-primary" />
                  </div>
                </div>
              </aside>

              <div className="min-w-0 flex-1 p-3.5 sm:p-6">
                <div className="mb-4 sm:mb-5">
                  <p className="text-sm font-semibold text-foreground">All Files</p>
                  <p className="text-xs text-muted-foreground">
                    4 folders · 128 files
                  </p>
                </div>

                <div className="mb-4 flex flex-wrap gap-2 sm:hidden">
                  {sidebarItems.map(({ label, Icon, active }) => (
                    <span
                      key={label}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-3" />
                      {label}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  {folders.map((folder) => (
                    <div
                      key={folder.name}
                      className="min-w-0 rounded-xl border border-border/70 bg-background p-2.5 shadow-sm sm:p-3"
                    >
                      <Folder className={`mb-2 size-6 sm:size-7 ${folder.color}`} />
                      <p className="truncate text-xs font-semibold text-foreground">
                        {folder.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {folder.count} files
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-5 mb-3 text-xs font-semibold text-muted-foreground sm:mt-6">
                  Recent files
                </p>
                <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:grid-cols-4">
                  {recentFiles.map(({ name, size, Icon }) => (
                    <div
                      key={name}
                      className="flex min-w-0 items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-2.5 py-2"
                    >
                      <Icon className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-foreground">
                          {name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
