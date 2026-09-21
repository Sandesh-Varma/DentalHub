import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  steps: string[];
  current: number;
};

export function Stepper({ steps, current }: Props) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            {i > 0 && (
              <div
                className={cn("h-px flex-1", done || active ? "bg-primary" : "bg-border")}
              />
            )}
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                  done && "bg-primary text-white",
                  active && "border-2 border-primary text-primary",
                  !done && !active && "border border-border text-muted"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </div>
              <span className="hidden text-[10px] text-muted sm:block">{label}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
