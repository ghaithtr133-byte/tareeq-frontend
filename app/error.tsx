"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-muted/60 px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-[0.6875rem] font-bold tracking-[0.17em] text-accent">تعذر إكمال الطلب</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.35] text-primary sm:text-5xl">حدثت مشكلة مؤقتة.</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">يرجى المحاولة مرة أخرى. لم نعرض أي تفاصيل تقنية لحماية خصوصيتك.</p>
        <Button type="button" className="mt-8" onClick={reset}>إعادة المحاولة</Button>
      </div>
    </main>
  );
}
