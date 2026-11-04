import { CalendarDays, Coins, FileText, Languages } from "lucide-react";
import { Container } from "@/components/layout/container";

// Presentation data only. These are NOT additional Country API response fields.
export type CountryInformationItem = { title: string; value: string };
const icons = { "لغة الدراسة": Languages, "التكاليف الدراسية": Coins, "متطلبات القبول": FileText, "مواعيد الدراسة": CalendarDays };

export function meaningfulCountryInformation(items: readonly CountryInformationItem[]) {
  return items.filter((item) => item.title.trim() && item.value.trim()).filter((item, index, all) => all.findIndex((other) => other.title === item.title) === index).slice(0, 4);
}

export function CountryInformationFact({ item, inline = false }: { item: CountryInformationItem; inline?: boolean }) {
  const Icon = icons[item.title as keyof typeof icons] ?? FileText;
  return <div data-country-fact className={`flex min-w-0 items-start gap-3 rounded-xl border border-[#E7ECF2] bg-white p-4 ${inline ? "mt-4 w-fit max-w-full border-s-2 border-s-[#C8A253]" : "h-full shadow-[0_10px_24px_-20px_rgba(8,43,80,0.3)]"}`}>
    <Icon className="mt-1 size-7 shrink-0 text-[#A47B2D]" strokeWidth={1.5} aria-hidden="true" />
    <div className="min-w-0"><h3 className="text-base font-bold leading-7 text-[#082B50]">{item.title}</h3><p className="mt-1 text-sm leading-7 text-[#52647A]">{item.value}</p></div>
  </div>;
}

export function CountryInformation({ items, demo }: { items: readonly CountryInformationItem[]; demo: boolean }) {
  if (items.length < 2) return null;
  const grid = items.length === 2 ? "max-w-3xl sm:grid-cols-2" : items.length === 3 ? "max-w-5xl sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4";
  return <section aria-labelledby="country-information-title" className="bg-[#EEF3F8] py-6">
    <Container>
      <h2 id="country-information-title" className="text-2xl font-bold leading-[1.5] text-[#082B50] sm:text-3xl">معلومات مهمة للطلاب</h2>
      {demo ? <p className="mt-2 text-xs leading-6 text-[#52647A]">أمثلة افتراضية للعرض فقط؛ ليست رسومًا أو شروطًا أو مواعيد رسمية حالية.</p> : null}
      <div data-country-information-grid className={`mt-4 grid items-stretch gap-3 ${grid}`}>{items.map((item) => <CountryInformationFact key={item.title} item={item} />)}</div>
    </Container>
  </section>;
}
