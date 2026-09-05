"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerAction } from "../actions/register.action";
import {
  passwordRules,
  registerSchema,
  type RegisterInput,
} from "../validation/register.validation";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onChange",
  });

  const passwordValue = form.watch("password");

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const result = await registerAction(values);

      if (result.status === "success") {
        toast.success(result.message);
        const target = result.email
          ? `/verifyEmail?email=${encodeURIComponent(result.email)}`
          : "/verifyEmail";
        router.push(target);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start storing and sharing your files securely.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input
                      autoComplete="name"
                      placeholder="Jane Doe"
                      className="h-11 rounded-lg bg-background pl-10 text-sm"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-11 rounded-lg bg-background pl-10 text-sm"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="h-11 rounded-lg bg-background pl-10 pr-10 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                {/* Live requirements checklist — shows exactly what's missing */}
                <ul className="mt-2 space-y-1.5">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(passwordValue ?? "");
                    return (
                      <li
                        key={rule.label}
                        className={cn(
                          "flex items-center gap-2 text-xs transition-colors",
                          passed ? "text-emerald-600" : "text-muted-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full",
                            passed
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {passed ? (
                            <Check className="size-3" strokeWidth={3} />
                          ) : (
                            <X className="size-3" strokeWidth={3} />
                          )}
                        </span>
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>

      <Link
        href="/"
        className="mt-4 flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
      >
        Back to Home
      </Link>
    </div>
  );
}
