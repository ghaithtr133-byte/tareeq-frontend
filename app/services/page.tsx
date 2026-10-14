import { ResourceListing } from "@/components/public/resource-listing";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("الخدمات", "تعرف إلى الخدمات التعليمية عند نشر محتواها المعتمد.", true);

export default function ServicesPage() {
  return <ResourceListing eyebrow="الخدمات" title="خدمات تعليمية بمعلومات موثقة" intro="نقدم معلومات الخدمات التعليمية كما يعتمدها فريق طريق الأكاديمية." unavailableTitle="تفاصيل الخدمات قيد الإتاحة" />;
}
