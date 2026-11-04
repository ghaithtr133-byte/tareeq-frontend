// Content-driven minimums, not fixed heights: long titles, facts and actions may grow.
// Opt in only on inner-page heroes; the approved Homepage hero is independent.
const minimum = "md:min-h-[12.5rem] xl:min-h-[14.5rem]";
export const innerPageHero = {
  minimum,
  content: `relative flex min-w-0 flex-col justify-center py-4 ${minimum}`,
  title: "min-w-0 text-2xl font-bold leading-[1.4] text-[#082B50] [overflow-wrap:anywhere] sm:text-3xl",
  breadcrumb: "mb-2 text-xs leading-6 text-[#52647A] sm:text-sm",
  panel: "min-w-0 p-4 md:p-5",
  // Editorial headers remain inside the existing reading column, with no forced height.
  reading: "min-w-0 pb-1",
} as const;
