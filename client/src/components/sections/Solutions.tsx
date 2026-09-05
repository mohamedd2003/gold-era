"use client";

import { motion } from "framer-motion";
import { Check, Folder } from "lucide-react";

const points = [
  "Real-time file sharing",
  "Collaborative workspaces",
  "Version history & recovery",
  "Team access controls",
];

const files = [
  {
    title: "Campaign Assets",
    meta: "Shared folder • 5 members",
    icon: <Folder className="size-5 text-primary" />,
  },
  {
    title: "Marketing_Plan.pdf",
    meta: "Edited 2h ago by Sarah M.",
    icon: (
      <span className="flex size-8 items-center justify-center rounded-md bg-red-50 text-[10px] font-bold text-red-600">
        PDF
      </span>
    ),
  },
  {
    title: "Design_System.fig",
    meta: "Edited 5m ago by Mike R.",
    icon: (
      <span className="flex size-8 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-700">
        FIG
      </span>
    ),
  },
];

export function Solutions() {
  return (
    <section id="solutions" className="scroll-mt-24 bg-background py-12 sm:scroll-mt-28 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-secondary px-4 py-8 sm:rounded-[2rem] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                Team Collaboration
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                Work Better <span className="text-primary">Together</span>
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Share files, collaborate in real-time, and boost team productivity
                with ease.
              </p>
              <ul className="mt-8 space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="rounded-2xl border border-white/50 bg-background p-4 shadow-2xl shadow-primary/10 sm:rounded-3xl sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
                <h3 className="min-w-0 truncate font-semibold text-foreground">
                  Project Files
                </h3>
                <div className="flex shrink-0 items-center">
                  {["SM", "MR", "JL"].map((initials, i) => (
                    <span
                      key={initials}
                      className="-ml-2 flex size-7 first:ml-0 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white sm:size-8"
                      style={{
                        backgroundColor: ["#2563eb", "#38bdf8", "#6366f1"][i],
                        zIndex: 3 - i,
                      }}
                    >
                      {initials}
                    </span>
                  ))}
                  <span className="-ml-2 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground sm:size-8">
                    +2
                  </span>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4">
                {files.map((file) => (
                  <li key={file.title} className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      {file.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {file.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {file.meta}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
