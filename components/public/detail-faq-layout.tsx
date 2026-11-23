import Image from "next/image";
import type { ReactNode } from "react";

/** Shared detail-page FAQ geometry: content at the RTL start, decorative teacher artwork at the desktop end. */
export function DetailFaqLayout({ children }: { children: ReactNode }) {
  return <div dir="rtl" className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-center lg:gap-8">
    <div className="min-w-0 lg:col-start-1">{children}</div>
    <div className="pointer-events-none mx-auto hidden w-full max-w-48 lg:col-start-2 lg:block" aria-hidden="true">
      <Image src="/images/faq/faq-teacher.png" alt="" width={224} height={224} sizes="(min-width: 1024px) 12rem, 0px" className="h-auto w-full object-contain" />
    </div>
  </div>;
}
