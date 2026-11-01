import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ClipboardList, Compass, FileText, GraduationCap, HandCoins } from "lucide-react";
import { availableServiceHref, type PublicService } from "@/lib/public-services";

const icons = { admissions: GraduationCap, major: Compass, scholarships: HandCoins, documents: FileText, "follow-up": ClipboardList };

/** Thematic branded artwork when no approved service-specific photograph exists. */
function ServiceArtwork({ service }: { service: PublicService }) {
  const Icon = icons[service.icon];
  return <svg viewBox="0 0 320 160" role="img" aria-label={`رسم توضيحي لخدمة ${service.title}`} className="h-full w-full">
    <rect width="320" height="160" fill={service.icon === "documents" ? "#F4EFE6" : "#E9F0F7"} />
    <circle cx="282" cy="26" r="90" fill="#C9DCEB" opacity=".45" />
    <circle cx="30" cy="164" r="80" fill="#D8BB7D" opacity=".18" />
    {service.icon === "major" ? <><path d="m15 40 73-20 66 12 74-16 70 16v95l-70-16-74 17-66-13-73 18z" fill="#D6E3EE" /><path d="M88 20v95m66-83v96m74-112v95" stroke="#BACDDD" strokeWidth="2" /><circle cx="160" cy="80" r="59" fill="#C3A36B" /><circle cx="160" cy="80" r="52" fill="#173654" /><Compass x="117" y="37" width="86" height="86" color="#E6C68C" strokeWidth="1.2" /></> : <>
      <rect x="108" y="24" width="100" height="124" rx="9" fill="#B6C8D9" opacity=".45" transform="rotate(-10 158 86)" />
      <rect x="104" y="17" width="112" height="128" rx="9" fill="white" stroke="#CBD8E4" strokeWidth="2" />
      <Icon x="123" y="35" width="74" height="90" color="#173654" strokeWidth="1.3" />
      <circle cx="218" cy="117" r="20" fill="#C3A36B" /><Check x="206" y="105" width="24" height="24" color="white" strokeWidth="2" />
    </>}
  </svg>;
}

export function ServiceOverviewCard({ service, publishedHref }: { service: PublicService; publishedHref?: string | null }) {
  const Icon = icons[service.icon];
  const href = publishedHref ?? availableServiceHref(service);
  const actionClass = "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border bg-[#FFFCF6] px-3 py-2 text-sm font-bold text-primary";
  return <article data-service-card={service.slug} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E1E8EF] bg-white shadow-[0_4px_16px_-10px_rgba(8,43,80,0.18)] transition-[translate,box-shadow] duration-200 hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none">
    <div className="relative aspect-[2/1] overflow-hidden bg-[#EAF0F6]">{service.image ? <Image src={service.image.src} alt={service.image.alt} fill sizes="(min-width: 1280px) 19vw, (min-width: 1024px) 31vw, (min-width: 768px) 47vw, 100vw" className="object-cover" /> : <ServiceArtwork service={service} />}</div>
    <div className="relative flex flex-1 flex-col px-4 pb-4 pt-9 text-center">
      <span className="absolute -top-6 left-1/2 grid h-12 w-14 -translate-x-1/2 place-items-center rounded-xl border border-[#E4E9F0] bg-white text-[#B88B3E] shadow-sm"><Icon className="size-7" strokeWidth={1.6} aria-hidden="true" /></span>
      <h2 className="text-lg font-bold leading-8 text-primary">{service.title}</h2>
      <p className="mb-4 mt-2 text-sm leading-7 text-muted-foreground">{service.description}</p>
      <div className="mt-auto pt-1">{href ? <Link href={href} className={`${actionClass} transition-colors hover:bg-[#F8F0DF] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`} style={{ borderColor: "var(--accent)" }}>اعرف المزيد<ArrowLeft className="size-4" aria-hidden="true" /></Link> : <>
        <button type="button" disabled aria-describedby={`service-pending-${service.slug}`} className={`${actionClass} cursor-not-allowed`} style={{ borderColor: "var(--accent)" }}>اعرف المزيد<ArrowLeft className="size-4" aria-hidden="true" /></button>
        <p id={`service-pending-${service.slug}`} className="mt-1.5 text-xs leading-6 text-muted-foreground">التفاصيل غير متاحة بعد</p>
      </>}</div>
    </div>
  </article>;
}
