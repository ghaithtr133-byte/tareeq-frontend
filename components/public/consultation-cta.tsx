import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Scoped to consultation CTAs, not application controls or general site buttons.
export const consultationActionClass = "inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-lg bg-[#C8A253] bg-none px-5 py-2.5 text-sm font-bold leading-6 text-[#082B50] transition-colors duration-200 hover:bg-[#D8B96E] active:bg-[#BE9647] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white motion-reduce:transition-none [&>svg]:shrink-0";

type ConsultationCtaProps = Omit<ComponentPropsWithoutRef<"section">, "title" | "children"> & {
  as?: "section" | "aside";
  variant?: "closing" | "contextual";
  titleId: string;
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
  eyebrow?: string;
  backgroundImage?: string;
  decoration?: ReactNode;
  note?: ReactNode;
};

export function ConsultationCta({ as: Tag = "section", variant = "closing", titleId, title, description, action, eyebrow, backgroundImage, decoration, note, className, ...props }: ConsultationCtaProps) {
  const compact = variant === "contextual";
  return (
    <Tag {...props} data-consultation-cta={variant} aria-labelledby={titleId} className={cn("relative isolate min-w-0 overflow-hidden rounded-2xl border border-[#284969] bg-[#082B50] p-5 text-start text-white", !compact && "sm:p-6", className)}>
      {backgroundImage ? <>
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-left" style={{ backgroundImage: `url('${backgroundImage}')` }} />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[#082B50]/95 md:bg-transparent md:bg-gradient-to-l md:from-[#082B50] md:via-[#082B50]/95 md:to-[#082B50]/30" />
      </> : null}
      {!compact && decoration ? <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-6 -z-10 hidden w-1/5 items-center justify-center text-[#D6B16A]/60 md:flex [&>svg]:size-20 [&>svg]:max-w-full">{decoration}</div> : null}
      <div className={cn("relative min-w-0", !compact && "max-w-2xl md:w-[72%]")}>
        {eyebrow ? <p className="mb-1 text-xs font-bold leading-6 text-[#E2C483]">{eyebrow}</p> : null}
        <h2 id={titleId} className={compact ? "text-lg font-bold leading-8" : "text-xl font-bold leading-8"}>{title}</h2>
        <p className={cn("mt-1 text-sm leading-7 text-white/85", !compact && "max-w-xl")}>{description}</p>
        <div className={cn("mt-3 flex min-w-0 flex-wrap gap-2", compact && "[&>a]:w-full [&>button]:w-full")}>{action}</div>
        {note ? <p className="mt-3 text-xs leading-6 text-white/75">{note}</p> : null}
      </div>
    </Tag>
  );
}
