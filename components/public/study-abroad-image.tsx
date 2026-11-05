"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";

export function StudyAbroadImage({ src, alt, unavailableLabel }: { src: string | null; alt: string; unavailableLabel?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className="grid h-full place-items-center text-[#9DB0C1]">{unavailableLabel ? <span className="flex flex-col items-center gap-2"><GraduationCap className="size-14" strokeWidth={1.2} aria-hidden="true" /><span className="px-3 text-center text-sm leading-6">{unavailableLabel}</span></span> : <GraduationCap className="size-14" strokeWidth={1.2} aria-hidden="true" />}</span>;
  // Public API images can be hosted on arbitrary domains.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" loading="lazy" />;
}
