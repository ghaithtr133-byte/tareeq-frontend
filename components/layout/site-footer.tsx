import Image from "next/image";
import Link from "next/link";

import { Container } from "./container";
import { createWhatsappUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr] lg:gap-8 lg:py-16">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex rounded-sm bg-[#FAF9F6] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <Image
              src="/images/brand/tareeq-academy-logo.png"
              alt="أكاديمية طريق"
              width={177}
              height={118}
              className="h-16 w-auto object-contain"
            />
          </Link>
          <p className="mt-4 text-sm leading-7 text-primary-foreground/80">استشارات تعليمية ومساعدة في القبول الجامعي وتوجيه للدراسة في الخارج.</p>
        </div>
        <nav aria-label="روابط سريعة">
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#F5D98E]">روابط سريعة</p>
          <div className="mt-4 grid gap-3 text-sm text-primary-foreground/80">
            <Link href="/" className="hover:text-accent">الرئيسية</Link>
            <Link href="/study-abroad" className="hover:text-accent">الدراسة في الخارج</Link>
            <Link href="/universities" className="hover:text-accent">الجامعات</Link>
            <Link href="/scholarships" className="hover:text-accent">المنح الدراسية</Link>
            <Link href="/articles" className="hover:text-accent">المقالات</Link>
          </div>
        </nav>
        <nav aria-label="خدمات طريق">
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#F5D98E]">خدماتنا</p>
          <div className="mt-4 grid gap-3 text-sm text-primary-foreground/80">
            <Link href="/services" className="hover:text-accent">الخدمات التعليمية</Link>
            <a href={createWhatsappUrl()} target="_blank" rel="noreferrer" className="hover:text-accent">تواصل عبر واتساب</a>
            <Link href="/about" className="hover:text-accent">عن طريق الأكاديمية</Link>
            <Link href="/faq" className="hover:text-accent">الأسئلة الشائعة</Link>
          </div>
        </nav>
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#F5D98E]">للتواصل</p>
          <a className="mt-4 inline-block border-b border-accent pb-1 text-base font-bold tracking-wide transition-colors hover:text-accent" href={createWhatsappUrl()} target="_blank" rel="noreferrer" dir="ltr">+963 992 277 142</a>
          <Link href="/contact" className="mt-4 block text-sm text-primary-foreground/80 hover:text-accent">صفحة التواصل</Link>
        </div>
      </Container>
      <Container className="flex flex-wrap items-center justify-between gap-4 border-t border-primary-foreground/15 py-4 text-[0.6875rem] text-primary-foreground/65 sm:py-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" className="rounded-sm font-bold transition-colors hover:text-primary-foreground">الرئيسية</Link>
          <Link href="/privacy" className="rounded-sm transition-colors hover:text-primary-foreground">الخصوصية</Link>
          <Link href="/terms" className="rounded-sm transition-colors hover:text-primary-foreground">الشروط والأحكام</Link>
        </div>
        <p>© {new Date().getFullYear()} أكاديمية طريق</p>
      </Container>
    </footer>
  );
}
