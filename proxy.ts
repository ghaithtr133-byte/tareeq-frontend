import { NextResponse, type NextRequest } from "next/server";

import { isDemoDetailSlug } from "@/lib/mocks/public-demo-routes";
import { isPublicDemoMode } from "@/lib/public-content-mode";

const detailRoutes: ReadonlyArray<readonly [RegExp, string]> = [
  [/^\/study-abroad\/([^/]+)$/, "countries"],
  [/^\/universities\/([^/]+)$/, "universities"],
  [/^\/scholarships\/([^/]+)$/, "scholarships"],
  [/^\/services\/([^/]+)$/, "services"],
  [/^\/articles\/([^/]+)$/, "articles"],
];

function findDetailRoute(pathname: string) {
  for (const [pattern, collection] of detailRoutes) {
    const match = pathname.match(pattern);
    if (match) return { collection, slug: match[1] };
  }
}

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  const detailRoute = findDetailRoute(request.nextUrl.pathname);
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!detailRoute) return NextResponse.next();

  if (isPublicDemoMode()) {
    return isDemoDetailSlug(detailRoute.collection, detailRoute.slug)
      ? NextResponse.next()
      : NextResponse.rewrite(new URL("/_content-not-found", request.url), { status: 404 });
  }

  if (!baseUrl) return NextResponse.next();

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/v1/${detailRoute.collection}/${encodeURIComponent(detailRoute.slug)}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );

    if (response.status === 404) {
      return NextResponse.rewrite(new URL("/_content-not-found", request.url), { status: 404 });
    }
  } catch {
    // Let the page render its existing API-unavailable state for temporary failures.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/study-abroad/:slug", "/universities/:slug", "/scholarships/:slug", "/services/:slug", "/articles/:slug"],
};
