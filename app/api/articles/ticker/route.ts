import { NextResponse, type NextRequest } from "next/server";

import { tickerPage } from "@/lib/article-ticker";
import { getArticleTickerPage } from "@/lib/article-ticker-server";

export const dynamic = "force-dynamic";

/** Internal progressive-loading adapter; it does not add or proxy a Backend contract. */
export async function GET(request: NextRequest) {
  try {
    const page = tickerPage(request.nextUrl.searchParams.get("page"));
    const result = await getArticleTickerPage(page);
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ message: "Article ticker content is unavailable." }, { status: 503 });
  }
}
