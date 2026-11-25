import Image from "next/image";
import Link from "next/link";

import { Container } from "./container";
import { createWhatsappUrl } from "@/lib/whatsapp";

type FooterLink = { href: string; label: string; external?: boolean };

const footerSections: Array<{ label: string; links: FooterLink[] }> = [
  {
    label: "استكشف",
    links: [
      { href: "/study-abroad", label: "الوجهات الدراسية" },
      { href: "/universities", label: "الجامعات" },
      { href: "/scholarships", label: "المنح الدراسية" },
      { href: "/articles", label: "المقالات" },
    ],
  },
  {
    label: "طريق الأكاديمية",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/services", label: "خدماتنا" },
      { href: "/contact", label: "تواصل معنا" },
    ],
  },
];

export function SiteFooter({
  showServices = true,
}: {
  showServices?: boolean;
}) {
  const visibleSections = showServices
    ? footerSections
    : footerSections.map((section) => ({
        ...section,
        links: section.links.filter((link) => link.href !== "/services"),
      }));

  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-[#041F3C] text-primary-foreground"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#C8A253] to-transparent"
        aria-hidden="true"
      />
      <Container className="grid max-w-[74rem] grid-cols-2 items-start gap-x-5 gap-y-4 py-5 sm:grid-cols-[minmax(0,1.45fr)_minmax(7.5rem,0.75fr)_minmax(7.5rem,0.75fr)] sm:gap-x-6 lg:grid-cols-[minmax(19rem,28rem)_minmax(8rem,10rem)_minmax(8rem,10rem)] lg:justify-center lg:gap-x-10">
        <div className="col-span-2 min-w-0 max-w-sm sm:col-span-1 sm:max-w-none">
          <div>
            <Link
              href="/"
              draggable={false}
              className="inline-flex rounded-sm bg-[#FAF9F6] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Image
                src="/images/brand/tareeq-academy-logo.png"
                draggable={false}
                alt="أكاديمية طريق"
                width={177}
                height={118}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-3 max-w-[21rem] text-sm leading-7 text-primary-foreground/80">
              استشارات تعليمية ومساعدة في القبول الجامعي وتوجيه للدراسة في
              الخارج.
            </p>
          </div>
          <ContactDetails className="mt-2" />
        </div>

        {visibleSections.map((section) => (
          <nav
            key={section.label}
            aria-label={section.label}
            className="min-w-0 text-center"
          >
            <p className="text-sm font-bold text-[#F5D98E]">{section.label}</p>
            <div className="mt-2">
              <FooterLinks links={section.links} />
            </div>
          </nav>
        ))}
      </Container>
      <Container className="flex min-w-0 items-center justify-between gap-2 border-t border-primary-foreground/15 pe-14 text-[0.625rem] text-primary-foreground/65 sm:gap-3 sm:pe-24 sm:text-[0.6875rem]">
        <div className="flex shrink-0 items-center gap-x-2 sm:gap-x-4">
          <Link
            href="/privacy"
            draggable={false}
            className="inline-flex min-h-9 items-center rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]"
          >
            الخصوصية
          </Link>
          <Link
            href="/terms"
            draggable={false}
            className="inline-flex min-h-9 items-center rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]"
          >
            الشروط والأحكام
          </Link>
        </div>
        <p className="min-w-0 whitespace-nowrap">
          © {new Date().getFullYear()} أكاديمية طريق
        </p>
      </Container>
    </footer>
  );
}

function FooterLinks({ links }: { links: FooterLink[] }) {
  return (
    <div className="grid text-sm text-primary-foreground/80">
      {links.map((link) =>
        link.external ? (
          <a
            key={link.href}
            href={link.href}
            draggable={false}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center justify-center rounded-sm transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]"
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            draggable={false}
            className="inline-flex min-h-9 items-center justify-center rounded-sm transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]"
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}

function ContactDetails({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <a
        aria-label="تواصل عبر واتساب: +963 992 277 142"
        draggable={false}
        className="inline-flex min-h-11 items-center border-b border-accent text-base font-bold tracking-wide transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1C273]"
        href={createWhatsappUrl()}
        target="_blank"
        rel="noreferrer"
        dir="ltr"
      >
        +963 992 277 142
      </a>
    </div>
  );
}
