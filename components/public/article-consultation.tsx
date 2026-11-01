import { GraduationCap, MessageCircle } from "lucide-react";
import { createWhatsappUrl } from "@/lib/whatsapp";

export function ArticleConsultation() {
  return <section aria-label="استشارة عبر واتساب" className="relative overflow-hidden rounded-2xl border border-[#284969] bg-gradient-to-br from-[#082A49] via-[#082B50] to-[#173F61] px-4 py-6 text-center text-white shadow-sm">
    <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full border border-accent/40 text-[#DCB66B]"><GraduationCap className="size-9" strokeWidth={1.2} aria-hidden="true" /></span>
    <h2 className="text-lg font-bold leading-8">لديك سؤال حول الدراسة في الخارج؟</h2>
    <p className="mt-3 text-sm leading-7 text-white/80">تواصل مع فريق طريق أكاديمي للحصول على إجابات سريعة وموثوقة.</p>
    <a href={createWhatsappUrl("مرحباً، لدي سؤال حول الدراسة في الخارج.")} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#D6B16A] px-3 py-2 text-sm font-bold text-[#082B50] transition-colors hover:bg-[#E3C489] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"><MessageCircle className="size-5 shrink-0" aria-hidden="true" />تواصل عبر واتساب<span className="sr-only">(يفتح في نافذة جديدة)</span></a>
  </section>;
}
