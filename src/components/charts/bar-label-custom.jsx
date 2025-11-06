"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Cell } from "recharts"
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


export function BarLabelCustom({
  title = "Highlighted Features",
  description = "Kudos",
  chartData = [],
  chartConfig = {},
  labelKey = "label",
  valueKey = "overall_score"
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
            layout="vertical"
            margin={{ right: 16 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey={labelKey}
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
              hide
            />
            <XAxis type="number" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            <Bar
              dataKey={valueKey}
              layout="vertical"
              radius={4}
            >
              {/* Dynamically color bars */}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}

              <LabelList
                dataKey={labelKey}
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey={valueKey}
                position="right"
                offset={8}
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
