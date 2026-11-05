"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";

/** Scoped to Live directory cards; keep the original media geometry and neutral academic artwork. */
export function ScholarshipDirectoryMedia({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element -- Published media domains need not be installed in Next Image configuration.
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover contrast-[1.05] saturate-[1.15]" />
  ) : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#226EAB] via-[#124E80] to-[#082B50]">
    <span className="grid size-20 place-items-center rounded-full border border-[#C8A253]/60 bg-white/5 text-[#E1BF76]"><GraduationCap className="size-11" strokeWidth={1.2} aria-hidden="true" /></span>
    <span className="absolute bottom-3 px-2 text-center text-xs text-white/80">صورة المنحة (غير متوفر حالياً)</span>
  </div>;
}
