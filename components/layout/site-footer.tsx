import Link from "next/link";

import { Container } from "./container";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <Container className="grid gap-6 py-9 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-10 sm:py-14">
        <div className="max-w-lg">
          <p className="text-xl font-bold tracking-tight">طريق الأكاديمية</p>
          <p className="mt-3 text-sm leading-7 text-primary-foreground/80">استشارات تعليمية ومساعدة في القبول الجامعي وتوجيه للدراسة في الخارج.</p>
        </div>
        <div className="border-t border-primary-foreground/15 pt-6 sm:border-0 sm:pt-0 sm:text-left">
          <p className="text-[0.6875rem] font-bold tracking-[0.16em] text-primary-foreground/75">للتواصل</p>
          <a className="mt-3 inline-block border-b border-accent pb-1 text-base font-bold tracking-wide transition-colors hover:text-accent" href="https://wa.me/963992277142" target="_blank" rel="noreferrer" dir="ltr">
            +963 992 277 142
          </a>
        </div>
      </Container>
      <Container className="flex items-center justify-between gap-4 border-t border-primary-foreground/15 py-4 text-[0.6875rem] text-primary-foreground/65 sm:py-5">
        <Link href="#top" className="rounded-sm font-bold transition-colors hover:text-primary-foreground">العودة للأعلى</Link>
        <p dir="ltr">© {new Date().getFullYear()} TAREEQ ACADEMY</p>
      </Container>
    </footer>
  );
}
