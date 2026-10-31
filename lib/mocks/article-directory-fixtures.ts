import type { Article } from "@/api/public-content";

/** Local, directory-only illustrations; shared Homepage/ticker/detail records stay untouched. */
export function withDemoArticleDirectoryMedia(articles: Article[]): Article[] {
  return articles.map((article) => {
    if (article.slug === "ielts-and-admission-plan") return { ...article, coverImageUrl: "/images/trust/library-globe.jpg", coverImageAltAr: "كتب وكرة أرضية في مكتبة — صورة توضيحية تجريبية" };
    if (article.slug === "quiet-study-note") return { ...article, coverImageUrl: null, coverImageAltAr: null };
    if (article.coverImageUrl?.includes("/hero/")) return { ...article, coverImageAltAr: "طالب ومعالم أكاديمية — رسم توضيحي للعرض التجريبي" };
    return article;
  });
}
