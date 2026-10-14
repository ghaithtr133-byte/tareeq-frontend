import { Container } from "@/components/layout/container";
import { ContentSection, ContentUnavailable, PageIntro } from "@/components/public/page-components";

export function ResourceListing({ eyebrow, title, intro, unavailableTitle }: { eyebrow: string; title: string; intro: string; unavailableTitle: string }) {
  return (
    <main>
      <PageIntro eyebrow={eyebrow} title={title} intro={intro} />
      <ContentSection>
        <Container className="max-w-5xl">
          <ContentUnavailable title={unavailableTitle} contact />
        </Container>
      </ContentSection>
    </main>
  );
}
