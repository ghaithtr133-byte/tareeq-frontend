import { ResourceListing } from "@/components/public/resource-listing";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("الجامعات", "استكشف الجامعات عند نشر بياناتها المعتمدة.", { pathname: "/universities" });

export default function UniversitiesPage() {
  return <ResourceListing eyebrow="الجامعات" title="اكتشف الجامعات" intro="ستتوفر بيانات الجامعات ومعلوماتها عند نشرها من المصدر المعتمد." unavailableTitle="لا توجد جامعات منشورة حاليًا" />;
}
