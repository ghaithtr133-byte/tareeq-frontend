import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-10 xl:px-12 2xl:max-w-[100rem]", className)} {...props} />;
}
