"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBrowserArticles, getBrowserCountries } from "@/lib/api-client/public-content-browser";
import { ArticleDirectoryCard } from "@/components/public/article-directory-card";
import { ArticleDirectoryFilters } from "@/components/public/article-directory-filters";
import { ArticleDirectoryPagination } from "@/components/public/article-directory-pagination";
import { SkeletonResults } from "@/components/public/content-skeletons";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";
import { EmptyState, ErrorState } from "@/components/ui/content-state";
import { articleDirectoryHref, articleFilterValues, directoryArticleParams, editorialArticles } from "@/lib/article-directory";
import { parseArticleCountries, parseArticleDirectory } from "@/lib/article-directory-live";
import { publicDemoContent } from "@/lib/mocks/public-demo-content";
import { withDemoArticleDirectoryMedia } from "@/lib/mocks/article-directory-fixtures";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import type { RouteSearchParams } from "@/lib/public-search-params";

const rawParams = (params: ReadonlyURLSearchParams): RouteSearchParams => Object.fromEntries(params.entries());
export function ArticlesDirectoryLive() {
  const searchParams = useSearchParams(), router = useRouter(), demo = isPublicDemoMode();
  const params = directoryArticleParams(rawParams(searchParams)), values = articleFilterValues(params);
  const articles = useQuery({ queryKey: ["articles-directory", params], retry: 1, queryFn: async () => { const data = await getBrowserArticles(params); return demo ? data : parseArticleDirectory(data, params.page ?? 1, publicDemoContent.articles); } });
  const countries = useQuery({ queryKey: ["articles-countries"], retry: 1, queryFn: async () => { const data = await getBrowserCountries({ limit: 50, sort: "manual" }); return demo ? data : parseArticleCountries(data); } });
  const result = articles.data;
  useEffect(() => { if (result && (params.page ?? 1) > Math.max(1, result.pagination.totalPages)) router.replace(articleDirectoryHref(values, Math.max(1, result.pagination.totalPages)), { scroll: false }); }, [params.page, result, router, values]);
  const items = result ? demo ? withDemoArticleDirectoryMedia(result.items) : result.items : [];
  const editorial = editorialArticles(items, !demo), filtered = Object.values(values).some(Boolean);
  return <ArticleDirectoryFilters values={values} countries={(countries.data?.items ?? []).map((country) => ({ value: country.slug, label: country.nameAr }))} optionError={countries.isError} optionLimited={!!countries.data && countries.data.pagination.total > countries.data.items.length}>
    <section id="article-results" aria-label="نتائج المقالات" className="scroll-mt-28 pt-2">
      {articles.isPending ? <SkeletonResults kind="article" label="جارٍ تحميل المقالات…" /> : articles.isError ? <ErrorState title="يتعذر تحميل المقالات حالياً" description="حدثت مشكلة أثناء جلب المقالات المنشورة. يرجى المحاولة مجدداً." retrying={articles.isFetching} onRetry={() => { void articles.refetch(); }} /> : <>
        <p className="mb-2 text-right text-sm leading-6 text-muted-foreground" role="status">تم العثور على <strong className="font-bold text-[#17669C]">{result?.pagination.total ?? 0}</strong> مقال</p>
        {items.length ? <>{editorial.featured.length ? <BalancedCardGrid data-article-featured columns={{ md: 2 }}>{editorial.featured.map((article) => <ArticleDirectoryCard key={article.id} article={article} prominent live={!demo} />)}</BalancedCardGrid> : null}{editorial.regular.length ? <BalancedCardGrid data-article-grid columns={{ md: 2, xl: 4 }} className={editorial.featured.length ? "mt-5" : ""}>{editorial.regular.map((article) => <ArticleDirectoryCard key={article.id} article={article} live={!demo} />)}</BalancedCardGrid> : null}</> : <EmptyState title={filtered ? "لا توجد مقالات تطابق بحثك" : "لا توجد مقالات منشورة حالياً"} description={filtered ? "جرّب كلمات بحث أخرى أو أزل بعض الفلاتر." : "ستظهر المقالات هنا عند نشرها."} action={filtered ? <Link href="/articles">مسح الفلاتر</Link> : undefined} />}
        {result ? <ArticleDirectoryPagination pagination={result.pagination} values={values} /> : null}
      </>}
    </section>
  </ArticleDirectoryFilters>;
}
