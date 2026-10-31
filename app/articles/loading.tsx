import { Container } from "@/components/layout/container";

export default function ArticlesLoading() {
  return <main aria-busy="true" className="bg-[#F6F8FB] py-6"><Container><p role="status" className="text-sm text-muted-foreground">جارٍ تحميل المقالات…</p><div aria-hidden="true" className="mt-4 space-y-5"><div className="h-20 rounded-xl bg-secondary motion-safe:animate-pulse" /><div className="h-16 rounded-xl bg-white" /><div className="grid gap-5 md:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-64 rounded-xl border border-[#E1E8EF] bg-white motion-safe:animate-pulse" />)}</div></div></Container></main>;
}
