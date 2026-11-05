"use client";

import Image from "next/image";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { articleImageSource } from "@/lib/article-directory";

export function ArticleDetailMedia({ src, alt, compact = false, live = false }: { src: string | null; alt: string | null; compact?: boolean; live?: boolean }) {
  const source = articleImageSource(src);
  const [failed, setFailed] = useState<string | null>(null);
  if (!source || source === failed) return <div role="img" aria-label={live ? "الصورة (غير متوفر حالياً)" : "رسم أكاديمي بديل من أكاديمية طريق"} className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#265E88] via-primary to-[#082B50] text-[#D9B670]"><GraduationCap className={compact ? "size-8" : "size-20"} strokeWidth={1.2} aria-hidden="true" />{live && !compact ? <span className="text-sm">الصورة (غير متوفر حالياً)</span> : null}</div>;
  return <Image src={source} alt={alt ?? ""} fill sizes={compact ? "96px" : "(min-width: 1280px) 50vw, (min-width: 1024px) 65vw, 100vw"} loading={compact ? "lazy" : "eager"} unoptimized={!source.startsWith("/")} onError={() => setFailed(source)} className="object-cover" style={{ objectPosition: source.includes("/hero/") ? "center 30%" : "center" }} />;
}
