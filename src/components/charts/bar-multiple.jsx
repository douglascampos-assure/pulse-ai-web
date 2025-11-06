"use client"

import { Bar, BarChart, CartesianGrid, XAxis, Legend } from "recharts"

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

export const description = "A dynamic multiple bar chart"

export function BarMultiple({
  title = "Highlighted Features",
  description = "Kudos",
  chartConfig = {},
  chartData = [],
  labelKey = "label",
}) {
  // Dynamically detect which fields to chart (exclude non-numeric or known text keys)
  const numericKeys = chartData.length
    ? Object.keys(chartData[0]).filter(
        (key) => key !== labelKey && key !== "text" && key !== "fill"
      )
    : []

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[380px]">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={labelKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                typeof value === "string" ? value.slice(0, 10) : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />

            {/* Dynamically render bars based on numeric keys */}
            {numericKeys.map((key, index) => {
              const color =
                chartConfig[key]?.color || `var(--chart-${(index % 9) + 1})`
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={color}
                  radius={4}
                  name={chartConfig[key]?.label || key}
                />
              )
            })}

            {/* Optional legend */}
            <Legend />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
