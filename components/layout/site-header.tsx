"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

import { Container } from "./container";

const navigation = [
  { href: "/study-abroad", label: "الدراسة في الخارج" },
  { href: "/universities", label: "الجامعات" },
  { href: "/scholarships", label: "المنح" },
  { href: "/services", label: "الخدمات" },
  { href: "/articles", label: "المقالات" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    // This matches Tailwind's `lg` breakpoint, where the desktop navigation becomes visible.
    const desktopNavigation = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktopNavigation = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    desktopNavigation.addEventListener("change", closeOnDesktopNavigation);
    return () => desktopNavigation.removeEventListener("change", closeOnDesktopNavigation);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <Container className="flex min-h-[5.5rem] items-center justify-between gap-4">
        <Link href="/" className="group inline-flex rounded-sm py-2" onClick={closeMenu}>
          <span className="text-right leading-none">
            <span className="block text-lg font-bold tracking-tight text-primary">طريق الأكاديمية</span>
            <span className="mt-1 block text-[9px] font-bold tracking-[0.2em] text-accent" dir="ltr">TAREEQ ACADEMY</span>
          </span>
          <span className="sr-only">شعار نصي مؤقت لطريق الأكاديمية والعودة إلى بداية الصفحة</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex xl:gap-2" aria-label="التنقل الرئيسي">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined} className="rounded-sm px-2 py-2 text-[0.75rem] font-bold text-foreground/75 transition-colors duration-150 hover:bg-secondary/80 hover:text-primary focus-visible:bg-secondary active:bg-muted xl:px-3 xl:text-[0.8125rem]">
              {item.label}
            </Link>
          ))}
        </nav>

        <Button asChild size="sm" variant="outline" className="hidden border-accent/70 px-5 text-primary hover:border-accent hover:bg-accent/10 lg:inline-flex">
          <a href="https://wa.me/963992277142" target="_blank" rel="noreferrer">تواصل عبر واتساب</a>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="border border-border/80 bg-card active:scale-[0.97] lg:hidden"
          aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </Button>
      </Container>

      <div id="mobile-navigation" aria-hidden={!isOpen} className={cn("absolute end-5 top-full z-50 mt-3 w-[min(20rem,calc(100vw-2.5rem))] rounded-md border border-border/80 bg-card p-1.5 shadow-[0_18px_36px_-18px_color-mix(in_srgb,var(--primary)_45%,transparent)] transition-[opacity,transform,visibility] duration-150 sm:end-8 lg:hidden", isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-1 opacity-0")}>
          <nav aria-label="التنقل على الجوال">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMenu} className="group flex min-h-12 items-center gap-3 rounded-sm px-4 py-3 text-sm font-bold text-foreground/85 transition-colors duration-150 hover:bg-secondary hover:text-primary focus-visible:bg-secondary active:bg-muted">
              <span>{item.label}</span>
              <ArrowLeftIcon className="size-4 shrink-0 text-accent transition-transform duration-150 group-hover:-translate-x-0.5" />
            </Link>
          ))}
          </nav>
      </div>
    </header>
  );
}
