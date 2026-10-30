import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Country } from "@/api/public-content";
import { StudyAbroadImage } from "@/components/public/study-abroad-image";

function CountryFlag({ slug }: { slug: string }) {
  if (!['romania', 'turkey', 'poland', 'hungary', 'malaysia', 'cyprus', 'united-kingdom'].includes(slug)) return null;
  return <svg viewBox="0 0 30 20" className="h-6 w-9 shrink-0 rounded-[3px] shadow-sm" aria-hidden="true">
    {slug === 'romania' ? <><path fill="#002B7F" d="M0 0h10v20H0z" /><path fill="#FCD116" d="M10 0h10v20H10z" /><path fill="#CE1126" d="M20 0h10v20H20z" /></> : null}
    {slug === 'poland' ? <><path fill="#fff" d="M0 0h30v10H0z" /><path fill="#DC143C" d="M0 10h30v10H0z" /></> : null}
    {slug === 'hungary' ? <><path fill="#CE2939" d="M0 0h30v7H0z" /><path fill="#fff" d="M0 7h30v6H0z" /><path fill="#477050" d="M0 13h30v7H0z" /></> : null}
    {slug === 'turkey' ? <><path fill="#E30A17" d="M0 0h30v20H0z" /><circle fill="#fff" cx="12" cy="10" r="5.5" /><circle fill="#E30A17" cx="13.7" cy="10" r="4.4" /><path fill="#fff" d="m17.7 6.5.8 2.4H21l-2 1.5.8 2.4-2.1-1.5-2 1.5.8-2.4-2-1.5H17z" /></> : null}
    {slug === 'malaysia' ? <><path fill="#fff" d="M0 0h30v20H0z" />{[0, 2.86, 5.72, 8.58, 11.44, 14.3, 17.16].map((y) => <rect key={y} y={y} width="30" height="1.43" fill="#CC0001" />)}<path fill="#010066" d="M0 0h15v11.45H0z" /><circle fill="#FFCC00" cx="6.5" cy="5.7" r="3.4" /><circle fill="#010066" cx="7.5" cy="5.2" r="2.9" /><path fill="#FFCC00" d="m11.1 2.2.4 1.6 1.5-.5-.9 1.4 1.2 1-1.6.1-.1 1.6-.8-1.4-1.5.7.7-1.5-1.2-1 1.6.1z" /></> : null}
    {slug === 'cyprus' ? <><path fill="#fff" d="M0 0h30v20H0z" /><path fill="#D5782B" d="m6 9 5-3 5 .7 3-1.5 1.8 1.8 3.4-.1-2 2.2-4 .8-2.6 2.1-4.9-.2-2.2-1.5z" /><path fill="none" stroke="#457B42" strokeLinecap="round" strokeWidth="1.2" d="M8 14c4 3 10 3 14 0m-11 1-1-2m4 3-.4-2m3.5 2 .5-2m3.3 1 1-2" /></> : null}
    {slug === 'united-kingdom' ? <><path fill="#012169" d="M0 0h30v20H0z" /><path stroke="#fff" strokeWidth="4" d="m0 0 30 20M30 0 0 20" /><path stroke="#C8102E" strokeWidth="1.5" d="m0 0 30 20M30 0 0 20" /><path fill="#fff" d="M0 7h30v6H0zM12 0h6v20h-6z" /><path fill="#C8102E" d="M0 8.5h30v3H0zM13.5 0h3v20h-3z" /></> : null}
  </svg>;
}

export function StudyAbroadCountryCards({ countries }: { countries: Country[] }) {
  return <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {countries.map((country) => (
      <article key={country.id} className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_12px_30px_-25px_rgba(8,43,80,0.42)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#C8A253] hover:shadow-[0_20px_42px_-24px_rgba(8,43,80,0.48)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#C8A253] motion-reduce:transform-none motion-reduce:transition-none">
        <Link href={`/study-abroad/${country.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-[#EAF0F6] focus-visible:outline-none" aria-label={`تفاصيل الدراسة في ${country.nameAr}`}>
          <StudyAbroadImage src={country.imageUrl} alt={country.imageAltAr || `مشهد من ${country.nameAr}`} />
          {country.featured ? <span className="absolute right-4 top-4 rounded-full bg-[#C8A253] px-3 py-1 text-xs font-bold text-[#082B50] shadow-sm">وجهة مميزة</span> : null}
        </Link>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/study-abroad/${country.slug}`} className="min-w-0 text-xl font-extrabold text-[#082B50] transition-colors hover:text-[#A47B2D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#C8A253]">
              {country.nameAr}
            </Link>
            <CountryFlag slug={country.slug} />
          </div>
          <p className="mt-3 min-h-14 line-clamp-2 text-sm leading-7 text-[#607185]">{country.introductionAr}</p>
          <Link href={`/universities?country=${encodeURIComponent(country.slug)}`} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-bold text-[#17669C] transition-colors hover:text-[#A47B2D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253]">
            عرض الجامعات <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
          </Link>
        </div>
      </article>
    ))}
  </div>;
}
