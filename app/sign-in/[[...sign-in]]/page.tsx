import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { FintechLogoIcon } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-[var(--accent)] text-[#1a0a00] shadow-lg">
          <FintechLogoIcon className="size-5" />
        </span>
        <div>
          <p className="text-[1.15rem] font-semibold leading-none tracking-[-0.04em] text-[var(--ink)]">
            Fintech Finance
          </p>
          <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.15em] text-[var(--muted)]">
            Finance Platform
          </p>
        </div>
      </div>

      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#f97316",
            colorBackground: "var(--surface)",
            borderRadius: "0.875rem",
            fontFamily: "var(--font-display), sans-serif",
          },
          elements: {
            card: "shadow-2xl border border-[var(--line)] bg-[var(--surface)]",
            headerTitle: "text-[var(--ink)] font-semibold tracking-tight",
            headerSubtitle: "text-[var(--muted)]",
            socialButtonsBlockButton:
              "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-raised)] transition",
            dividerLine: "bg-[var(--line)]",
            dividerText: "text-[var(--muted)]",
            formFieldLabel: "text-[var(--ink-soft)] text-sm font-medium",
            formFieldInput:
              "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] placeholder:text-[var(--muted-soft)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition rounded-xl",
            formButtonPrimary:
              "bg-[var(--accent)] text-[#1a0a00] font-semibold hover:bg-[var(--accent-strong)] transition shadow-none",
            footerActionLink:
              "text-[var(--accent)] hover:text-[var(--accent-strong)] font-medium",
            identityPreviewEditButton: "text-[var(--accent)]",
          },
        }}
      />
    </div>
  );
}
