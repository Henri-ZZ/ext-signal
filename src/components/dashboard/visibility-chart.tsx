"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { HistoryPoint } from "@/data/extensions"
import { cn } from "@/lib/utils"

const chartConfig = {
  visibility: {
    label: "Visibility",
    color: "var(--chart-1)",
  },
  averageRank: {
    label: "Avg. rank",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const rangeOptions = [
  { value: 7, label: "7D", title: "Last 7 days" },
  { value: 14, label: "14D", title: "Last 14 days" },
  { value: 30, label: "30D", title: "Last 30 days" },
]

export function VisibilityChart({ data }: { data: HistoryPoint[] }) {
  const [range, setRange] = React.useState("30")

  const points = React.useMemo(() => {
    const days = Number(range)
    const window = data.slice(-days)

    return window.map((point) => {
      const [, month, day] = point.day.split("-")
      return {
        label: `${Number(month)}/${Number(day)}`,
        visibility: Number(point.visibility.toFixed(1)),
        averageRank:
          point.averageRank == null
            ? null
            : Number(point.averageRank.toFixed(2)),
      }
    })
  }, [data, range])

  if (data.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No collection history yet. Rankings appear after the first successful
        probe run.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-[var(--chart-1)]" />
            Visibility
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-[var(--chart-2)]" />
            Average rank
          </span>
        </div>
        <div
          role="group"
          aria-label="Chart range"
          className="flex items-center gap-0.5 rounded-lg bg-muted p-[3px]"
        >
          {rangeOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="ghost"
              size="xs"
              title={option.title}
              aria-pressed={range === String(option.value)}
              onClick={() => setRange(String(option.value))}
              className={cn(
                "font-mono text-xs text-muted-foreground",
                range === String(option.value) &&
                  "bg-background text-foreground shadow-sm hover:bg-background",
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[260px] w-full">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
          />
          <YAxis
            yAxisId="visibility"
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[0, 100]}
            tickFormatter={(value: number) => `${value}%`}
          />
          <YAxis
            yAxisId="rank"
            orientation="right"
            reversed
            tickLine={false}
            axisLine={false}
            width={36}
            domain={[0, 40]}
          />
          <ChartTooltip
            content={<ChartTooltipContent indicator="line" />}
            cursor={false}
          />
          <Line
            yAxisId="visibility"
            dataKey="visibility"
            type="monotone"
            stroke="var(--color-visibility)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="rank"
            dataKey="averageRank"
            type="monotone"
            stroke="var(--color-averageRank)"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
