import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Globe2, Send } from "lucide-react";
import { getArticles, getCountries } from "@/api/public-content";
import { Container } from "@/components/layout/container";
import { ArticleDirectoryCard } from "@/components/public/article-directory-card";
import { ArticleDirectoryFilters } from "@/components/public/article-directory-filters";
import { ArticleDirectoryPagination } from "@/components/public/article-directory-pagination";
import { articleDirectoryHref, articleFilterValues, directoryArticleParams, editorialArticles } from "@/lib/article-directory";
import { isPublicDemoMode } from "@/lib/public-content-mode";
import type { RouteSearchParams } from "@/lib/public-search-params";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("المقالات", "مقالات ونصائح تعليمية تساعدك في رحلتك الأكاديمية والاستعداد للدراسة في الخارج.", { index: true, pathname: "/articles" });

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const params = directoryArticleParams(await searchParams);
  const values = articleFilterValues(params);
  const [articles, countries] = await Promise.allSettled([
    getArticles(params), getCountries({ limit: 50, sort: "manual" }),
  ]);
  const result = articles.status === "fulfilled" ? articles.value : null;
  if (result && params.page! > Math.max(1, result.pagination.totalPages)) redirect(articleDirectoryHref(values, Math.max(1, result.pagination.totalPages)));
  let items = result?.items ?? [];
  if (isPublicDemoMode()) {
    const { withDemoArticleDirectoryMedia } = await import("@/lib/mocks/article-directory-fixtures");
    items = withDemoArticleDirectoryMedia(items);
  }
  const editorial = editorialArticles(items);
  return <main className="bg-[#F6F8FB] pb-8 text-primary">
    <section aria-labelledby="articles-title" className="relative overflow-hidden border-b border-[#E3EAF1] bg-gradient-to-l from-white via-[#F7FAFD] to-[#EAF2F8] py-4 sm:py-5">
      <Container className="relative">
        <nav aria-label="مسار التنقل" className="mb-3 text-xs leading-6 text-muted-foreground"><ol className="flex gap-2"><li><Link href="/" className="rounded-sm hover:underline">الرئيسية</Link><span className="ms-2" aria-hidden="true">/</span></li><li aria-current="page">المقالات</li></ol></nav>
        <div className="relative z-10 max-w-2xl"><p className="mb-1 text-sm font-bold text-[#A27A35]">مقالات ونصائح</p><h1 id="articles-title" className="text-3xl font-bold leading-[1.5] text-primary sm:text-4xl">أحدث المقالات</h1><p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">اكتشف مقالاتنا التعليمية التي تساعدك في رحلتك الأكاديمية، وتقدم لك نصائح وخبرات مهمة للدراسة في الخارج.</p></div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-10 hidden h-36 w-64 items-end justify-center text-[#9AB9D0] opacity-35 lg:flex"><BookOpen className="h-28 w-40" strokeWidth={1} /><Globe2 className="absolute bottom-10 left-0 size-24" strokeWidth={1} /><span className="absolute -bottom-2 h-px w-64 bg-[#89ABC4]" /></div>
      </Container>
    </section>
    <Container className="pt-4 sm:pt-5">
      <ArticleDirectoryFilters values={values} countries={countries.status === "fulfilled" ? countries.value.items.map((country) => ({ value: country.slug, label: country.nameAr })) : []} optionError={countries.status === "rejected"}>
        <section id="article-results" aria-label="نتائج المقالات" className="scroll-mt-28 pt-4">
          {result ? <p className="mb-3 text-xs leading-6 text-muted-foreground">تم العثور على <strong className="font-bold text-[#17669C]">{result.pagination.total}</strong> مقال</p> : null}
          {!result ? <div role="alert" className="rounded-xl border border-[#DFE6ED] bg-white p-6"><h2 className="text-lg font-bold">يتعذر تحميل المقالات حالياً</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">تعذر الاتصال بمصدر المقالات المنشورة. يرجى المحاولة مرة أخرى.</p><a href={articleDirectoryHref(values, params.page)} className="mt-3 inline-flex min-h-11 items-center rounded-sm text-sm font-bold text-[#17669C]">إعادة المحاولة</a></div> : items.length ? <>
            {editorial.featured.length ? <div data-article-featured className="grid gap-5 md:grid-cols-2">{editorial.featured.map((article) => <ArticleDirectoryCard key={article.id} article={article} prominent />)}</div> : null}
            {editorial.regular.length ? <div data-article-grid className={`grid gap-5 md:grid-cols-2 xl:grid-cols-4 ${editorial.featured.length ? "mt-5" : ""}`}>{editorial.regular.map((article) => <ArticleDirectoryCard key={article.id} article={article} />)}</div> : null}
          </> : <div className="rounded-xl border border-[#DFE6ED] bg-white p-6"><h2 className="text-lg font-bold">لا توجد مقالات تطابق بحثك</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">جرّب كلمات بحث أخرى أو أزل بعض الفلاتر.</p><Link href="/articles" className="mt-3 inline-flex min-h-11 items-center rounded-sm text-sm font-bold text-[#17669C]">مسح الفلاتر</Link></div>}
          {result ? <ArticleDirectoryPagination pagination={result.pagination} values={values} /> : null}
        </section>
      </ArticleDirectoryFilters>
      <section aria-labelledby="articles-contact-title" className="relative mt-7 flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-[#274B70] bg-gradient-to-l from-[#082B50] via-[#153D60] to-[#082B50] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4"><Send className="hidden size-12 shrink-0 text-[#D3AE65] lg:block" strokeWidth={1.2} aria-hidden="true" /><div><h2 id="articles-contact-title" className="text-xl font-bold leading-8">جاهز تبدأ رحلتك الدراسية؟</h2><p className="mt-1 text-sm leading-7 text-white/80">بعد ما تعرّفت على النصائح والمعلومات، خلّينا نساعدك باختيار خطوتك الأكاديمية القادمة.</p></div></div><Link href="/contact" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-primary transition-colors hover:bg-[#D2B37D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">تواصل معنا<ArrowLeft className="size-4" aria-hidden="true" /></Link>
      </section>
    </Container>
  </main>;
}
