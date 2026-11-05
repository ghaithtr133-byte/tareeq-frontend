"use client";

import { useState, type ReactNode } from "react";

/** Original artwork remains decoration; missing Live media never borrows a Demo service image. */
export function ServiceCardMedia({ src, alt, children }: { src?: string; alt: string; children: ReactNode }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element -- Allow verified Backend media without editing shared Next Image configuration.
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
  ) : <>{children}<span className="absolute inset-x-0 bottom-0 bg-white/90 px-2 py-1 text-center text-xs leading-5 text-muted-foreground">صورة الخدمة (غير متوفر حالياً)</span></>;
}
