"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Container } from "./container";

const navigation = [
  { href: "#intro", label: "عن طريق" },
  { href: "#foundation", label: "منهجنا" },
  { href: "#contact", label: "تواصل معنا" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <Container className="flex min-h-20 items-center justify-between gap-4">
        <Link href="#top" className="group inline-flex items-center gap-3 rounded-sm" onClick={closeMenu}>
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground" aria-hidden="true">
            ط
          </span>
          <span className="text-right leading-tight">
            <span className="block text-base font-bold text-primary">طريق الأكاديمية</span>
            <span className="block text-[10px] font-medium tracking-wide text-muted-foreground">TAREEQ ACADEMY</span>
          </span>
          <span className="sr-only">العودة إلى بداية الصفحة</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="التنقل الرئيسي">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-sm text-sm font-semibold text-foreground/80 transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <Button asChild className="hidden md:inline-flex">
          <a href="https://wa.me/963992277142" target="_blank" rel="noreferrer">تواصل عبر واتساب</a>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="text-xl leading-none" aria-hidden="true">{isOpen ? "×" : "☰"}</span>
        </Button>
      </Container>

      <div id="mobile-navigation" className={cn("border-t bg-background md:hidden", isOpen ? "block" : "hidden")}>
        <Container className="flex flex-col gap-1 py-4">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMenu} className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-secondary">
              {item.label}
            </Link>
          ))}
          <Button asChild className="mt-3 w-full">
            <a href="https://wa.me/963992277142" target="_blank" rel="noreferrer" onClick={closeMenu}>تواصل عبر واتساب</a>
          </Button>
        </Container>
      </div>
    </header>
  );
}
