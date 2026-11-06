import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";
import { UniversitiesDirectoryLive } from "@/components/public/universities-directory-live";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { createPageMetadata } from "@/lib/seo";
import { createWhatsappUrl } from "@/lib/whatsapp";

export const metadata = createPageMetadata("الجامعات", "استكشف الجامعات المنشورة لدى طريق الأكاديمية.", { index: true, pathname: "/universities" });

export default function UniversitiesPage() {
  return <main className="bg-[#F8FAFC]">
    <div className="border-b border-[#E7ECF2] bg-[#FAF9F6]"><Container><nav aria-label="مسار التنقل" className="py-3 text-sm text-[#52647A]"><Link href="/" className="hover:text-[#A47B2D]">الرئيسية</Link><span className="mx-2 text-[#C8A253]" aria-hidden="true">/</span><span aria-current="page" className="font-bold text-[#082B50]">الجامعات</span></nav></Container></div>
    <Container className="py-10 sm:py-14"><Suspense fallback={<div className="grid gap-7 lg:grid-cols-[18rem_minmax(0,1fr)]"><div className="hidden rounded-xl border bg-white lg:block" /><SkeletonResults kind="university" count={6} label="جارٍ تحميل الجامعات…" /></div>}><UniversitiesDirectoryLive /></Suspense><ConsultationCta className="mt-8" titleId="directory-contact-title" eyebrow="خطوتك التالية" title="هل تحتاج مساعدة في اختيار الجامعة؟" description="تواصل معنا لترتيب خياراتك الأكاديمية." backgroundImage="/images/footer/footer-skyline.png" action={<a href={createWhatsappUrl("مرحبًا، أود المساعدة في اختيار الجامعة المناسبة.")} target="_blank" rel="noreferrer" className={consultationActionClass}>تواصل عبر واتساب <ArrowLeft className="size-4" aria-hidden="true" /></a>} /></Container>
  </main>;
}
