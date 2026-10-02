"use client"

import { ChevronDown } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/** Only the parts of the preview that genuinely need a client boundary. */

const chartConfig = {
  own: { label: "Edit Page", color: "var(--chart-1)" },
  competitor: { label: "Competitor A", color: "var(--chart-2)" },
} satisfies ChartConfig

const CHART_DATA = [
  { day: "1", own: 42, competitor: 51 },
  { day: "5", own: 48, competitor: 49 },
  { day: "9", own: 55, competitor: 47 },
  { day: "13", own: 61, competitor: 52 },
  { day: "17", own: 58, competitor: 50 },
  { day: "21", own: 66, competitor: 54 },
  { day: "25", own: 72, competitor: 53 },
  { day: "30", own: 74, competitor: 57 },
]

export function ChartDemo() {
  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <LineChart data={CHART_DATA} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} domain={[0, 100]} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
        <Line
          dataKey="own"
          type="monotone"
          stroke="var(--color-own)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="competitor"
          type="monotone"
          stroke="var(--color-competitor)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

export function DropdownDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Open menu
          <ChevronDown data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Account settings</DropdownMenuItem>
        <DropdownMenuItem>Workspace settings</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Open dialog
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add extension</DialogTitle>
          <DialogDescription>
            Track any public extension from the Chrome Web Store.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Add Extension</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
