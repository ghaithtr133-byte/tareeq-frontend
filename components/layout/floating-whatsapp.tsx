import { MessageCircle } from "lucide-react";

import { createWhatsappUrl } from "@/lib/whatsapp";

/** Uses the same approved destination already published in the site header and footer. */
export function FloatingWhatsapp() {
  return (
    <a
      href={createWhatsappUrl()}
      target="_blank"
      rel="noreferrer"
      className="relative fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] end-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1E7A4F] px-4 text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(22,45,80,0.65)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#176640] hover:after:[animation-play-state:paused] focus:after:[animation-play-state:paused] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#D4B57A] motion-safe:animate-[whatsapp-enter_360ms_ease-out_both] motion-safe:after:animate-[whatsapp-ring_10s_ease-out_1.2s_infinite] motion-reduce:transition-none motion-reduce:after:animate-none after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:border after:border-[#C3A36B]/70 after:opacity-0 after:content-[''] sm:end-8"
      aria-label="تواصل معنا عبر واتساب"
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      <span className="hidden sm:inline">واتساب</span>
      <span className="sr-only">تواصل عبر واتساب</span>
    </a>
  );
}
