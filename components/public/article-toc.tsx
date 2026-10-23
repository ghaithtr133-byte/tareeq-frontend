"use client";

import { useEffect, useRef, useState } from "react";

import type { ArticleTocItem } from "@/lib/article-toc";

type Props = { items: ArticleTocItem[]; variant?: "responsive" | "mobile" | "desktop" };

function TocLinks({ activeId, items }: Props & { activeId: string | null }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!activeId) return;
    listRef.current?.querySelector<HTMLElement>(`[data-toc-id="${activeId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  return (
    <ol ref={listRef} className="mt-4 max-h-[min(42vh,21rem)] space-y-1 overflow-y-auto border-s border-primary/15 pe-2 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? "me-3" : ""}>
          <a
            href={`#${item.id}`}
            data-toc-id={item.id}
            aria-current={activeId === item.id ? "location" : undefined}
            className={`block border-s-2 px-3 py-2 leading-6 transition-colors motion-reduce:transition-none ${activeId === item.id
              ? "border-accent bg-[#F7F1E5] font-bold text-primary"
              : "border-transparent text-muted-foreground hover:bg-secondary/70 hover:text-primary"
              }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** A small client boundary for the disclosure and current-section indication. */
export function ArticleTableOfContents({ items, variant = "responsive" }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-28% 0px -62% 0px", threshold: 0 },
    );

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <>
      {(variant === "responsive" || variant === "mobile") ? <details className={`border border-primary/15 bg-card p-4 ${variant === "responsive" ? "xl:hidden" : ""}`}>
        <summary className="cursor-pointer list-none text-sm font-bold text-primary marker:hidden">
          فهرس المقال
          <span className="me-2 text-xs font-medium text-muted-foreground">عرض العناوين</span>
        </summary>
        <TocLinks items={items} activeId={activeId} />
      </details> : null}
      {(variant === "responsive" || variant === "desktop") ? <aside className={`${variant === "responsive" ? "sticky top-28 hidden xl:block" : ""} self-start border-s border-primary/15 ps-5`} aria-label="فهرس المقال">
        <p className="text-sm font-bold text-primary">فهرس المقال</p>
        <TocLinks items={items} activeId={activeId} />
      </aside> : null}
    </>
  );
}
