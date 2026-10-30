/* eslint-disable @next/next/no-img-element -- public API article media can be remote. */
"use client";

import Link from "next/link";
import { FileText, Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import {
  createArticleTickerRail,
  mergeArticleTickerItems,
  type ArticleTickerItem,
  type ArticleTickerPage,
} from "@/lib/article-ticker";

type Props = { initialPage: ArticleTickerPage };

const nextPageDelay = 600;

export function ArticlesTicker({ initialPage }: Props) {
  const [items, setItems] = useState<ArticleTickerItem[]>(initialPage.items);
  const [isRailReady, setIsRailReady] = useState(initialPage.totalPages <= initialPage.page);
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
      } finally {
        if (!stopped) setIsRailReady(true);
      }
    }

    void loadFollowingPages();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [initialPage.page, initialPage.totalPages]);

  if (!items.length) return null;

  const tickerRail = createArticleTickerRail(items);

  return (
    <section
      className="overflow-hidden border-b border-[#C8A253]/35 bg-[#082B50] text-white"
      aria-label="أحدث المقالات المنشورة"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
      }}
    >
      <Container className="flex h-9 items-stretch">
        <span className="flex shrink-0 items-center gap-2 pe-3 text-[0.625rem] font-extrabold tracking-[0.12em] text-[#F5D98E] sm:pe-5 sm:text-[0.6875rem]">
          <Menu className="size-3 shrink-0" aria-hidden="true" />
          <span>أحدث المقالات</span>
        </span>
        <div className="flex min-w-0 flex-1 items-center ps-1 sm:ps-3">
          <div className="min-w-0 flex-1 overflow-hidden" dir="ltr">
            <div className={`flex w-max items-center whitespace-nowrap motion-reduce:animate-none ${isRailReady ? "animate-[ticker-marquee_75s_linear_infinite]" : ""} ${interactionPaused || reducedMotion ? "[animation-play-state:paused]" : ""}`}>
              {tickerRail.map((item) => (
                <span key={`${item.id}-${item.copy}`} className="flex items-center">
                  {item.copy === 0 ? (
                    <Link href={`/articles/${item.slug}`} className="flex items-center gap-2 px-5 text-xs font-bold leading-5 text-white/90 transition-colors hover:text-[#F5D98E] focus-visible:text-[#F5D98E]" dir="rtl">
                      {item.coverImageUrl ? <img src={item.coverImageUrl} alt="" className="size-5 rounded object-cover" loading="lazy" /> : <span className="grid size-5 place-items-center rounded bg-white/10 text-[#F5D98E]"><FileText className="size-3" aria-hidden="true" /></span>}
                      {item.titleAr}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 px-5 text-xs font-bold leading-5 text-white/90" dir="rtl" aria-hidden="true">
                      {item.coverImageUrl ? <img src={item.coverImageUrl} alt="" className="size-5 rounded object-cover" loading="lazy" /> : <span className="grid size-5 place-items-center rounded bg-white/10 text-[#F5D98E]"><FileText className="size-3" aria-hidden="true" /></span>}
                      {item.titleAr}
                    </span>
                  )}
                  <span className="size-1 rounded-full bg-[#C8A253]" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
