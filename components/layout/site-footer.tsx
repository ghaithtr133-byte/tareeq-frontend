import Link from "next/link";

import { Container } from "./container";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <Container className="grid gap-6 py-9 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-10 sm:py-14">
        <div className="max-w-lg">
          <p className="text-xl font-bold tracking-tight">طريق الأكاديمية</p>
          <p className="mt-3 text-sm leading-7 text-primary-foreground/80">استشارات تعليمية ومساعدة في القبول الجامعي وتوجيه للدراسة في الخارج.</p>
          <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-primary-foreground/80" aria-label="روابط عامة">
            <Link href="/study-abroad" className="rounded-sm transition-colors hover:text-accent">الدراسة في الخارج</Link>
            <Link href="/universities" className="rounded-sm transition-colors hover:text-accent">الجامعات</Link>
            <Link href="/scholarships" className="rounded-sm transition-colors hover:text-accent">المنح</Link>
            <Link href="/services" className="rounded-sm transition-colors hover:text-accent">الخدمات</Link>
            <Link href="/articles" className="rounded-sm transition-colors hover:text-accent">المقالات</Link>
            <Link href="/apply" className="rounded-sm transition-colors hover:text-accent">طلب مساعدة</Link>
            <Link href="/about" className="rounded-sm transition-colors hover:text-accent">عن طريق</Link>
            <Link href="/faq" className="rounded-sm transition-colors hover:text-accent">الأسئلة الشائعة</Link>
          </nav>
        </div>
        <div className="border-t border-primary-foreground/15 pt-6 sm:border-0 sm:pt-0 sm:text-left">
          <p className="text-[0.6875rem] font-bold tracking-[0.16em] text-primary-foreground/75">للتواصل</p>
          <a className="mt-3 inline-block border-b border-accent pb-1 text-base font-bold tracking-wide transition-colors hover:text-accent" href="https://wa.me/963992277142" target="_blank" rel="noreferrer" dir="ltr">
            +963 992 277 142
          </a>
        </div>
      </Container>
      <Container className="flex flex-wrap items-center justify-between gap-4 border-t border-primary-foreground/15 py-4 text-[0.6875rem] text-primary-foreground/65 sm:py-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" className="rounded-sm font-bold transition-colors hover:text-primary-foreground">الرئيسية</Link>
          <Link href="/privacy" className="rounded-sm transition-colors hover:text-primary-foreground">الخصوصية</Link>
          <Link href="/terms" className="rounded-sm transition-colors hover:text-primary-foreground">الشروط والأحكام</Link>
        </div>
        <p dir="ltr">© {new Date().getFullYear()} TAREEQ ACADEMY</p>
      </Container>
    </footer>
  );
}
