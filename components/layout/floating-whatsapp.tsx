import { createWhatsappUrl } from "@/lib/whatsapp";

/** Uses the same approved destination already published in the site header and footer. */
export function FloatingWhatsapp() {
  return (
    <a
      href={createWhatsappUrl()}
      target="_blank"
      rel="noreferrer"
      className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] end-5 z-40 size-14 rounded-full focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#D4B57A] motion-safe:animate-[whatsapp-float_4.8s_ease-in-out_infinite] motion-reduce:animate-none sm:end-8 sm:size-[3.75rem]"
      aria-label="تواصل معنا عبر واتساب"
    >
      <span className="relative grid size-full place-items-center overflow-hidden rounded-full bg-[#25D366] text-white shadow-[0_14px_28px_-12px_rgba(37,211,102,0.8),0_0_0_6px_rgba(37,211,102,0.12)] transition-[transform,box-shadow] duration-300 ease-out group-hover:scale-[1.05] group-hover:shadow-[0_18px_34px_-12px_rgba(37,211,102,0.9),0_0_0_8px_rgba(37,211,102,0.16)] group-focus-visible:scale-[1.05] motion-reduce:transition-none">
        <span
          className="pointer-events-none absolute -inset-y-3 -left-10 w-5 -skew-x-12 bg-white/30 opacity-0 motion-safe:animate-[whatsapp-shine_8.8s_ease-in-out_infinite] motion-reduce:animate-none"
          aria-hidden="true"
        />
        <WhatsappIcon className="relative size-7 sm:size-8" />
      </span>
    </a>
  );
}

function WhatsappIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M27.1 4.8A15.55 15.55 0 0 0 16.04.22C7.44.22.45 7.2.45 15.8c0 2.75.72 5.44 2.09 7.81L.32 31.72l8.3-2.18a15.62 15.62 0 0 0 7.41 1.88h.01c8.59 0 15.58-6.99 15.58-15.59 0-4.16-1.62-8.07-4.52-11.03Zm-11.06 24a12.9 12.9 0 0 1-6.58-1.8l-.47-.28-4.92 1.29 1.31-4.79-.31-.5a12.9 12.9 0 0 1-1.98-6.89c0-7.13 5.8-12.93 12.94-12.93 3.45 0 6.69 1.34 9.13 3.79a12.84 12.84 0 0 1 3.78 9.14c0 7.13-5.8 12.95-12.92 12.95Zm7.09-9.68c-.39-.2-2.29-1.13-2.65-1.26-.35-.13-.61-.2-.87.2-.26.39-1 1.26-1.23 1.52-.23.26-.46.29-.85.1-.39-.2-1.66-.61-3.16-1.95a11.84 11.84 0 0 1-2.19-2.72c-.23-.39-.02-.6.17-.79.18-.18.39-.46.59-.69.19-.23.26-.39.39-.66.13-.26.06-.49-.04-.69-.1-.2-.87-2.09-1.19-2.86-.32-.76-.64-.66-.87-.67h-.74c-.26 0-.68.1-1.03.49-.36.39-1.36 1.33-1.36 3.25 0 1.92 1.39 3.77 1.58 4.03.2.26 2.74 4.18 6.64 5.86.93.4 1.66.64 2.23.82.94.3 1.8.26 2.48.16.76-.11 2.29-.94 2.61-1.85.32-.91.32-1.69.23-1.85-.1-.16-.36-.26-.74-.46Z" />
    </svg>
  );
}
