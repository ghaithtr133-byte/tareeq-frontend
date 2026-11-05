import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main dir="rtl" aria-busy="true" className="bg-[#F7F9FC] pb-8"><p role="status" className="sr-only">جارٍ تحميل صفحة من نحن…</p>
    <div className="bg-[#082B50] py-10"><Container><Skeleton className="mb-4 h-4 w-28" /><Skeleton className="h-10 w-44" /><Skeleton className="mt-4 h-16 w-full max-w-2xl" /></Container></div>
    <Container className="space-y-8 py-8"><Skeleton className="h-28 w-full" /><Skeleton className="h-48 w-full" /><div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((id) => <Skeleton key={id} className="h-52" />)}</div><Skeleton className="h-64 w-full" /></Container>
  </main>;
}
