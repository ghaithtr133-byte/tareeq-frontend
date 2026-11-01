"use client";

import Image from "next/image";
import { useState } from "react";
import { BriefcaseBusiness, ClipboardList, Compass, FileText, GraduationCap, HandCoins } from "lucide-react";
import type { ServiceKind } from "@/lib/service-details";

const serviceDetailIcons = { admissions: GraduationCap, major: Compass, scholarships: HandCoins, documents: FileText, "follow-up": ClipboardList, general: BriefcaseBusiness };

export function ServiceDetailIcon({ kind, className }: { kind: ServiceKind; className?: string }) {
  const Icon = serviceDetailIcons[kind];
  return <Icon className={className} strokeWidth={1.6} aria-hidden="true" />;
}

export function ServiceDetailMedia({ media, kind, title, hero = false }: {
  media: { src: string; alt: string } | null; kind: ServiceKind; title: string; hero?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = serviceDetailIcons[kind];
  return <div className={`relative h-full w-full overflow-hidden ${hero ? "bg-[#EFF4F8]" : "bg-[#EDF3F8]"}`}>
    {media && !failed ? <Image src={media.src} alt={media.alt} fill sizes={hero ? "(min-width: 768px) 52vw, 100vw" : "96px"} unoptimized={!media.src.startsWith("/")} priority={hero} onError={() => setFailed(true)} className="object-cover" style={{ objectPosition: kind === "admissions" ? "36% 42%" : "center" }} /> : <div role="img" aria-label={`رسم توضيحي لخدمة ${title}`} className="grid h-full min-h-24 place-items-center bg-gradient-to-br from-[#E1EBF4] via-[#F7F9FB] to-[#F7EAD2]"><Icon className={hero ? "size-20 text-[#A88950]" : "size-10 text-[#A88950]"} strokeWidth={1.3} aria-hidden="true" /></div>}
  </div>;
}
