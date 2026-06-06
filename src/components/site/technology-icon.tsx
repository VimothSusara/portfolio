import Image from "next/image";
import {
  getTechnologyIconSrc,
  type TechnologyIconSource,
} from "@/lib/technologies/icons";
import { cn } from "@/lib/utils";

type TechnologyIconProps = {
  technology: TechnologyIconSource;
  size?: number;
  className?: string;
};

export function TechnologyIcon({
  technology,
  size = 20,
  className,
}: TechnologyIconProps) {
  const src = getTechnologyIconSrc(technology);

  if (!src) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] font-semibold uppercase text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {technology.name.slice(0, 1)}
      </span>
    );
  }

  if (technology.iconUrl?.trim()) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 object-contain", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      loading="lazy"
    />
  );
}

export function TechnologyBadge({
  technology,
  className,
}: {
  technology: TechnologyIconSource;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs",
        className,
      )}
    >
      <TechnologyIcon technology={technology} size={14} />
      <span>{technology.name}</span>
    </span>
  );
}
