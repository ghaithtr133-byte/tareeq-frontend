import { Container } from "@/components/layout/container";

export default function ServiceDetailLoading() {
  return <main aria-busy="true"><Container className="space-y-4 py-6"><p role="status" className="text-primary">جارٍ تحميل الخدمة…</p><div className="h-60 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" /><div className="h-32 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" /><div className="h-48 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" /></Container></main>;
}
