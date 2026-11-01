"use client";

import { ArrowDown } from "lucide-react";

export function ServiceAboutLink() {
  return <a href="#about-service" onClick={(event) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById("about-service");
    if (!target) return;
    event.preventDefault();
    const header = document.querySelector("header.sticky")?.getBoundingClientRect().height ?? 72;
    const ticker = document.querySelector('[aria-label="أحدث المقالات المنشورة"]');
    const pinnedTicker = ticker && ["fixed", "sticky"].includes(getComputedStyle(ticker).position);
    const offset = header + (pinnedTicker ? ticker!.getBoundingClientRect().height : 0) + 16;
    window.history.pushState(null, "", "#about-service");
    target.focus({ preventScroll: true });
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - offset, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-bold text-primary hover:bg-[#F5F7FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none">تعرف على الخدمة<ArrowDown className="size-4 shrink-0" aria-hidden="true" /></a>;
}
