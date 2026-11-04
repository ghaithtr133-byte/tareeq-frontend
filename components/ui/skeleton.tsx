import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Decorative only: the owning loading region supplies one accessible status. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} aria-hidden="true" className={cn("rounded-md bg-[#E5EBF2] motion-safe:animate-pulse motion-reduce:animate-none", className)} />;
}
