"use client";

import { motion } from "framer-motion";
import { Globe, Lock, ShieldCheck, Users } from "lucide-react";

const features = [
  {
    title: "End-to-End Encryption",
    description: "Your files are encrypted before they leave your device.",
    Icon: Lock,
  },
  {
    title: "Secure Backup",
    description: "Automatic backup keeps your files safe and recoverable.",
    Icon: ShieldCheck,
  },
  {
    title: "Access Anywhere",
    description: "Reach your files from any device, anytime.",
    Icon: Globe,
  },
  {
    title: "Granular Permissions",
    description: "Control who can view, edit, and share your files.",
    Icon: Users,
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-secondary py-14 sm:scroll-mt-28 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Secure Storage You Can Trust
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Your files are protected with enterprise-grade security and encryption.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {features.map(({ title, description, Icon }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-2xl border border-border/70 bg-background p-5 shadow-sm sm:p-6"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
