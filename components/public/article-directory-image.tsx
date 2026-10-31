"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { articleImageSource } from "@/lib/article-directory";

export function ArticleDirectoryImage({ src, alt, prominent }: { src: string | null; alt: string; prominent: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);
  const source = articleImageSource(src);
  if (!source || failed === source) return <div role="img" aria-label="رسم تعليمي بديل من أكاديمية طريق" className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#255B84] via-primary to-[#0B2544] text-[#D7B578]"><BookOpen className="size-12" strokeWidth={1.2} aria-hidden="true" /><span className="text-[0.6875rem] tracking-widest text-white/75" dir="ltr">TAREEQ ACADEMY</span></div>;
  return <Image src={source} alt={alt} fill unoptimized={!source.startsWith("/")} loading={prominent ? "eager" : "lazy"} sizes={prominent ? "(min-width: 768px) 48vw, 100vw" : "(min-width: 1280px) 24vw, (min-width: 768px) 48vw, 100vw"} onError={() => setFailed(source)} style={{ objectPosition: source.includes("/hero/") ? "center 30%" : "center" }} className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025] motion-reduce:transition-none" />;
}
