"use client";

import { usePathname } from "next/navigation";
import { HomeHero } from "@/components/home/home-hero";
import { PublicPageSkeleton, HomeContentSkeleton } from "@/components/public/content-skeletons";

export default function Loading() {
  const pathname = usePathname();
  // Other routes have their own geometry; unknown public routes use the neutral shell.
  if (pathname !== "/") return <PublicPageSkeleton />;
  return <main className="overflow-x-clip bg-[#FAF9F6]" aria-busy="true">
    <HomeHero pending />
    <HomeContentSkeleton />
  </main>;
}
