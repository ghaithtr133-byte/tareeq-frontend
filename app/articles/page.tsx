import { ResourceListing } from "@/components/public/resource-listing";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("المقالات", "المقالات التعليمية المنشورة من طريق الأكاديمية.", false);

export default function ArticlesPage() {
  return <ResourceListing eyebrow="المقالات" title="قراءة تعليمية هادئة ومفيدة" intro="ستظهر المقالات بعد توفر المحتوى التحريري المنشور والمعتمد." unavailableTitle="لا توجد مقالات منشورة حاليًا" />;
}
