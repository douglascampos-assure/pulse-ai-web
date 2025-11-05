"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart"

export const description = "A dynamic bar chart with labels"

export function BarLabel({
  title = "Highlighted Features",
  description = "Kudos",
  chartData = [],
  chartConfig = {},
  labelKey = "month",
  valueKey = "desktop",
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[380px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={labelKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                typeof value === "string" ? value.slice(0, 6) : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey={valueKey} radius={8}>
              {/* Dynamically apply colors */}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill || "var(--chart-1)"} />
              ))}

              <LabelList
                dataKey={valueKey}
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
