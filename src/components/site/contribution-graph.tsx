"use client";

import type { ContributionCalendar } from "@/lib/github/types";
import { cn } from "@/lib/utils";

type ContributionGraphProps = {
  calendar: ContributionCalendar;
  className?: string;
};

const LEVEL_CLASSES = [
  "bg-[#ebedf0] dark:bg-[#161b22]",
  "bg-[#9be9a8] dark:bg-[#0e4429]",
  "bg-[#40c463] dark:bg-[#006d32]",
  "bg-[#30a14e] dark:bg-[#26a641]",
  "bg-[#216e39] dark:bg-[#39d353]",
];

function levelClass(count: number) {
  if (count === 0) return LEVEL_CLASSES[0];
  if (count <= 3) return LEVEL_CLASSES[1];
  if (count <= 6) return LEVEL_CLASSES[2];
  if (count <= 9) return LEVEL_CLASSES[3];
  return LEVEL_CLASSES[4];
}

export function ContributionGraph({
  calendar,
  className,
}: ContributionGraphProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {calendar.totalContributions.toLocaleString()}
          </span>{" "}
          contributions in the last year
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {calendar.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.contributionDays.map((day) => (
                <div
                  key={day.date}
                  title={`${day.contributionCount} contribution${
                    day.contributionCount === 1 ? "" : "s"
                  } on ${day.date}`}
                  className={cn(
                    "size-3 rounded-[2px] sm:size-3.5",
                    !day.color && levelClass(day.contributionCount),
                  )}
                  style={day.color ? { backgroundColor: day.color } : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {LEVEL_CLASSES.map((level) => (
            <div
              key={level}
              className={cn("size-3 rounded-[2px] sm:size-3.5", level)}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
