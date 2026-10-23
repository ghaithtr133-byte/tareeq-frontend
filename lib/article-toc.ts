export type ArticleHeadingBlock = {
  type: "heading2" | "heading3" | string;
  text: string;
};

export type ArticleTocItem = {
  blockIndex: number;
  id: string;
  level: 2 | 3;
  text: string;
};

function headingBaseId(text: string) {
  const normalized = text
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .toLocaleLowerCase("ar")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "section";
}

/**
 * Derives stable, document-local anchors from the existing structured article
 * blocks. The source API contract remains untouched.
 */
export function buildArticleToc(blocks: readonly ArticleHeadingBlock[]): ArticleTocItem[] {
  const occurrences = new Map<string, number>();

  return blocks.flatMap((block, blockIndex) => {
    if (block.type !== "heading2" && block.type !== "heading3") return [];

    const base = headingBaseId(block.text);
    const count = (occurrences.get(base) ?? 0) + 1;
    occurrences.set(base, count);

    return [{
      blockIndex,
      id: count === 1 ? `article-${base}` : `article-${base}-${count}`,
      level: block.type === "heading2" ? 2 : 3,
      text: block.text,
    }];
  });
}
