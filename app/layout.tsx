import type { Metadata } from "next";

import { ArticlesTicker } from "@/components/layout/articles-ticker";
import { getArticleTickerPage } from "@/lib/article-ticker-server";
import { FloatingWhatsapp } from "@/components/layout/floating-whatsapp";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { getSiteOrigin } from "@/lib/seo";
import { QueryProvider } from "@/providers/query-provider";

import "./globals.css";

const siteOrigin = getSiteOrigin();
const isDemoBuild = isPublicDemoMode();

export const metadata: Metadata = {
  title: "Tareeq Academy | طريق الأكاديمية",
  description: "منصة استشارات تعليمية للطلاب الراغبين بالدراسة في الخارج.",
  robots: isDemoBuild ? { index: false, follow: false } : undefined,
  ...(siteOrigin ? { metadataBase: siteOrigin, alternates: { canonical: "/" } } : {}),
  openGraph: {
    locale: "ar",
    type: "website",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isDemo = isPublicDemoMode();
  const articleTicker = await getArticleTickerPage().catch(() => undefined);

  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">
        <QueryProvider>
          <SiteHeader />
          {articleTicker?.items.length ? <ArticlesTicker initialPage={articleTicker} /> : null}
          {isDemo ? (
            <p className="border-b border-[#8A6428]/25 bg-[#F7F1E5] px-5 py-2 text-center text-xs font-semibold leading-5 text-[#6D4D1F]" role="status">
              محتوى تجريبي لأغراض العرض — سيتم تحديثه عند نشر البيانات الرسمية.
            </p>
          ) : null}
          {children}
          <SiteFooter />
          <FloatingWhatsapp />
        </QueryProvider>
      </body>
    </html>
  );
}
