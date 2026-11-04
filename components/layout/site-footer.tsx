"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Container } from "./container";
import { createWhatsappUrl } from "@/lib/whatsapp";

type FooterSectionId = "explore" | "academy";
type FooterLink = { href: string; label: string; external?: boolean };

const footerSections: Array<{ id: FooterSectionId; label: string; links: FooterLink[] }> = [
  {
    id: "explore",
    label: "استكشف",
    links: [
      { href: "/study-abroad", label: "الوجهات الدراسية" },
      { href: "/universities", label: "الجامعات" },
      { href: "/scholarships", label: "المنح الدراسية" },
      { href: "/articles", label: "المقالات" },
    ],
  },
  {
    id: "academy",
    label: "طريق الأكاديمية",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/services", label: "خدماتنا" },
      { href: "/contact", label: "تواصل معنا" },
    ],
  },
];

export function SiteFooter() {
  const [openMobileSection, setOpenMobileSection] = useState<FooterSectionId | null>(null);

  return (
    <footer id="contact" className="relative overflow-hidden bg-[#041F3C] text-primary-foreground">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#C8A253] to-transparent" aria-hidden="true" />
      <Container className="grid items-start gap-5 py-5 md:grid-cols-[minmax(16rem,1.5fr)_repeat(2,minmax(0,1fr))] md:gap-6 lg:gap-8">
        <div className="min-w-0 max-w-sm md:max-w-none">
          <div>
            <Link href="/" draggable={false} className="inline-flex rounded-sm bg-[#FAF9F6] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <Image src="/images/brand/tareeq-academy-logo.png" draggable={false} alt="أكاديمية طريق" width={177} height={118} className="h-12 w-auto object-contain" />
            </Link>
            <p className="mt-3 max-w-[21rem] text-sm leading-7 text-primary-foreground/80">استشارات تعليمية ومساعدة في القبول الجامعي وتوجيه للدراسة في الخارج.</p>
          </div>
          <ContactDetails className="mt-2" />
        </div>

        <div className="md:hidden">
          {footerSections.map((section) => {
            const isOpen = openMobileSection === section.id;
            const panelId = `footer-${section.id}`;

            return (
              <section key={section.id} className="border-t border-primary-foreground/15 last:border-b">
                <button
                  type="button"
                  className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-sm text-right text-sm font-bold text-[#F5D98E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#E1C273]"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenMobileSection(isOpen ? null : section.id)}
                >
                  {section.label}
                  <ChevronDown className={`size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {isOpen ? (
                  <div id={panelId} role="region" aria-label={section.label} className="pb-3 motion-safe:animate-[footer-accordion-in_180ms_ease-out] motion-reduce:animate-none">
                    <FooterLinks links={section.links} />
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        {footerSections.map((section) => (
          <nav key={section.id} aria-label={section.label} className="hidden md:block">
            <p className="text-sm font-bold text-[#F5D98E]">{section.label}</p>
            <div className="mt-2"><FooterLinks links={section.links} /></div>
          </nav>
        ))}
      </Container>
      <Container className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 border-t border-primary-foreground/15 py-3 pe-24 text-[0.6875rem] text-primary-foreground/65 md:justify-between md:gap-4 md:pe-24">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/privacy" draggable={false} className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">الخصوصية</Link>
          <Link href="/terms" draggable={false} className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">الشروط والأحكام</Link>
        </div>
        <p>© {new Date().getFullYear()} أكاديمية طريق</p>
      </Container>
    </footer>
  );
}

function FooterLinks({ links }: { links: FooterLink[] }) {
  return (
    <div className="grid text-sm text-primary-foreground/80 xl:grid-cols-2 xl:gap-x-4">
      {links.map((link) => link.external ? (
        <a key={link.href} href={link.href} draggable={false} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">{link.label}</a>
      ) : (
        <Link key={link.href} href={link.href} draggable={false} className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]">{link.label}</Link>
      ))}
    </div>
  );
}

function ContactDetails({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <a aria-label="تواصل عبر واتساب: +963 992 277 142" draggable={false} className="inline-flex min-h-11 items-center border-b border-accent text-base font-bold tracking-wide transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]" href={createWhatsappUrl()} target="_blank" rel="noreferrer" dir="ltr">+963 992 277 142</a>
    </div>
  );
}
