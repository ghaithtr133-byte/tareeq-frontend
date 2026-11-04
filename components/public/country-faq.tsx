"use client";

import { useState } from "react";
import { FaqAccordion, type FaqItem } from "@/components/public/faq-accordion";

export function CountryFaq({ items, name }: { items: readonly FaqItem[]; name: string }) {
  const [expanded, setExpanded] = useState(false);
  const moreId = `${name}-more`;
  return <div className="min-w-0">
    <FaqAccordion items={items.slice(0, 5)} name={name} initialOpen={false} />
    {items.length > 5 ? <>
      <div id={moreId} hidden={!expanded} className="mt-3"><FaqAccordion items={items.slice(5)} name={name} initialOpen={false} /></div>
      <button type="button" aria-expanded={expanded} aria-controls={moreId} onClick={() => setExpanded(!expanded)} className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-[#C8A253] px-5 text-sm font-bold text-[#082B50] transition-colors hover:bg-[#FBF5E9] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#A47B2D] motion-reduce:transition-none">{expanded ? "عرض أسئلة أقل" : "عرض جميع الأسئلة"}</button>
    </> : null}
  </div>;
}
