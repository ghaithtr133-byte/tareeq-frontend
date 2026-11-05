"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";

export function ScholarshipDetailImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element -- Preserve published media without changing global image-domain configuration.
    <img src={src} alt={alt} loading="eager" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
  ) : <div role="img" aria-label="صورة المنحة (غير متوفر حالياً)" className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#25618E] via-[#143C63] to-[#082B50] text-[#E2BD73]"><GraduationCap className="size-16 sm:size-24" strokeWidth={1.1} aria-hidden="true" /><span className="px-3 text-center text-xs text-white/80">صورة المنحة (غير متوفر حالياً)</span></div>;
}
