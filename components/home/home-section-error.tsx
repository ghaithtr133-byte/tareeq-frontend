"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/content-state";

export function HomeSectionError({ title, description }: { title: string; description: string }) {
  const router = useRouter();
  const [retrying, startTransition] = useTransition();
  // Refresh preserves the current page while the bounded server requests are retried.
  return <ErrorState title={title} description={description} retrying={retrying} onRetry={() => startTransition(() => router.refresh())} />;
}
