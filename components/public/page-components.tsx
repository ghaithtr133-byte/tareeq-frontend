import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/icons";

export function PageIntro({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <section
      className="border-b border-border/80 bg-background py-14 sm:py-20 lg:py-24"
      aria-labelledby="page-title"
    >
      <Container className="max-w-4xl">
        <p className="flex items-center gap-3 text-[0.6875rem] font-bold tracking-[0.17em] text-accent">
          <span className="h-px w-10 bg-accent" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1
          id="page-title"
          className="mt-5 max-w-3xl text-4xl font-bold leading-[1.32] tracking-[-0.035em] text-primary sm:text-5xl lg:text-6xl"
        >
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
          {intro}
        </p>
      </Container>
    </section>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: ReadonlyArray<{ href?: string; label: string }>;
}) {
  return (
    <nav
      aria-label="مسار التنقل"
      className="border-b border-border/80 bg-background py-4"
    >
      <Container className="max-w-4xl">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {items.map((item, index) => (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-x-2"
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-primary focus-visible:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-bold text-primary">
                  {item.label}
                </span>
              )}
              {index < items.length - 1 ? (
                <span aria-hidden="true" className="text-accent">
                  /
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </nav>
  );
}

export function ContentSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-muted/60 py-12 sm:py-16 lg:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  intro,
  eyebrowClassName = "text-[0.6875rem] font-bold tracking-[0.17em] text-accent",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  eyebrowClassName?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className={eyebrowClassName}>{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold leading-[1.4] tracking-tight text-primary sm:text-4xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          {intro}
        </p>
      ) : null}
    </div>
  );
}

export function ContentUnavailable({
  title = "لا يتوفر محتوى منشور حاليًا",
  description = "سيظهر هذا القسم عند توفر المحتوى المعتمد من فريق طريق الأكاديمية.",
  contact = false,
}: {
  title?: string;
  description?: string;
  contact?: boolean;
}) {
  return (
    <div className="border border-primary/15 bg-card p-6 shadow-[0_18px_46px_-36px_color-mix(in_srgb,var(--primary)_45%,transparent)] sm:p-8">
      <p className="text-[0.6875rem] font-bold tracking-[0.17em] text-accent">
        قيد الإتاحة
      </p>
      <h2 className="mt-4 text-2xl font-bold leading-[1.45] text-primary">
        {title}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {contact ? (
        <Button asChild variant="outline" className="mt-6">
          <Link href="/contact">
            <span>تواصل معنا</span>
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export function EditorialLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex mt-5 items-center gap-2 rounded-sm text-sm font-bold text-primary transition-colors hover:text-accent focus-visible:text-accent"
    >
      <span>{children}</span>
      <ArrowLeftIcon className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
    </Link>
  );
}
