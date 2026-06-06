"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RepositoryHistorySeries } from "@/lib/queries/github-analytics";

type GithubRepositoryHistoryChartsProps = {
  series: RepositoryHistorySeries[];
  title?: string;
  description?: string;
};

function formatChartDate(value: string) {
  return format(new Date(value), "MMM d");
}

function RepositoryChart({ series }: { series: RepositoryHistorySeries }) {
  const data = series.points.map((point) => ({
    ...point,
    label: formatChartDate(point.capturedAt),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {series.ownerName}/{series.repoName}
        </CardTitle>
        <CardDescription>Stars and forks over recent syncs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={36}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={(_, payload) => {
                  const capturedAt = payload?.[0]?.payload?.capturedAt;
                  return capturedAt
                    ? format(new Date(capturedAt), "MMM d, yyyy h:mm a")
                    : "";
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="stars"
                name="Stars"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forks"
                name="Forks"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function GithubRepositoryHistoryCharts({
  series,
  title = "Repository trends",
  description = "Historical stars and forks captured during GitHub syncs.",
}: GithubRepositoryHistoryChartsProps) {
  if (series.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {series.map((item) => (
          <RepositoryChart key={item.repositoryId} series={item} />
        ))}
      </div>
    </section>
  );
}
