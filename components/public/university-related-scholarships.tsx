"use client";

import { useState, type ReactNode } from "react";
import { BalancedCardGrid } from "@/components/ui/balanced-card-grid";

const BATCH_SIZE = 4;

export function UniversityRelatedScholarships({ cards }: { cards: ReactNode[] }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  return (
    <>
      <BalancedCardGrid className="mt-6" columns={{ sm: 2 }} gap={4}>
        {cards.slice(0, visibleCount)}
      </BalancedCardGrid>
      {visibleCount < cards.length ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + BATCH_SIZE)}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#C8A253] bg-white px-6 text-sm font-bold text-[#082B50] transition-colors hover:bg-[#F7F1E5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A253]"
          >
            عرض المزيد
          </button>
        </div>
      ) : null}
    </>
  );
}
