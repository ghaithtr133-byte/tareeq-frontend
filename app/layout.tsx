import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteOrigin } from "@/lib/seo";
import { QueryProvider } from "@/providers/query-provider";

import "./globals.css";

const siteOrigin = getSiteOrigin();

export const metadata: Metadata = {
  title: "Tareeq Academy | طريق الأكاديمية",
  description: "منصة استشارات تعليمية للطلاب الراغبين بالدراسة في الخارج.",
  ...(siteOrigin ? { metadataBase: siteOrigin, alternates: { canonical: "/" } } : {}),
  openGraph: {
    locale: "ar",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">
        <QueryProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
