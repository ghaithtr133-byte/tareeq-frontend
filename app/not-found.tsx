import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-muted/60 py-16 sm:py-24">
      <Container className="max-w-3xl">
        <p className="text-[0.6875rem] font-bold tracking-[0.17em] text-accent">404</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.35] text-primary sm:text-5xl">لم نعثر على هذه الصفحة.</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">قد يكون الرابط غير صحيح أو أن المحتوى لم يعد متاحًا.</p>
        <Button asChild className="mt-8"><Link href="/">العودة إلى الرئيسية</Link></Button>
      </Container>
    </main>
  );
}
