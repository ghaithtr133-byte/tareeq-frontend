import { ResourceListing } from "@/components/public/resource-listing";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("الشروط والأحكام", "الشروط والأحكام المعتمدة لطريق الأكاديمية.", false);

export default function TermsPage() {
  return <ResourceListing eyebrow="الشروط والأحكام" title="الشروط والأحكام" intro="لا تتوفر صياغة قانونية معتمدة للنشر حالياً." unavailableTitle="الشروط والأحكام قيد الاعتماد" />;
}
