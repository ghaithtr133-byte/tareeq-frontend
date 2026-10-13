import Link from "next/link";

import { Container } from "./container";

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t bg-primary text-primary-foreground">
      <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-bold">طريق الأكاديمية</p>
          <p className="mt-2 max-w-md text-sm leading-7 text-primary-foreground/75">
            أساس موثوق لرحلتك التعليمية نحو الدراسة في الخارج.
          </p>
        </div>
        <div className="text-right sm:text-left">
          <p className="text-xs font-semibold tracking-wide text-primary-foreground/65">تواصل معنا</p>
          <a className="mt-2 inline-block rounded-sm text-base font-bold underline decoration-accent decoration-2 underline-offset-4" href="https://wa.me/963992277142" target="_blank" rel="noreferrer">
            +963 992 277 142
          </a>
          <p className="mt-4 text-xs text-primary-foreground/60">© {new Date().getFullYear()} طريق الأكاديمية</p>
        </div>
      </Container>
      <Container className="border-t border-primary-foreground/15 py-4 text-xs text-primary-foreground/60">
        <Link href="#top" className="rounded-sm hover:text-primary-foreground">العودة للأعلى</Link>
      </Container>
    </footer>
  );
}
