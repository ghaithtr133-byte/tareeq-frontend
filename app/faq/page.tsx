import { ResourceListing } from "@/components/public/resource-listing";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("الأسئلة الشائعة", "الأسئلة الشائعة المعتمدة من طريق الأكاديمية.", false);

export default function FaqPage() {
  return <ResourceListing eyebrow="الأسئلة الشائعة" title="إجابات موثقة عند نشرها" intro="لن ننشر إجابات أو إرشادات قبل اعتمادها، لذلك لا تتوفر أسئلة شائعة حالياً." unavailableTitle="لا توجد أسئلة شائعة منشورة حاليًا" />;
}
