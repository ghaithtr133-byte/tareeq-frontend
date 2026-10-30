"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";

/* API images may use domains not configured for Next Image. */
export function UniversityDirectoryImage({ src, alt, className = "aspect-[16/9]" }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={`overflow-hidden bg-[#EAF0F6] ${className}`}>{src && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />
  ) : <div className="grid h-full place-items-center text-[#A9BDCE]" aria-hidden="true"><GraduationCap className="size-14" strokeWidth={1.2} /></div>}</div>;
}
