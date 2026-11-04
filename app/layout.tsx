import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import { Suspense } from "react";

import { AsyncArticlesTicker } from "@/components/layout/async-articles-ticker";
import { FloatingWhatsapp } from "@/components/layout/floating-whatsapp";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NativeDragGuard } from "@/components/layout/native-drag-guard";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import { getSiteOrigin } from "@/lib/seo";
import { QueryProvider } from "@/providers/query-provider";

import "./globals.css";

const almarai = Almarai({
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "800"],
  display: "swap",
  variable: "--font-almarai",
});

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

  return (
    <html lang="ar" dir="rtl" className={almarai.variable}>
      <body data-public-site="" className="font-sans antialiased">
        <NativeDragGuard />
        <QueryProvider>
          <Suspense fallback={<div aria-hidden="true" className="h-9 bg-[#082B50]" />}><AsyncArticlesTicker /></Suspense>
          <SiteHeader />
            {/* {isDemo ? (
                <p className="border-b border-[#8A6428]/25 bg-[#F7F1E5] px-5 py-2 text-center text-xs font-bold leading-5 text-[#6D4D1F]" role="status">
                  محتوى تجريبي لأغراض العرض — سيتم تحديثه عند نشر البيانات الرسمية.
                </p>
            ) : null} */}
          {children}
          <SiteFooter />
          <FloatingWhatsapp />
        </QueryProvider>
      </body>
    </html>
  );
}
