import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  label?: string;
  className?: string;
};

export function PageLoader({
  label = "Loading...",
  className,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4",
        className,
      )}
    >
      <div className="relative flex size-12 items-center justify-center">
        {/* <span className="absolute inset-0 animate-ping rounded-full border border-primary/30 opacity-40 motion-reduce:animate-none" /> */}
        <LoaderIcon
          role="status"
          aria-label="Loading"
          className={cn("size-5 animate-spin", className)}
        />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
