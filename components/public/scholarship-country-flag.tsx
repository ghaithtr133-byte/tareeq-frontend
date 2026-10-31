import { Flag } from "lucide-react";

// Resolve confirmed country slugs locally; no pending flag/ISO API fields are assumed.
const supported = ["romania", "turkey", "poland", "hungary", "malaysia", "cyprus", "united-kingdom"];

export function ScholarshipCountryFlag({ slug, name }: { slug: string; name: string }) {
  if (!supported.includes(slug)) return <span role="img" aria-label={`علم ${name} غير متوفر`} className="grid h-6 w-9 shrink-0 place-items-center rounded-sm border border-[#DCE4EC] bg-secondary text-muted-foreground"><Flag className="size-4" aria-hidden="true" /></span>;
  return <svg role="img" aria-label={`علم ${name}`} viewBox="0 0 30 20" className="h-6 w-9 shrink-0 overflow-hidden rounded-[3px] shadow-sm">
    {slug === "romania" ? <><path fill="#002B7F" d="M0 0h10v20H0z" /><path fill="#FCD116" d="M10 0h10v20H10z" /><path fill="#CE1126" d="M20 0h10v20H20z" /></> : null}
    {slug === "poland" ? <><path fill="#fff" d="M0 0h30v10H0z" /><path fill="#DC143C" d="M0 10h30v10H0z" /></> : null}
    {slug === "hungary" ? <><path fill="#CE2939" d="M0 0h30v7H0z" /><path fill="#fff" d="M0 7h30v6H0z" /><path fill="#477050" d="M0 13h30v7H0z" /></> : null}
    {slug === "turkey" ? <><path fill="#E30A17" d="M0 0h30v20H0z" /><circle fill="#fff" cx="12" cy="10" r="5.5" /><circle fill="#E30A17" cx="13.7" cy="10" r="4.4" /><path fill="#fff" d="m17.7 6.5.8 2.4H21l-2 1.5.8 2.4-2.1-1.5-2 1.5.8-2.4-2-1.5H17z" /></> : null}
    {slug === "malaysia" ? <><path fill="#fff" d="M0 0h30v20H0z" />{[0, 2.86, 5.72, 8.58, 11.44, 14.3, 17.16].map((y) => <rect key={y} y={y} width="30" height="1.43" fill="#CC0001" />)}<path fill="#010066" d="M0 0h15v11.45H0z" /><circle fill="#FFCC00" cx="6.5" cy="5.7" r="3.4" /><circle fill="#010066" cx="7.5" cy="5.2" r="2.9" /><path fill="#FFCC00" d="m11.1 2.2.4 1.6 1.5-.5-.9 1.4 1.2 1-1.6.1-.1 1.6-.8-1.4-1.5.7.7-1.5-1.2-1 1.6.1z" /></> : null}
    {slug === "cyprus" ? <><path fill="#fff" d="M0 0h30v20H0z" /><path fill="#D5782B" d="m6 9 5-3 5 .7 3-1.5 1.8 1.8 3.4-.1-2 2.2-4 .8-2.6 2.1-4.9-.2-2.2-1.5z" /><path fill="none" stroke="#457B42" strokeLinecap="round" strokeWidth="1.2" d="M8 14c4 3 10 3 14 0m-11 1-1-2m4 3-.4-2m3.5 2 .5-2m3.3 1 1-2" /></> : null}
    {slug === "united-kingdom" ? <><path fill="#012169" d="M0 0h30v20H0z" /><path stroke="#fff" strokeWidth="4" d="m0 0 30 20M30 0 0 20" /><path stroke="#C8102E" strokeWidth="1.5" d="m0 0 30 20M30 0 0 20" /><path fill="#fff" d="M0 7h30v6H0zM12 0h6v20h-6z" /><path fill="#C8102E" d="M0 8.5h30v3H0zM13.5 0h3v20h-3z" /></> : null}
  </svg>;
}
