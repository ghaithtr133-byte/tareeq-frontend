"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { filterUniversityPrograms, programTuition, type UniversityProgram } from "@/lib/university-details";
import { createWhatsappUrl } from "@/lib/whatsapp";
import type { ProgramFilters } from "@/lib/university-details";
import { directoryLanguages, directoryStudyLevels } from "@/lib/university-directory-data";
import { EmptyState } from "@/components/ui/content-state";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";

const control = "min-h-11 w-full min-w-0 rounded-lg border bg-white px-3 text-sm text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const emptyFilters = { search: "", level: "", language: "", faculty: "" };

export function UniversityPrograms({ programs, university, demo, server }: { programs: UniversityProgram[]; university: string; demo: boolean; server?: { filters: ProgramFilters; onFilters: (filters: ProgramFilters) => void; total: number; pending?: boolean; failed?: boolean } }) {
  const [localFilters, setLocalFilters] = useState(emptyFilters);
  const filters = server?.filters ?? localFilters;
  const setFilters = server?.onFilters ?? setLocalFilters;
  const levels = server ? Object.keys(directoryStudyLevels) : [...new Set(programs.map((program) => program.level))];
  const languages = server ? Object.keys(directoryLanguages) : [...new Set(programs.flatMap((program) => program.language ? [program.language] : []))];
  const faculties = [...new Set(programs.flatMap((program) => program.faculty ? [program.faculty] : []))];
  const visible = server ? programs : filterUniversityPrograms(programs, filters);
  const fee = (program: UniversityProgram) => {
    const seen = new Set<string>();
    const schedules = [...(program.tuition ? [program.tuition] : []), ...(program.tuitionHistory ?? [])].filter((item) => {
      const key = JSON.stringify(item); if (seen.has(key)) return false; seen.add(key); return true;
    });
    return schedules.length ? schedules.map(programTuition).join("؛ ") : demo ? programTuition(null) : "الرسوم الدراسية (غير متوفر حالياً)";
  };
  function inquiry(program: UniversityProgram) {
    return <a href={createWhatsappUrl(`مرحبًا، أود الاستفسار عن ${program.name} في ${university}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-accent px-3 text-sm font-bold text-primary hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent" aria-label={`استفسر عن ${program.name} عبر واتساب (يفتح في نافذة جديدة)`}>استفسر عبر واتساب</a>;
  }
  return <>
    <h2 className="text-xl font-bold leading-8 text-primary sm:text-2xl">التخصصات والرسوم</h2>
    {!programs.length && !server ? <div className="mt-4 rounded-xl bg-muted/70 p-5 text-sm leading-8 text-muted-foreground">لا تتوفر حاليًا بيانات منشورة عن التخصصات والرسوم لهذه الجامعة. يمكنك الاستفسار عبر بطاقة التواصل؛ لا يعني ذلك عدم وجود تخصصات.</div> : <>
      {demo ? <p className="mt-3 rounded-lg bg-[#FBF5E9] p-3 text-xs leading-6 text-[#73551E]">تخصصات ورسوم خيالية للعرض التجريبي فقط، وليست معلومات أو أسعارًا رسمية للجامعة. تُذكر فترة الرسوم فقط عند توفرها في المثال.</p> : null}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="المستوى الدراسي">
        {["", ...levels].map((level) => <button type="button" key={level} aria-pressed={filters.level === level} onClick={() => setFilters({ ...filters, level })} className={`min-h-11 rounded-full border px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${filters.level === level ? "border-primary bg-primary text-white" : "bg-muted/40 text-primary hover:bg-accent/10"}`}>{server && level ? directoryStudyLevels[level as keyof typeof directoryStudyLevels] : level || "جميع المراحل"}</button>)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="relative block min-w-0"><span className="sr-only">ابحث عن تخصص</span><Search className="pointer-events-none absolute end-3 top-3 size-5 text-muted-foreground" aria-hidden="true" /><input type="search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="ابحث عن تخصص…" className={`${control} pe-10`} /></label>
        {languages.length ? <label className="block min-w-0"><span className="sr-only">لغة الدراسة</span><select aria-label="لغة الدراسة" value={filters.language} onChange={(event) => setFilters({ ...filters, language: event.target.value })} className={control}><option value="">لغة الدراسة: الكل</option>{languages.map((language) => <option key={language} value={language}>{server ? directoryLanguages[language as keyof typeof directoryLanguages] : language}</option>)}</select></label> : null}
        {server ? <label className="block min-w-0"><span className="sr-only">الكلية</span><input type="search" aria-label="الكلية" placeholder="الكلية: الكل" value={filters.faculty} onChange={(event) => setFilters({ ...filters, faculty: event.target.value })} className={control} /></label> : faculties.length ? <label className="block min-w-0"><span className="sr-only">الكلية</span><select aria-label="الكلية" value={filters.faculty} onChange={(event) => setFilters({ ...filters, faculty: event.target.value })} className={control}><option value="">الكلية: الكل</option>{faculties.map((faculty) => <option key={faculty}>{faculty}</option>)}</select></label> : null}
      </div>
      <div className="my-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"><p role="status">{server?.pending ? "جارٍ تحديث النتائج…" : server?.failed ? "تعذّر تحديث النتائج" : `${server?.total ?? visible.length} تخصص في النتائج`}</p>{Object.values(filters).some(Boolean) ? <button type="button" onClick={() => setFilters(emptyFilters)} className="min-h-11 rounded px-2 font-bold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent">مسح الفلاتر</button> : null}</div>
      {!visible.length ? server?.pending || server?.failed ? null : <EmptyState title="لا تتوفر تخصصات مطابقة حالياً" description="لا تتوفر حاليًا بيانات منشورة عن التخصصات المطابقة لهذه الجامعة. جرّب تغيير الفلاتر أو الاستفسار عبر بطاقة التواصل." /> : <>
        <div className="hidden xl:block"><table className="w-full table-fixed text-right text-sm leading-7"><caption className="sr-only">تخصصات {university} والرسوم المتوفرة</caption><thead className="bg-[#EEF2F7] text-primary"><tr>{["التخصص", "الكلية", "لغة الدراسة", "مدة الدراسة", "الرسوم الدراسية", "الاستفسار"].map((label) => <th key={label} scope="col" className="p-2 font-bold">{label}</th>)}</tr></thead><tbody>{visible.map((program) => <tr key={program.id} className="border-b align-top odd:bg-[#FAFBFD] [&>td]:break-words [&>td]:p-2"><th scope="row" className="break-words p-2 font-bold text-primary">{program.name}<span className="block text-xs font-normal text-muted-foreground">{program.level}</span></th><td>{program.faculty ?? "غير معلنة"}</td><td>{program.language ?? "غير معلنة"}</td><td>{program.duration ?? "غير معلنة"}</td><td>{fee(program)}</td><td>{inquiry(program)}</td></tr>)}</tbody></table></div>
        <BalancedCardGrid columns={{ md: 2 }} gap={4} className="xl:hidden" data-program-cards>{visible.map((program) => <article key={program.id} className="flex min-w-0 flex-col rounded-xl border bg-[#FAFBFD] p-4"><h3 className="text-lg font-bold leading-7 text-primary">{program.name}</h3><p className="mt-1 text-sm text-[#947335]">{program.level}</p><dl className="mb-4 mt-3 space-y-2 text-sm leading-7 text-muted-foreground">{[["الكلية", program.faculty], ["لغة الدراسة", program.language], ["مدة الدراسة", program.duration], ["الرسوم الدراسية", fee(program)]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-x-3"><dt>{label}</dt><dd className="text-primary [overflow-wrap:anywhere]">{value}</dd></div>)}</dl><div className="mt-auto">{inquiry(program)}</div></article>)}</BalancedCardGrid>
      </>}
    </>}
  </>;
}
