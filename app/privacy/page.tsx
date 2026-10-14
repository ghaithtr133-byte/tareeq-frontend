import { ResourceListing } from "@/components/public/resource-listing";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("الخصوصية", "سياسة الخصوصية المعتمدة لطريق الأكاديمية.", false);

export default function PrivacyPage() {
  return <ResourceListing eyebrow="الخصوصية" title="سياسة الخصوصية" intro="لا تتوفر صياغة قانونية معتمدة للنشر حالياً." unavailableTitle="سياسة الخصوصية قيد الاعتماد" />;
}
