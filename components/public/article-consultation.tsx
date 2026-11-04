import { MessageCircle } from "lucide-react";
import { createWhatsappUrl } from "@/lib/whatsapp";
import { ConsultationCta, consultationActionClass } from "@/components/public/consultation-cta";

export function ArticleConsultation({ titleId }: { titleId: string }) {
  return <ConsultationCta variant="contextual" titleId={titleId} title="لديك سؤال حول الدراسة في الخارج؟" description="تواصل مع فريق طريق أكاديمي للحصول على إجابات سريعة وموثوقة." action={
    <a href={createWhatsappUrl("مرحباً، لدي سؤال حول الدراسة في الخارج.")} target="_blank" rel="noopener noreferrer" className={consultationActionClass}><MessageCircle className="size-5" aria-hidden="true" />تواصل عبر واتساب<span className="sr-only">(يفتح في نافذة جديدة)</span></a>
  } />;
}
