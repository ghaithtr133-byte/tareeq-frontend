import { Container } from "@/components/layout/container";

export default function UniversityLoading() {
  return <main aria-busy="true"><Container className="space-y-5 py-8"><p role="status" className="text-primary">جارٍ تحميل بيانات الجامعة…</p><div className="h-40 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" /><div className="h-14 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" /><div className="h-64 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" /></Container></main>;
}
