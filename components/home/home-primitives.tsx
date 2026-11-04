import type { ComponentProps } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

/** Homepage-only width: shared directory/detail/header containers remain unchanged. */
export function HomeContainer({ className, ...props }: ComponentProps<typeof Container>) {
  return <Container {...props} className={cn("2xl:max-w-[112rem]", className)} />;
}

/** Prevent native link dragging, not text selection, pointer clicks, or touch scrolling. */
export function HomeLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} draggable={false} />;
}
