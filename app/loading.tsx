import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <main className="bg-background py-16 sm:py-24" aria-busy="true" aria-label="جارٍ تحميل المحتوى">
      <Container className="max-w-4xl">
        <div className="h-3 w-28 animate-pulse bg-secondary" />
        <div className="mt-6 h-14 max-w-2xl animate-pulse bg-secondary" />
        <div className="mt-4 h-6 max-w-xl animate-pulse bg-secondary" />
      </Container>
    </main>
  );
}
