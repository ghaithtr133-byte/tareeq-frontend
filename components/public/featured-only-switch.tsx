import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeaturedOnlySwitch({
  id,
  label,
  checked,
  onCheckedChange,
  className,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-[#DCE4EC] bg-[#FCFDFE] px-2.5 text-xs font-bold leading-5 text-[#082B50] transition-colors hover:border-[#BAC8D5] focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-[#C8A253] sm:text-sm",
        className,
      )}
    >
      <Star
        className="size-3.5 shrink-0 text-[#A47B2D]"
        fill="currentColor"
        aria-hidden="true"
      />
      <span className="min-w-0">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative ms-0.5 h-5 w-9 shrink-0 rounded-full border border-[#C6D0DB] bg-[#E7EDF3] transition-colors duration-200 peer-checked:border-[#B68A3E] peer-checked:bg-[#C8A253] peer-focus-visible:ring-2 peer-focus-visible:ring-[#C8A253] peer-focus-visible:ring-offset-2 after:absolute after:right-0.5 after:top-1/2 after:size-4 after:-translate-y-1/2 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:-translate-x-4 motion-reduce:transition-none motion-reduce:after:transition-none"
      />
    </label>
  );
}
