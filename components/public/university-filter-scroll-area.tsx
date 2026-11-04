"use client";

import { useLayoutEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronsDown } from "lucide-react";
import styles from "./university-filter-scroll-area.module.css";

const SCROLL_TOLERANCE = 2;
const VIEWPORT_BOTTOM_GAP = 16;

export function UniversityFilterScrollArea({
  children,
  className = "",
  contentClassName = "",
  hideScrollbar = false,
  fitViewport = false,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  hideScrollbar?: boolean;
  fitViewport?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const scrollId = useId();
  const [hint, setHint] = useState({ overflow: false, moreBelow: false });

  useLayoutEffect(() => {
    const outer = frame.current;
    const scroll = scroller.current;
    const inner = content.current;
    if (!outer || !scroll || !inner) return;
    let animationFrame = 0;
    function measure() {
      animationFrame = 0;
      if (!outer || !scroll || !inner) return;
      if (fitViewport) {
        // Before the sticky threshold, the frame starts BELOW its sticky inset.
        // Constrain it to the space actually on screen, including its hint footer.
        const available = Math.max(0, Math.floor(window.innerHeight - Math.max(0, outer.getBoundingClientRect().top) - VIEWPORT_BOTTOM_GAP));
        const value = `${available}px`;
        if (outer.style.getPropertyValue("--university-filter-available-height") !== value) outer.style.setProperty("--university-filter-available-height", value);
      }
      // Compare against the whole frame, including the reserved hint strip,
      // so that strip cannot keep itself visible after everything fits.
      const overflow = outer.clientHeight > 0 && inner.scrollHeight - outer.clientHeight > SCROLL_TOLERANCE;
      const moreBelow = overflow && scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop > SCROLL_TOLERANCE;
      setHint((previous) => previous.overflow === overflow && previous.moreBelow === moreBelow ? previous : { overflow, moreBelow });
    }
    function scheduleMeasure() {
      if (!animationFrame) animationFrame = requestAnimationFrame(measure);
    }
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(outer);
    observer.observe(scroll);
    observer.observe(inner);
    scroll.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    if (fitViewport) {
      window.addEventListener("scroll", scheduleMeasure, { passive: true });
      document.fonts?.addEventListener("loadingdone", scheduleMeasure);
    }
    // Measure in the layout phase; do not wait for a user scroll or a timeout.
    measure();
    return () => {
      observer.disconnect();
      scroll.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (fitViewport) {
        window.removeEventListener("scroll", scheduleMeasure);
        document.fonts?.removeEventListener("loadingdone", scheduleMeasure);
      }
      cancelAnimationFrame(animationFrame);
    };
  }, [fitViewport]);

  function revealMore() {
    const scroll = scroller.current;
    if (!scroll || !hint.moreBelow) return;
    scroll.scrollBy({
      top: Math.max(120, Math.floor(scroll.clientHeight * 0.65)),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return (
    <div ref={frame} className={`flex min-h-0 flex-col ${fitViewport ? styles.viewportFrame : ""} ${className}`}>
      <div
        ref={scroller}
        id={scrollId}
        data-university-filter-scroll=""
        className={`min-h-0 overflow-y-auto overscroll-contain ${hideScrollbar ? "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : ""}`}
      >
        <div ref={content} className={contentClassName}>{children}</div>
      </div>
      {hint.overflow ? (
        <div className="relative h-12 shrink-0">
        {hint.moreBelow ? <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-white to-transparent" /> : null}
        <button
          type="button"
          data-university-filter-hint=""
          aria-hidden={!hint.moreBelow}
          aria-controls={scrollId}
          disabled={!hint.moreBelow}
          onClick={revealMore}
          className={`flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-b-lg border-t border-[#E2E8EF] bg-[#FAFBFC] px-3 text-sm font-bold leading-6 text-[#082B50] transition-colors duration-200 hover:bg-[#FBF5E9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#A47B2D] motion-reduce:transition-none ${hint.moreBelow ? "visible" : "invisible"}`}
        >
          {hint.moreBelow ? <ChevronsDown className={`size-5 shrink-0 text-[#A47B2D] ${styles.indicatorIcon}`} aria-hidden="true" /> : null}
          عرض المزيد من الفلاتر
        </button>
        </div>
      ) : null}
    </div>
  );
}
