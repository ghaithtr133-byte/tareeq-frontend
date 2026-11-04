import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { contactInformation, type ContactSettings } from "@/lib/contact";
import { createWhatsappUrl } from "@/lib/whatsapp";

const focus = "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#C8A253]";

// Reuse the approved glyph, not a second floating control.
function WhatsappIcon() {
  return <svg viewBox="0 0 32 32" fill="currentColor" className="size-9 shrink-0" aria-hidden="true"><path d="M27.1 4.8A15.55 15.55 0 0 0 16.04.22C7.44.22.45 7.2.45 15.8c0 2.75.72 5.44 2.09 7.81L.32 31.72l8.3-2.18a15.62 15.62 0 0 0 7.41 1.88h.01c8.59 0 15.58-6.99 15.58-15.59 0-4.16-1.62-8.07-4.52-11.03Zm-11.06 24a12.9 12.9 0 0 1-6.58-1.8l-.47-.28-4.92 1.29 1.31-4.79-.31-.5a12.9 12.9 0 0 1-1.98-6.89c0-7.13 5.8-12.93 12.94-12.93 3.45 0 6.69 1.34 9.13 3.79a12.84 12.84 0 0 1 3.78 9.14c0 7.13-5.8 12.95-12.92 12.95Zm7.09-9.68c-.39-.2-2.29-1.13-2.65-1.26-.35-.13-.61-.2-.87.2-.26.39-1 1.26-1.23 1.52-.23.26-.46.29-.85.1-.39-.2-1.66-.61-3.16-1.95a11.84 11.84 0 0 1-2.19-2.72c-.23-.39-.02-.6.17-.79.18-.18.39-.46.59-.69.19-.23.26-.39.39-.66.13-.26.06-.49-.04-.69-.1-.2-.87-2.09-1.19-2.86-.32-.76-.64-.66-.87-.67h-.74c-.26 0-.68.1-1.03.49-.36.39-1.36 1.33-1.36 3.25 0 1.92 1.39 3.77 1.58 4.03.2.26 2.74 4.18 6.64 5.86.93.4 1.66.64 2.23.82.94.3 1.8.26 2.48.16.76-.11 2.29-.94 2.61-1.85.32-.91.32-1.69.23-1.85-.1-.16-.36-.26-.74-.46Z" /></svg>;
}

export function ContactWhatsappCard() {
  return <section aria-labelledby="contact-whatsapp-title" className="rounded-2xl border border-[#DDEEE4] bg-[#EFF8F2] p-4 sm:p-5">
    <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><h2 id="contact-whatsapp-title" className="text-lg font-bold leading-8">تواصل مباشرة عبر واتساب</h2><p className="mt-1 text-sm leading-7 text-muted-foreground">للاستفسارات والتواصل المباشر مع فريق طريق.</p></div><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#139644] text-white"><WhatsappIcon /></span></div>
    <a href={createWhatsappUrl()} target="_blank" rel="noopener noreferrer" className={`mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#138A3B] px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-[#107332] active:bg-[#0B6029] motion-reduce:transition-none ${focus}`}>تواصل عبر واتساب<ExternalLink className="size-4 shrink-0" aria-hidden="true" /><span className="sr-only">(يفتح في نافذة جديدة)</span></a>
  </section>;
}

function SocialIcon({ kind }: { kind: string }) {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "facebookUrl" ? <path d="M14 21v-8h3l.5-4H14V7c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8" /> : kind === "instagramUrl" ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></> : kind === "linkedinUrl" ? <><path d="M5 9v11M10 20V9h4v2c1-3 6-3 6 2v7M14 11v9" /><circle cx="5" cy="4" r="1" /></> : <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 6 3-6 3Z" /></>}
  </svg>;
}

export function ContactInformationCard({ settings }: { settings: ContactSettings }) {
  const information = contactInformation(settings);
  const socials = [["facebookUrl", "فيسبوك"], ["instagramUrl", "إنستغرام"], ["linkedinUrl", "لينكدإن"], ["youtubeUrl", "يوتيوب"]] as const;
  const items = [
    { label: "البريد الإلكتروني", ...information.email, icon: Mail },
    { label: "رقم الهاتف", ...information.phone, icon: Phone },
    { label: "العنوان", ...information.address, icon: MapPin },
  ];
  return <section aria-labelledby="contact-information-title" className="min-w-0 rounded-2xl border border-[#E0E7EF] bg-white p-4 shadow-sm sm:p-5">
    <h2 id="contact-information-title" className="text-lg font-bold leading-8">معلومات التواصل الأخرى</h2>
    {settings.academyNameAr ? <p className="mt-1 text-sm leading-7 text-muted-foreground">{settings.academyNameAr}</p> : null}
    <dl className="mt-2 divide-y divide-[#E0E7EF]">{items.map(({ label, value, href, placeholder, icon: Icon }) => <div key={label} className="flex min-w-0 items-center gap-3 py-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#FAF4E7] text-[#B48B36]"><Icon className="size-6" aria-hidden="true" /></span><div className="min-w-0"><dt className="flex flex-wrap items-center gap-x-2 text-sm font-bold">{label}{placeholder ? <span className="text-xs font-normal text-muted-foreground">بيانات تجريبية</span> : null}</dt><dd className="whitespace-pre-line text-sm leading-7 text-muted-foreground [overflow-wrap:anywhere]">{href ? <a href={href} className={`inline-flex min-h-11 max-w-full items-center rounded-sm hover:underline ${focus}`}><bdi>{value}</bdi></a> : <span className="inline-flex min-h-11 max-w-full items-center"><bdi>{value}</bdi></span>}</dd></div></div>)}</dl>
    <nav aria-label="تابعنا على مواقع التواصل" className="mt-3 border-t border-[#E0E7EF] pt-4"><h3 className="text-sm font-bold">تابعنا على مواقع التواصل</h3><div className="mt-3 flex flex-wrap gap-3">{socials.map(([key, label]) => information.settings[key] ? <a key={key} href={information.settings[key]} target="_blank" rel="noopener noreferrer" aria-label={`${label} (يفتح في نافذة جديدة)`} className={`grid size-11 place-items-center rounded-lg border border-[#D7DFE8] bg-[#FAFCFE] transition-colors hover:bg-[#FAF4E7] motion-reduce:transition-none ${focus}`}><SocialIcon kind={key} /></a> : <button key={key} type="button" disabled aria-disabled="true" aria-label={`${label} — غير محدد بعد`} title="غير محدد بعد" className="grid size-11 place-items-center rounded-lg border border-[#E0E7EF] bg-[#F5F7FA] text-[#7A8796]"><SocialIcon kind={key} /></button>)}</div></nav>
  </section>;
}
