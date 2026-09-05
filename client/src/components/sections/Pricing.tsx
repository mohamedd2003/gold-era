"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    blurb: "Perfect for individuals",
    price: "$0",
    period: "forever",
    cta: "Get Started",
    href: "/register",
    featured: false,
    buttonClass: "bg-accent text-primary hover:bg-accent/80",
    features: ["5 GB Storage", "Basic File Sharing", "Web Access", "Email Support"],
  },
  {
    name: "Pro",
    blurb: "For professionals",
    price: "$9.99",
    period: "/month",
    cta: "Start Free Trial",
    href: "/register",
    featured: true,
    buttonClass: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
    features: ["1 TB Storage", "Advanced Sharing", "Version History", "Priority Support"],
  },
  {
    name: "Business",
    blurb: "For teams",
    price: "$19.99",
    period: "/user/month",
    cta: "Start Free Trial",
    href: "/register",
    featured: false,
    buttonClass: "border border-primary bg-background text-primary hover:bg-secondary",
    features: ["5 TB Storage", "Team Workspaces", "Admin Controls", "24/7 Support"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-secondary py-14 sm:scroll-mt-28 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid gap-8 sm:gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-background p-5 shadow-sm sm:p-6",
                plan.featured
                  ? "mt-3 border-primary shadow-xl shadow-primary/10 lg:mt-0"
                  : "border-border"
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
              <p className="mt-5 flex items-end gap-1">
                <span
                  className={cn(
                    "text-4xl font-bold",
                    plan.featured ? "text-primary" : "text-foreground"
                  )}
                >
                  {plan.price}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">{plan.period}</span>
              </p>

              <Link
                href={plan.href}
                className={cn(
                  "mt-6 inline-flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition",
                  plan.buttonClass
                )}
              >
                {plan.cta}
              </Link>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="size-4 text-emerald-500" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
