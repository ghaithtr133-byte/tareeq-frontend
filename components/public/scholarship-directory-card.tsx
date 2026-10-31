import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Building2, CalendarDays, Coins, GraduationCap, Star } from "lucide-react";
import type { Scholarship } from "@/api/public-content";
import { ScholarshipCountryFlag } from "@/components/public/scholarship-country-flag";
import { scholarshipDeadline, scholarshipStatus } from "@/lib/scholarship-directory";

export function ScholarshipDirectoryCard({ scholarship, media }: {
  scholarship: Scholarship;
  media?: { src: string; alt: string; position?: string };
}) {
  const status = scholarshipStatus(scholarship);
  const deadline = scholarshipDeadline(scholarship.verifiedDeadline);
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E0E8F0] bg-white shadow-[0_6px_20px_-8px_rgba(8,43,80,0.12)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg focus-within:ring-2 focus-within:ring-accent motion-reduce:transform-none motion-reduce:transition-none">
      <div className="relative aspect-[5/2] overflow-hidden bg-[#EAF0F6]">
        {media ? <Image src={media.src} alt={media.alt} fill sizes="(min-width: 1024px) 31vw, (min-width: 768px) 46vw, 100vw" className={`object-cover contrast-[1.05] saturate-[1.15] ${media.src.includes("/trust/") ? "brightness-110" : "brightness-100"}`} style={{ objectPosition: media.position ?? "center" }} /> : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#226EAB] via-[#124E80] to-[#082B50]" aria-hidden="true">
            <span className="grid size-20 place-items-center rounded-full border border-[#C8A253]/60 bg-white/5 text-[#E1BF76]"><GraduationCap className="size-11" strokeWidth={1.2} /></span>
            <span className="absolute bottom-3 text-xs text-white/60">TAREEQ ACADEMY</span>
          </div>
        )}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 text-xs font-bold">
          <span className={`rounded-lg px-3 py-1.5 shadow-sm ${status === "OPEN" ? "bg-[#12813E] text-white" : "bg-[#EDF0F3] text-[#454E58]"}`}>{status === "OPEN" ? "التقديم مفتوح" : "التقديم مغلق"}</span>
          {scholarship.featured ? <span className="inline-flex items-center gap-1 rounded-lg bg-[#C59A45] px-2.5 py-1.5 text-[#082B50] shadow-sm"><Star className="size-3.5" fill="currentColor" aria-hidden="true" />مميزة</span> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h2 className="text-lg font-bold leading-7 text-[#082B50] [overflow-wrap:anywhere]">{scholarship.titleAr}</h2>
        {scholarship.titleEn ? <p dir="ltr" className="mt-0.5 text-right text-sm leading-5 text-[#405878] [overflow-wrap:anywhere]">{scholarship.titleEn}</p> : null}
        <div className="mb-3 mt-3 flex items-center gap-2.5 text-sm leading-6">
          {scholarship.country?.nameAr ? <ScholarshipCountryFlag slug={scholarship.country.slug} name={scholarship.country.nameAr} /> : null}
          <div className="min-w-0">
            {scholarship.country?.nameAr ? <p className="font-bold text-[#173D68]">{scholarship.country.nameAr}</p> : null}
            {scholarship.university?.nameAr ? <p className="flex items-start gap-1 text-xs leading-5 text-[#60738B]"><Building2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><span>{scholarship.university.nameAr}</span></p> : null}
          </div>
        </div>
        <dl className="mt-auto grid grid-cols-3 divide-x divide-x-reverse divide-[#E7ECF2] border-t border-[#E7ECF2] py-3 text-xs leading-5 text-[#52647A]">
          <div className="relative flex min-w-0 items-center gap-1.5 pe-2"><dt className="shrink-0"><GraduationCap className="size-4 text-[#52759B]" aria-hidden="true" /><span className="sr-only">المستوى</span></dt><dd className="[overflow-wrap:anywhere]">{scholarship.studyLevel || "غير محدد"}</dd></div>
          <div className="relative flex min-w-0 items-center gap-1.5 px-2"><dt className="shrink-0"><Coins className="size-4 text-[#52759B]" aria-hidden="true" /><span className="sr-only">التمويل</span></dt><dd className="[overflow-wrap:anywhere]">{scholarship.fundingType || "غير محدد"}</dd></div>
          <div className="relative min-w-0 ps-2"><dt className="mb-0.5 flex items-center gap-1 text-[0.6875rem] text-[#60738B]"><CalendarDays className="size-4 shrink-0 text-[#52759B]" aria-hidden="true" />الموعد</dt><dd>{deadline ? <time dateTime={scholarship.verifiedDeadline!}>{deadline}</time> : "الموعد غير محدد"}</dd></div>
        </dl>
        <Link href={`/scholarships/${scholarship.slug}`} className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#D9BF8E] px-3 text-sm font-bold text-[#123D6A] transition-colors hover:bg-[#F9F4EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label={`التفاصيل والتقديم: ${scholarship.titleAr}`}>
          التفاصيل والتقديم <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
