"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createWhatsappUrl } from "@/lib/whatsapp";

import { Container } from "./container";

const navigation = [
  { href: "/", label: "الرئيسية" },
  { href: "/study-abroad", label: "الوجهات الدراسية" },
  { href: "/universities", label: "الجامعات" },
  { href: "/scholarships", label: "المنح" },
  { href: "/services", label: "الخدمات" },
  { href: "/articles", label: "المقالات" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstNavigationLinkRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  function closeMenu(restoreFocus = false) {
    setIsOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function toggleMenu() {
    if (isOpen) {
      closeMenu();
      return;
    }

    setIsOpen(true);
    window.setTimeout(() => {
      (firstNavigationLinkRef.current ?? document.getElementById("mobile-navigation-first-link"))?.focus();
    }, 50);
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
      if (event.key === "Escape") closeMenu(true);
    }

    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) closeMenu(true);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-[#082B50]/10 bg-white/95 shadow-[0_8px_24px_-24px_rgba(8,43,80,0.5)] backdrop-blur-xl">
      <Container className="flex min-h-[4.25rem] items-center justify-between gap-4 2xl:min-h-[4.75rem]">
        <Link href="/" className="inline-flex shrink-0 rounded-sm py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" onClick={() => closeMenu()}>
          <Image
            src="/images/brand/tareeq-academy-logo.png"
            alt="أكاديمية طريق"
            width={177}
            height={118}
            priority
            className="h-10 w-auto object-contain sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined} className={cn("rounded-md px-3 py-2 text-[0.9375rem] font-bold transition-colors duration-150 focus-visible:bg-[#F1F5F9] xl:px-4 2xl:text-base", isActive ? "bg-[#F1F5F9] text-[#082B50]" : "text-[#52647A] hover:bg-[#F1F5F9] hover:text-[#082B50]")}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button asChild size="sm" className="hidden h-10 rounded-md bg-[#C8A253] px-5 text-[0.9375rem] text-[#082B50] shadow-[0_8px_16px_-12px_rgba(164,123,45,0.75)] hover:bg-[#D8B96E] lg:inline-flex">
          <a href={createWhatsappUrl()} target="_blank" rel="noreferrer">تواصل معنا</a>
        </Button>

        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 rounded-md border border-primary/15 bg-card text-primary shadow-sm transition-[background-color,border-color,transform] duration-200 hover:border-accent/70 hover:bg-secondary active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 motion-reduce:transition-none lg:hidden"
          aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          onClick={toggleMenu}
        >
          {isOpen ? <X className="size-5 stroke-[2]" aria-hidden="true" /> : <Menu className="size-5 stroke-[2]" aria-hidden="true" />}
        </Button>
      </Container>

      {isOpen ? <div aria-hidden="true" className="fixed inset-x-0 bottom-0 top-[4.25rem] z-40 bg-primary/25 backdrop-blur-[1px] lg:hidden" onPointerDown={() => closeMenu(true)} /> : null}
      <div id="mobile-navigation" aria-hidden={!isOpen} className={cn("absolute end-4 top-full z-[60] mt-3 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-primary-foreground/15 bg-primary p-2 shadow-[0_24px_48px_-22px_color-mix(in_srgb,var(--primary)_70%,transparent)] transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none sm:end-8 lg:hidden", isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-2 opacity-0")}>
        <p className="px-3 pb-2 pt-1 text-[0.625rem] font-bold tracking-[0.16em] text-accent">استكشف طريقك التعليمي</p>
        <nav aria-label="التنقل على الجوال">
          {navigation.map((item, index) => (
            <Link ref={index === 0 ? firstNavigationLinkRef : undefined} id={index === 0 ? "mobile-navigation-first-link" : undefined} key={item.href} href={item.href} onClick={() => closeMenu()} className={cn("group flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-3 text-base font-bold text-primary-foreground transition-colors duration-200 hover:bg-primary-foreground/10 focus-visible:bg-primary-foreground/15 active:bg-primary-foreground/15 motion-reduce:transition-none", pathname === item.href || pathname.startsWith(`${item.href}/`) ? "bg-primary-foreground/10" : "")}>
              <span>{item.label}</span>
              <ChevronLeft className="size-4 shrink-0 text-accent transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          ))}
          <a href={createWhatsappUrl()} target="_blank" rel="noreferrer" onClick={() => closeMenu()} className="mt-2 flex min-h-12 items-center justify-center rounded-lg bg-accent px-3 py-3 text-sm font-bold text-primary transition-colors hover:bg-[#E4C984] focus-visible:bg-[#E4C984]">
            ابدأ رحلتك
          </a>
          </nav>
      </div>
    </header>
  );
}
