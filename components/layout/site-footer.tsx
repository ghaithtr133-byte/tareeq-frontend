"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Container } from "./container";
import { createWhatsappUrl } from "@/lib/whatsapp";

type FooterSectionId = "quick-links" | "services" | "destinations";
type FooterLink = { href: string; label: string; external?: boolean };

const footerSections: Array<{ id: FooterSectionId; label: string; links: FooterLink[] }> = [
  {
    id: "quick-links",
    label: "روابط سريعة",
    links: [
      { href: "/", label: "الرئيسية" },
      { href: "/about", label: "من نحن" },
      { href: "/articles", label: "المقالات" },
    ],
  },
  {
    id: "services",
    label: "خدماتنا",
    links: [
      { href: "/services", label: "الخدمات التعليمية" },
      { href: createWhatsappUrl(), label: "تواصل عبر واتساب", external: true },
      { href: "/about", label: "عن طريق الأكاديمية" },
      { href: "/faq", label: "الأسئلة الشائعة" },
    ],
  },
  {
    id: "destinations",
    label: "الوجهات الدراسية",
    links: [
      { href: "/study-abroad", label: "الوجهات الدراسية" },
      { href: "/universities", label: "الجامعات" },
      { href: "/scholarships", label: "المنح الدراسية" },
    ],
  },
];

export function SiteFooter() {
  const [openMobileSection, setOpenMobileSection] = useState<FooterSectionId | null>(null);

  return (
    <footer id="contact" className="relative overflow-hidden bg-[#041F3C] text-primary-foreground">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#C8A253] to-transparent" aria-hidden="true" />
      <Container className="grid items-start gap-8 py-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-8 sm:py-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-8 xl:grid-cols-[1.8fr_repeat(3,minmax(0,0.7fr))] xl:gap-y-0 xl:py-14">
        <div className="max-w-sm sm:max-w-none lg:col-span-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-5 xl:col-span-1">
          <div>
            <Link href="/" className="inline-flex rounded-sm bg-[#FAF9F6] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <Image src="/images/brand/tareeq-academy-logo.png" alt="أكاديمية طريق" width={177} height={118} className="h-16 w-auto object-contain" />
            </Link>
            <p className="mt-4 max-w-[21rem] text-sm leading-7 text-primary-foreground/80">استشارات تعليمية ومساعدة في القبول الجامعي وتوجيه للدراسة في الخارج.</p>
          </div>
          <ContactDetails className="mt-6 hidden sm:block lg:mt-0" />
        </div>

        <div className="sm:hidden">
          {footerSections.map((section) => {
            const isOpen = openMobileSection === section.id;
            const panelId = `footer-${section.id}`;

            return (
              <section key={section.id} className="border-t border-primary-foreground/15 last:border-b">
                <button
                  type="button"
                  className="flex min-h-14 w-full items-center justify-between gap-4 rounded-sm text-right text-sm font-extrabold tracking-[0.1em] text-[#F5D98E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#E1C273]"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenMobileSection(isOpen ? null : section.id)}
                >
                  {section.label}
                  <ChevronDown className={`size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {isOpen ? (
                  <div id={panelId} role="region" aria-label={section.label} className="pb-5 motion-safe:animate-[footer-accordion-in_180ms_ease-out] motion-reduce:animate-none">
                    <FooterLinks links={section.links} />
                  </div>
                ) : null}
              </section>
            );
          })}
          <ContactDetails className="mt-6 border-t border-primary-foreground/15 pt-6" />
        </div>

        {footerSections.map((section) => (
          <nav key={section.id} aria-label={section.label} className="hidden sm:block lg:col-span-1">
            <p className="text-xs font-extrabold tracking-[0.14em] text-[#F5D98E]">{section.label}</p>
            <div className="mt-4"><FooterLinks links={section.links} /></div>
          </nav>
        ))}
      </Container>
      <Container className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 border-t border-primary-foreground/15 py-4 pl-16 text-[0.6875rem] text-primary-foreground/65 sm:justify-between sm:gap-4 sm:py-5 sm:pl-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" className="rounded-sm font-bold transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">الرئيسية</Link>
          <Link href="/privacy" className="rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">الخصوصية</Link>
          <Link href="/terms" className="rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">الشروط والأحكام</Link>
        </div>
        <p>© {new Date().getFullYear()} أكاديمية طريق</p>
      </Container>
    </footer>
  );
}

function FooterLinks({ links }: { links: FooterLink[] }) {
  return (
    <div className="grid gap-3 text-sm text-primary-foreground/80">
      {links.map((link) => link.external ? (
        <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="rounded-sm transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">{link.label}</a>
      ) : (
        <Link key={link.href} href={link.href} className="rounded-sm transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">{link.label}</Link>
      ))}
    </div>
  );
}

function ContactDetails({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-extrabold tracking-[0.14em] text-[#F5D98E]">للتواصل</p>
      <a className="mt-4 inline-block border-b border-accent pb-1 text-base font-bold tracking-wide transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]" href={createWhatsappUrl()} target="_blank" rel="noreferrer" dir="ltr">+963 992 277 142</a>
      <Link href="/contact" className="mt-4 block w-fit rounded-sm text-sm text-primary-foreground/80 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">صفحة التواصل</Link>
    </div>
  );
}
