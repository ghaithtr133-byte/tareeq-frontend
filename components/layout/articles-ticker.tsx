/* eslint-disable @next/next/no-img-element -- public API article media can be remote. */
"use client";

import Link from "next/link";
import { FileText, Menu } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/container";
import {
  createArticleTickerRail,
  mergeArticleTickerItems,
  type ArticleTickerItem,
  type ArticleTickerPage,
} from "@/lib/article-ticker";

type Props = { initialPage: ArticleTickerPage };

const nextPageDelay = 600;
// Matches the current 40-second desktop pass while keeping the same pixel speed elsewhere.
const tickerPixelsPerSecond = 32;

export function ArticlesTicker({ initialPage }: Props) {
  const [items, setItems] = useState<ArticleTickerItem[]>(initialPage.items);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [groupRepeats, setGroupRepeats] = useState(1);
  const [marqueeDuration, setMarqueeDuration] = useState(40);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (initialPage.totalPages <= initialPage.page) return;

    const controller = new AbortController();
    let stopped = false;

    async function loadFollowingPages() {
      try {
        for (let page = initialPage.page + 1; page <= initialPage.totalPages; page += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, nextPageDelay));
          if (stopped) return;

          const response = await fetch(`/api/articles/ticker?page=${page}`, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });
          if (!response.ok) return;
          const payload = (await response.json()) as ArticleTickerPage;
          setItems((current) => mergeArticleTickerItems(current, payload.items));
        }
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") return;
      }
    }

    void loadFollowingPages();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [initialPage.page, initialPage.totalPages]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || items.length < 2) return;

    const updateRepeats = () => {
      const singleGroupWidth = track.scrollWidth / (2 * groupRepeats);
      if (!Number.isFinite(singleGroupWidth) || singleGroupWidth <= 0) return;

      const requiredRepeats = Math.max(1, Math.ceil(viewport.clientWidth / singleGroupWidth));
      setGroupRepeats((current) => (current === requiredRepeats ? current : requiredRepeats));

      const duration = Math.round((track.scrollWidth / 2 / tickerPixelsPerSecond) * 10) / 10;
      setMarqueeDuration((current) => (current === duration ? current : duration));
    };

    updateRepeats();
    const observer = new ResizeObserver(updateRepeats);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [groupRepeats, items.length]);

  if (!items.length) return null;

  const shouldAnimate = items.length > 1;
  const tickerRail = shouldAnimate
    ? createArticleTickerRail(Array.from({ length: groupRepeats }, () => items).flat())
    : [];

  return (
    <section
      className="overflow-hidden border-b border-[#C8A253]/35 bg-[#082B50] text-white"
      aria-label="مقالات مختارة"
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
      }}
    >
      <Container className="flex h-9 items-stretch">
        <span className="flex shrink-0 items-center gap-2 pe-2 text-[0.625rem] font-extrabold tracking-[0.12em] text-[#F5D98E] sm:pe-2 sm:text-[0.6875rem]">
          <Menu className="size-3 shrink-0" aria-hidden="true" />
          <span>مقالات مختارة</span>
        </span>
        <div className="flex min-w-0 flex-1 items-center">
          {shouldAnimate ? (
            <div ref={viewportRef} className="flex min-w-0 flex-1 items-center justify-start overflow-hidden" dir="rtl">
              <div
                ref={trackRef}
                className={`flex w-max shrink-0 items-center whitespace-nowrap motion-reduce:animate-none animate-[ticker-marquee_linear_infinite] ${interactionPaused || reducedMotion ? "[animation-play-state:paused]" : ""}`}
                style={{ animationDuration: `${marqueeDuration}s` }}
              >
                {tickerRail.map((item, index) => (
                  <span key={`${item.id}-${item.copy}-${index}`} className="flex items-center">
                    <Link
                      href={`/articles/${item.slug}`}
                      className={`flex items-center gap-2 text-xs font-bold leading-5 text-white/90 transition-colors hover:text-[#F5D98E] focus-visible:text-[#F5D98E] ${index % items.length === 0 ? "px-3" : "px-5"}`}
                      dir="rtl"
                      aria-hidden={item.copy === 1 || undefined}
                      tabIndex={item.copy === 1 ? -1 : undefined}
                    >
                      {item.coverImageUrl ? <img src={item.coverImageUrl} alt="" className="size-5 rounded object-cover" loading="lazy" /> : <span className="grid size-5 place-items-center rounded bg-white/10 text-[#F5D98E]"><FileText className="size-3" aria-hidden="true" /></span>}
                      {item.titleAr}
                    </Link>
                    <span className="size-1 rounded-full bg-[#C8A253]" aria-hidden="true" />
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <Link href={`/articles/${items[0].slug}`} className="flex min-w-0 items-center gap-2 px-3 text-xs font-bold leading-5 text-white/90 transition-colors hover:text-[#F5D98E] focus-visible:text-[#F5D98E]" dir="rtl">
              {items[0].coverImageUrl ? <img src={items[0].coverImageUrl} alt="" className="size-5 shrink-0 rounded object-cover" loading="lazy" /> : <span className="grid size-5 shrink-0 place-items-center rounded bg-white/10 text-[#F5D98E]"><FileText className="size-3" aria-hidden="true" /></span>}
              <span className="truncate">{items[0].titleAr}</span>
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}
