"use client";

import type { ReactNode } from "react";
import { CircleHelp, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

type StateProps = { title: string; description: string; icon?: ReactNode; action?: ReactNode; variant?: "compact" | "section"; className?: string };
const actionClass = "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#C8A253] bg-white px-4 py-2 text-sm font-bold text-[#082B50] transition-colors hover:bg-[#FAF4E7] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#A47B2D] disabled:opacity-60 motion-reduce:transition-none";

function StateSurface({ title, description, icon, action, variant = "compact", className, error = false }: StateProps & { error?: boolean }) {
  return <div role={error ? "alert" : undefined} dir="rtl" className={cn("min-w-0 rounded-2xl border border-[#E2E8EF] bg-[#F8FAFC] text-start text-[#082B50]", variant === "section" ? "p-6 sm:p-8" : "p-4 sm:p-5", className)}>
    <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FAF4E7] text-[#A47B2D] [&>svg]:size-5" aria-hidden="true">{icon}</span><div className="min-w-0"><h3 className="text-base font-bold leading-7 sm:text-lg">{title}</h3><p className="mt-1 max-w-2xl text-sm leading-7 text-[#52647A]">{description}</p>{action ? <div className="mt-3 flex flex-wrap gap-2 [&>a]:min-h-11 [&>a]:rounded-lg [&>a]:px-4 [&>a]:py-2 [&>a]:text-sm [&>a]:font-bold [&>a]:text-[#082B50] [&>a]:underline [&>a]:underline-offset-4">{action}</div> : null}</div></div>
  </div>;
}

export function EmptyState({ icon = <CircleHelp />, ...props }: StateProps) {
  return <StateSurface {...props} icon={icon} />;
}

export function ErrorState({ icon = <CloudOff />, onRetry, retrying = false, retryLabel = "إعادة المحاولة", action, ...props }: StateProps & { onRetry?: () => void; retrying?: boolean; retryLabel?: string }) {
  return <StateSurface {...props} error icon={icon} action={onRetry || action ? <>{onRetry ? <button type="button" onClick={onRetry} disabled={retrying} className={actionClass}>{retrying ? "جارٍ إعادة المحاولة…" : retryLabel}</button> : null}{action}</> : undefined} />;
}
