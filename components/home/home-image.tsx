"use client";

/* eslint-disable @next/next/no-img-element -- Homepage content can use optional public API images. */
import { useState } from "react";
import { ImageOff } from "lucide-react";

export function HomeImage({ src, alt = "", className = "" }: { src?: string; alt?: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return src && src !== failedSource ? <img src={src} draggable={false} alt={alt} className={`h-full w-full object-cover ${className}`} loading="lazy" onError={() => setFailedSource(src)} /> : <div className={`grid h-full w-full place-items-center bg-[#EAF0F6] text-[#7890A8] ${className}`}><span className="flex max-w-full flex-col items-center gap-1 px-1 text-center text-xs leading-5"><ImageOff className="size-8 shrink-0" aria-hidden="true" /><span>غير متوفر حالياً</span></span></div>;
}
