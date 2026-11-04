import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Count = 1 | 2 | 3 | 4 | 5;
type Breakpoint = "sm" | "md" | "lg" | "xl";
const columnsAt = {
  sm: { 1: "sm:[--card-columns:1]", 2: "sm:[--card-columns:2]", 3: "sm:[--card-columns:3]", 4: "sm:[--card-columns:4]", 5: "sm:[--card-columns:5]" },
  md: { 1: "md:[--card-columns:1]", 2: "md:[--card-columns:2]", 3: "md:[--card-columns:3]", 4: "md:[--card-columns:4]", 5: "md:[--card-columns:5]" },
  lg: { 1: "lg:[--card-columns:1]", 2: "lg:[--card-columns:2]", 3: "lg:[--card-columns:3]", 4: "lg:[--card-columns:4]", 5: "lg:[--card-columns:5]" },
  xl: { 1: "xl:[--card-columns:1]", 2: "xl:[--card-columns:2]", 3: "xl:[--card-columns:3]", 4: "xl:[--card-columns:4]", 5: "xl:[--card-columns:5]" },
} as const;

/** Fixed responsive card bases, no filler items or growing last-row cards. */
export function BalancedCardGrid({ columns = {}, gap = 5, className, style, ...props }: ComponentPropsWithoutRef<"div"> & { columns?: Partial<Record<Breakpoint, Count>>; gap?: 4 | 5 }) {
  return <div {...props} data-balanced-cards="" style={{ "--card-gap": gap === 4 ? "1rem" : "1.25rem", ...style } as CSSProperties} className={cn(
    "flex flex-wrap items-stretch justify-center [--card-columns:1] gap-[var(--card-gap)] [&>*]:min-w-0 [&>*]:grow-0 [&>*]:shrink [&>*]:basis-[calc((100%_-_(var(--card-columns,1)_-_1)_*_var(--card-gap))_/_var(--card-columns,1))] [&>*]:max-w-[32rem]",
    (Object.entries(columns) as [Breakpoint, Count][]).map(([breakpoint, count]) => columnsAt[breakpoint][count]), className,
  )} />;
}
