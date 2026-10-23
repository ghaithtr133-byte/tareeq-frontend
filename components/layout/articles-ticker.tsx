"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

import {
  mergeArticleTickerItems,
  type ArticleTickerItem,
  type ArticleTickerPage,
} from "@/lib/article-ticker";

type Props = { initialPage: ArticleTickerPage };

const rotationInterval = 8_000;
const nextPageDelay = 600;

export function ArticlesTicker({ initialPage }: Props) {
  const [items, setItems] = useState<ArticleTickerItem[]>(initialPage.items);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

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
      for (let page = initialPage.page + 1; page <= initialPage.totalPages; page += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, nextPageDelay));
        if (stopped) return;

        try {
          const response = await fetch(`/api/articles/ticker?page=${page}`, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });
          if (!response.ok) return;
          const payload = (await response.json()) as ArticleTickerPage;
          setItems((current) => mergeArticleTickerItems(current, payload.items));
        } catch (error) {
          if ((error as DOMException).name !== "AbortError") return;
        }
      }
    }

    void loadFollowingPages();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [initialPage.page, initialPage.totalPages]);

  useEffect(() => {
    if (manuallyPaused || interactionPaused || reducedMotion || items.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, rotationInterval);
    return () => window.clearInterval(timer);
  }, [interactionPaused, items.length, manuallyPaused, reducedMotion]);

  if (!items.length) return null;

  const safeActiveIndex = activeIndex < items.length ? activeIndex : 0;
  const activeItem = items[safeActiveIndex];
  const changeArticle = (direction: 1 | -1) => {
    setManuallyPaused(true);
    setActiveIndex((current) => (current + direction + items.length) % items.length);
  };

  return (
    <section
      className="overflow-hidden border-b border-[#C3A36B]/35 bg-[#F6F2E9] text-primary"
      aria-label="أحدث المقالات المنشورة"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
      }}
    >
      <div className="mx-auto flex min-h-11 max-w-7xl items-stretch px-4 sm:px-8">
        <span className="-my-px ms-0 flex shrink-0 items-center border-b-2 border-[#C3A36B] bg-[#172F50] px-3 text-[0.625rem] font-extrabold tracking-[0.12em] text-[#F7E7BF] sm:px-4 sm:text-[0.6875rem]">أحدث المقالات</span>
        <div className="flex min-w-0 flex-1 items-center gap-2 ps-3 sm:ps-4">
          <span className="hidden h-4 w-px shrink-0 bg-[#C3A36B]/60 sm:block" aria-hidden="true" />
          <div className="hidden min-w-0 flex-1 overflow-hidden sm:block" dir="ltr">
            <div className={`flex w-max items-center whitespace-nowrap motion-reduce:translate-x-0 ${manuallyPaused || interactionPaused || reducedMotion ? "[animation-play-state:paused]" : "animate-[ticker-marquee_75s_linear_infinite]"}`}>
              {[...items, ...items].map((item, index) => (
                <span key={`${item.id}-${index}`} className="flex items-center" aria-hidden={index >= items.length}>
                  <Link href={`/articles/${item.slug}`} tabIndex={index >= items.length ? -1 : undefined} className="px-5 text-sm font-semibold leading-5 text-[#203A5E] transition-colors hover:text-[#8A6428] focus-visible:text-[#8A6428]" dir="rtl">
                    {item.titleAr}
                  </Link>
                  <span className="size-1 rounded-full bg-[#C3A36B]/70" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
          <Link
            href={`/articles/${activeItem.slug}`}
            className="min-w-0 flex-1 truncate rounded-sm py-2 text-sm font-semibold leading-5 text-[#203A5E] transition-colors hover:text-[#8A6428] focus-visible:text-[#8A6428] sm:hidden"
            aria-label={`اقرأ المقال: ${activeItem.titleAr}`}
          >
            <span key={activeItem.id} className="block animate-[ticker-item-in_420ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none">
              {activeItem.titleAr}
            </span>
          </Link>
        <div className="flex shrink-0 items-center gap-1 border-s border-[#C3A36B]/45 ps-2">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-sm text-[#8A6428] transition-colors hover:bg-[#E9DFC9] focus-visible:bg-[#E9DFC9]"
            aria-pressed={manuallyPaused}
            aria-label={manuallyPaused ? "استئناف حركة أحدث المقالات" : "إيقاف حركة أحدث المقالات"}
            onClick={() => setManuallyPaused((value) => !value)}
          >
            {manuallyPaused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
          </button>
          <div className="flex sm:hidden" aria-label="التنقل بين أحدث المقالات">
            <button type="button" className="grid size-8 place-items-center rounded-sm text-[#8A6428] hover:bg-[#E9DFC9] focus-visible:bg-[#E9DFC9]" aria-label="المقال السابق" onClick={() => changeArticle(-1)}>
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
            <button type="button" className="grid size-8 place-items-center rounded-sm text-[#8A6428] hover:bg-[#E9DFC9] focus-visible:bg-[#E9DFC9]" aria-label="المقال التالي" onClick={() => changeArticle(1)}>
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
