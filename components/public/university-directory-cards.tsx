import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, GraduationCap, MapPin } from "lucide-react";
import type { Scholarship, University } from "@/api/public-content";
import { UniversityDirectoryImage } from "@/components/public/university-directory-image";

function CountryFlag({ slug }: { slug?: string }) {
  if (!slug || !["romania", "turkey", "poland", "hungary", "malaysia", "cyprus", "united-kingdom"].includes(slug)) return null;
  return <svg viewBox="0 0 30 20" className="h-4 w-6 shrink-0 rounded-[2px] shadow-sm" aria-hidden="true">
    {slug === "romania" ? <><path fill="#002B7F" d="M0 0h10v20H0z" /><path fill="#FCD116" d="M10 0h10v20H10z" /><path fill="#CE1126" d="M20 0h10v20H20z" /></> : null}
    {slug === "poland" ? <><path fill="#fff" d="M0 0h30v10H0z" /><path fill="#DC143C" d="M0 10h30v10H0z" /></> : null}
    {slug === "hungary" ? <><path fill="#CE2939" d="M0 0h30v7H0z" /><path fill="#fff" d="M0 7h30v6H0z" /><path fill="#477050" d="M0 13h30v7H0z" /></> : null}
    {slug === "turkey" ? <><path fill="#E30A17" d="M0 0h30v20H0z" /><circle fill="#fff" cx="12" cy="10" r="5.5" /><circle fill="#E30A17" cx="13.7" cy="10" r="4.4" /><path fill="#fff" d="m17.7 6.5.8 2.4H21l-2 1.5.8 2.4-2.1-1.5-2 1.5.8-2.4-2-1.5H17z" /></> : null}
    {slug === "malaysia" ? <><path fill="#fff" d="M0 0h30v20H0z" />{[0, 2.86, 5.72, 8.58, 11.44, 14.3, 17.16].map((y) => <rect key={y} y={y} width="30" height="1.43" fill="#CC0001" />)}<path fill="#010066" d="M0 0h15v11.45H0z" /><circle fill="#FFCC00" cx="6.5" cy="5.7" r="3.4" /><circle fill="#010066" cx="7.5" cy="5.2" r="2.9" /><path fill="#FFCC00" d="m11.1 2.2.4 1.6 1.5-.5-.9 1.4 1.2 1-1.6.1-.1 1.6-.8-1.4-1.5.7.7-1.5-1.2-1 1.6.1z" /></> : null}
    {slug === "cyprus" ? <><path fill="#fff" d="M0 0h30v20H0z" /><path fill="#D5782B" d="m6 9 5-3 5 .7 3-1.5 1.8 1.8 3.4-.1-2 2.2-4 .8-2.6 2.1-4.9-.2-2.2-1.5z" /><path fill="none" stroke="#457B42" strokeLinecap="round" strokeWidth="1.2" d="M8 14c4 3 10 3 14 0m-11 1-1-2m4 3-.4-2m3.5 2 .5-2m3.3 1 1-2" /></> : null}
    {slug === "united-kingdom" ? <><path fill="#012169" d="M0 0h30v20H0z" /><path stroke="#fff" strokeWidth="4" d="m0 0 30 20M30 0 0 20" /><path stroke="#C8102E" strokeWidth="1.5" d="m0 0 30 20M30 0 0 20" /><path fill="#fff" d="M0 7h30v6H0zM12 0h6v20h-6z" /><path fill="#C8102E" d="M0 8.5h30v3H0zM13.5 0h3v20h-3z" /></> : null}
  </svg>;
}

const cardClass = "group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E4EAF0] bg-white shadow-[0_12px_30px_-25px_rgba(8,43,80,0.4)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#C8A253] hover:shadow-[0_20px_42px_-24px_rgba(8,43,80,0.48)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253] motion-reduce:transform-none motion-reduce:transition-none";

export function DirectoryUniversityCard({ university, demo }: { university: University; demo: boolean }) {
  const logo = demo && university.id === "demo-university-bucharest" ? "/images/universities/university-of-bucharest.svg" : undefined;
  return <Link href={`/universities/${university.slug}`} className={cardClass}>
    <UniversityDirectoryImage src={university.imageUrl} alt={university.imageAltAr || university.nameAr} className="aspect-[16/10]" />
    <div className="relative flex flex-1 flex-col items-center px-5 pb-5 pt-10 text-center">
      <span className="absolute -top-8 flex size-16 items-center justify-center rounded-xl border border-[#E8EDF2] bg-white p-2 shadow-[0_5px_20px_-10px_rgba(8,43,80,0.45)]">
        {logo ? <Image src={logo} alt={`شعار ${university.nameAr}`} width={56} height={56} className="max-h-full w-auto object-contain" /> : <GraduationCap className="size-8 text-[#91A6BA]" strokeWidth={1.5} aria-hidden="true" />}
      </span>
      <h3 className="min-h-14 text-lg font-extrabold leading-7 text-[#082B50]">{university.nameAr}</h3>
      <div className="mt-2 flex min-h-6 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-[#52647A]">
        {university.country?.nameAr ? <span className="inline-flex items-center gap-1.5"><CountryFlag slug={university.country.slug} />{university.country.nameAr}</span> : null}
        {university.cityAr ? <span className="inline-flex items-center gap-1"><MapPin className="size-4 text-[#8A9BAD]" aria-hidden="true" />{university.cityAr}</span> : null}
      </div>
      {university.overviewAr ? <p className="mt-3 min-h-14 line-clamp-2 text-sm leading-7 text-[#607185]">{university.overviewAr}</p> : <span className="mt-3 min-h-14" aria-hidden="true" />}
      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[#17669C] transition-colors group-hover:text-[#A47B2D]">عرض التفاصيل <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" /></span>
    </div>
  </Link>;
}

export function DirectoryScholarshipCard({ scholarship, university }: { scholarship: Scholarship; university?: University }) {
  const status = scholarship.effectiveApplicationStatus ?? scholarship.applicationStatus;
  return <Link href={`/scholarships/${scholarship.slug}`} className={cardClass}>
    <div className="relative p-2 pb-0">
      <UniversityDirectoryImage src={university?.imageUrl ?? null} alt={university ? `صورة مرتبطة بـ ${university.nameAr}` : ""} className="aspect-[2/1] rounded-lg" />
      <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${status === "OPEN" ? "bg-[#F4D889] text-[#082B50]" : "bg-[#E5EAF0] text-[#394E63]"}`}>{status === "OPEN" ? "التقديم مفتوح" : "التقديم مغلق"}</span>
    </div>
    <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-4 text-center">
      <h3 className="min-h-14 font-extrabold leading-7 text-[#082B50]">{scholarship.titleAr}</h3>
      {scholarship.university?.nameAr ? <p className="mt-2 min-h-6 text-sm font-medium leading-6 text-[#52647A]">{scholarship.university.nameAr}</p> : <span className="mt-2 min-h-6" aria-hidden="true" />}
      {[scholarship.studyLevel, scholarship.fundingType].some(Boolean) ? <p className="mt-2 min-h-6 text-sm leading-6 text-[#607185]">{[scholarship.studyLevel, scholarship.fundingType].filter(Boolean).join(" • ")}</p> : <span className="mt-2 min-h-6" aria-hidden="true" />}
      {scholarship.country?.nameAr ? <p className="mt-2 inline-flex min-h-6 items-center gap-1.5 text-sm text-[#52647A]"><CountryFlag slug={scholarship.country.slug} />{scholarship.country.nameAr}</p> : <span className="mt-2 min-h-6" aria-hidden="true" />}
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-[#17669C] transition-colors group-hover:text-[#A47B2D]">عرض التفاصيل <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" /></span>
    </div>
  </Link>;
}
