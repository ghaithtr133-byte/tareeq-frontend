import { ChevronDown } from "lucide-react";

export type FaqItem = { question: string; answer: string };

/** The Homepage's exact disclosure markup, shared without changing its defaults. */
export function FaqAccordion({ items, name, initialOpen = true }: { items: readonly FaqItem[]; name: string; initialOpen?: boolean }) {
  return <div className="space-y-3">{items.map(({ question, answer }, index) => (
    <details key={question} name={name} open={initialOpen && index === 0} className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_12px_30px_-26px_rgba(8,43,80,0.3)]">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-right text-base font-bold leading-7 text-[#082B50] transition-colors hover:bg-[#FAFBFD] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#A47B2D] motion-reduce:transition-none sm:px-6 sm:text-lg [&::-webkit-details-marker]:hidden">
        <span>{question}</span><ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr] motion-reduce:transition-none"><div className="overflow-hidden"><div className="border-t border-[#E2E8F0] px-5 py-4 text-right text-base leading-8 text-[#52647A] sm:px-6">{answer}</div></div></div>
    </details>
  ))}</div>;
}
