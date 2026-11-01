"use client";

import { useEffect, useRef } from "react";
import { List } from "lucide-react";
import type { ArticleTocItem } from "@/lib/article-toc";
import { useArticleReading } from "@/components/public/article-reading-layout";

type Props = { items: ArticleTocItem[]; variant?: "responsive" | "mobile" | "desktop" };

function TocLinks({ items }: Props) {
  const list = useRef<HTMLOListElement>(null);
  const { activeId, navigate } = useArticleReading();
  useEffect(() => {
    const target = list.current?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!list.current || !target) return;
    const bounds = list.current.getBoundingClientRect();
    const current = target.getBoundingClientRect();
    // Reveal the active item INSIDE the TOC, without scrolling the article/page.
    if (current.top < bounds.top) list.current.scrollTop -= bounds.top - current.top;
    else if (current.bottom > bounds.bottom) list.current.scrollTop += current.bottom - bounds.bottom;
  }, [activeId]);
  return <ol ref={list} className="mt-3 max-h-[max(8rem,min(38dvh,calc(100dvh-var(--article-header-offset,6rem)-24rem)))] space-y-1 overflow-y-auto overscroll-contain text-sm">
    {items.map((item) => <li key={item.id} className={item.level === 3 ? "ms-3" : ""}><a href={`#${item.id}`} data-toc-id={item.id} style={{ borderInlineEndColor: activeId === item.id ? "var(--accent)" : "transparent" }} aria-current={activeId === item.id ? "location" : undefined} onClick={(event) => { event.preventDefault(); navigate(item.id); }} className={`flex min-h-11 items-center gap-2 rounded-lg border-e-2 px-3 py-2 leading-6 transition-colors motion-reduce:transition-none ${activeId === item.id ? "border-accent bg-[#FBF5E9] font-bold text-[#8A6326]" : "border-transparent text-primary hover:bg-secondary/70"}`}><span className={`size-2 shrink-0 rounded-full border ${activeId === item.id ? "border-accent bg-accent" : "border-[#AEBBC9]"}`} aria-hidden="true" /><span className="min-w-0 [overflow-wrap:anywhere]">{item.text}</span></a></li>)}
  </ol>;
}

export function ArticleTableOfContents({ items, variant = "responsive" }: Props) {
  if (!items.length) return null;
  return <>
    {variant !== "desktop" ? <details className={`rounded-xl border border-[#E1E7EE] bg-white px-4 py-2 shadow-sm ${variant === "responsive" ? "xl:hidden" : ""}`}><summary className="min-h-11 cursor-pointer text-sm font-bold leading-10 text-primary">فهرس المقال<span className="ms-2 text-xs font-normal text-muted-foreground">عرض العناوين</span></summary><nav aria-label="فهرس المقال"><TocLinks items={items} /></nav></details> : null}
    {variant !== "mobile" ? <nav aria-label="فهرس المقال" className={`rounded-2xl border border-[#E1E7EE] bg-white p-4 shadow-[0_4px_18px_-12px_rgba(8,43,80,0.2)] ${variant === "responsive" ? "hidden xl:block" : ""}`}><h2 className="flex items-center gap-2 text-lg font-bold text-primary"><List className="size-5" aria-hidden="true" />فهرس المقال</h2><TocLinks items={items} /></nav> : null}
  </>;
}
