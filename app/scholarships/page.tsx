import { ResourceListing } from "@/components/public/resource-listing";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("المنح الدراسية", "تصفح المنح المنشورة عند توفر بياناتها المعتمدة.", false);

export default function ScholarshipsPage() {
  return <ResourceListing eyebrow="المنح الدراسية" title="فرص تمويل تُعرض بوضوح" intro="لا تتوفر حقول أو سجلات منح موثقة حاليًا، لذلك لا نعرض مرشحات أو معلومات غير معتمدة." unavailableTitle="لا توجد منح منشورة حاليًا" />;
}
