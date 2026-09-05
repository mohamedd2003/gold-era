"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Loader2, MailCheck, RotateCcw } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  resendCodeAction,
  verifyEmailAction,
} from "../actions/verifyEmail.action";

const RESEND_COOLDOWN = 30; // seconds

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isVerifying, startVerify] = useTransition();
  const [isResending, startResend] = useTransition();
  const [cooldown, setCooldown] = useState(0);
  const lastSubmitted = useRef<string>("");

  // Cooldown countdown for the resend button.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  function handleVerify(value?: string) {
    const finalCode = value ?? code;
    if (finalCode.length !== 6 || isVerifying) return;
    lastSubmitted.current = finalCode;

    startVerify(async () => {
      const result = await verifyEmailAction({ email, code: finalCode });

      if (result.status === "success") {
        toast.success(result.message);
        router.push("/login");
        router.refresh();
        return;
      }

      toast.error(result.message);
      setCode("");
    });
  }

  function handleResend() {
    if (cooldown > 0 || isResending) return;

    startResend(async () => {
      const result = await resendCodeAction({ email });

      if (result.status === "success") {
        toast.success(result.message);
        setCooldown(RESEND_COOLDOWN);
        setCode("");
        return;
      }

      toast.error(result.message);
    });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <MailCheck className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-foreground">
            {email || "your email"}
          </span>
          . Enter it below to activate your account.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(value) => {
            setCode(value);
            if (value.length === 6) handleVerify(value);
          }}
          disabled={isVerifying}
          containerClassName="justify-center"
        >
          <InputOTPGroup className="gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="size-12 rounded-lg border border-border bg-background text-lg font-semibold shadow-sm first:rounded-l-lg last:rounded-r-lg"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <button
          type="button"
          onClick={() => handleVerify()}
          disabled={code.length !== 6 || isVerifying}
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isVerifying ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify Email
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="inline-flex items-center gap-1.5 font-semibold text-primary underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {isResending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            <>
              <RotateCcw className="size-3.5" />
              Resend code
            </>
          )}
        </button>
      </div>

      <Link
        href="/login"
        className="mt-6 flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
      >
        Back to Sign in
      </Link>
    </div>
  );
}
