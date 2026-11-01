"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { ArticleTocItem } from "@/lib/article-toc";

const ReadingContext = createContext<{ activeId: string | null; navigate: (id: string) => void }>({ activeId: null, navigate() {} });
export const useArticleReading = () => useContext(ReadingContext);

/** One observer/header measurement shared by the desktop and mobile TOCs. */
export function ArticleReadingLayout({ items, children }: { items: ArticleTocItem[]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const offset = useRef(96);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.sticky");
    const ticker = document.querySelector<HTMLElement>('[aria-label="أحدث المقالات المنشورة"]');
    function measure() {
      const fixedTicker = ticker && ["sticky", "fixed"].includes(getComputedStyle(ticker).position);
      offset.current = (header?.getBoundingClientRect().height ?? 72) + (fixedTicker ? ticker!.getBoundingClientRect().height : 0) + 16;
      root.current?.style.setProperty("--article-header-offset", `${offset.current}px`);
    }
    measure();
    const resize = new ResizeObserver(measure);
    if (header) resize.observe(header);
    if (ticker) resize.observe(ticker);
    const headings = items.map((item) => document.getElementById(item.id)).filter((item): item is HTMLElement => Boolean(item));
    let frame = 0;
    const update = () => {
      frame = 0;
      const reached = headings.filter((heading) => heading.getBoundingClientRect().top <= offset.current + 16);
      setActiveId((reached.at(-1) ?? headings[0])?.id ?? null);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(schedule, { threshold: [0, 1] });
    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener("scroll", schedule, { passive: true });
    update();
    return () => { resize.disconnect(); observer.disconnect(); window.removeEventListener("scroll", schedule); cancelAnimationFrame(frame); };
  }, [items]);

  function navigate(id: string) {
    const heading = document.getElementById(id);
    if (!heading) return;
    history.pushState(null, "", `#${encodeURIComponent(id)}`);
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: heading.getBoundingClientRect().top + window.scrollY - offset.current, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <ReadingContext.Provider value={{ activeId, navigate }}><div ref={root} data-article-reading-layout>{children}</div></ReadingContext.Provider>;
}
