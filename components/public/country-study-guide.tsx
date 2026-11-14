import { BookOpen, ClipboardList, Wallet } from "lucide-react";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/ui/content-state";

export type CountryStudyGuidePanel = { title: string; introduction: string; steps: string[] };
const icons = [BookOpen, ClipboardList, Wallet];

export function CountryStudyGuide({ countryName, panels, demo = false }: { countryName: string; panels: readonly CountryStudyGuidePanel[]; demo?: boolean }) {
  const available = panels.filter((panel) => panel.introduction.trim() || panel.steps.some((step) => step.trim()));
  return <section aria-labelledby="country-guide-title" className="py-6 sm:py-8">
    <Container>
      <h2 id="country-guide-title" className="text-2xl font-bold leading-[1.5] sm:text-3xl">دليلك للدراسة في {countryName}</h2>
      {demo ? <p className="mt-2 text-xs leading-6 text-[#52647A]">خطة بحث توضيحية للعرض التجريبي؛ ليست متطلبات قبول أو تكاليف أو مواعيد رسمية.</p> : null}
      {!available.length ? <EmptyState className="mt-4" title="محتوى الدليل غير متاح حالياً" description="يمكنك العودة لاحقاً للاطلاع على إرشادات هذه الوجهة." /> : null}
      <div className="mt-4 grid items-start gap-3 lg:grid-cols-3">
        {available.map((panel, index) => { const Icon = icons[index % icons.length]; return <article key={panel.title} data-country-guide-panel className="min-w-0 rounded-xl border border-[#E2E8EF] bg-white">
          <div className="flex min-h-16 items-center gap-3 rounded-t-xl p-4 text-sm font-bold leading-7 text-[#082B50]">
            <Icon className="size-6 shrink-0 text-[#A47B2D]" strokeWidth={1.5} aria-hidden="true" />
            <span className="min-w-0 flex-1">{panel.title}</span>
          </div>
          <div className="space-y-3 border-t border-[#E2E8EF] p-4 text-sm leading-8 text-[#52647A]">
            {panel.introduction.trim() ? <p>{panel.introduction}</p> : null}
            {panel.steps.some((step) => step.trim()) ? <ul className="list-disc space-y-2 ps-5 marker:text-[#A47B2D]">{panel.steps.filter((step) => step.trim()).map((step) => <li key={step}>{step}</li>)}</ul> : null}
          </div>
        </article>; })}
      </div>
    </Container>
  </section>;
}
