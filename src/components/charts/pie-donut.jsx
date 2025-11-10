"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts" 

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

export const description = "A donut chart with text"

const chartDataDefault = [
  { text: "chrome", amount: 275, fill: "var(--color-chrome)" },
  { text: "safari", amount: 200, fill: "var(--color-safari)" },
  { text: "firefox", amount: 287, fill: "var(--color-firefox)" },
  { text: "edge", amount: 173, fill: "var(--color-edge)" },
  { text: "other", amount: 190, fill: "var(--color-other)" },
]

const chartConfigDefault = {
  amount: {
    label: "Amount",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
}

const titleDefault = "Highlighted Features"
const descriptionDefault = "Kudos"
const centerTextDefault = "Amount"

export function PieDonut({ title = titleDefault, description = descriptionDefault, centerText = centerTextDefault, chartConfig = chartConfigDefault, chartData = chartDataDefault }) {
  const totalData = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 flex flex-row items-center justify-center gap-6"> 
        
        <ChartContainer
          config={chartConfig}
          className="aspect-square w-full max-w-[250px] flex-shrink-0"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="text"
              innerRadius={60}
              strokeWidth={5}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {(percent * 100).toFixed(0)}%
                  </text>
                );
              }}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalData.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {centerText}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-col gap-2 text-sm">
          {chartData.map((item) => {
            const label = chartConfig[item.text]?.label || item.text;
            const color = chartConfig[item.text]?.color || item.fill;
            
            return (
              <div
                key={item.text}
                className="flex items-center gap-2"
              >
                <span
                  className="flex h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <div className="flex flex-1 justify-between leading-none">
                  <span className="font-medium text-foreground">
                    {label}
                  </span>
                  <span className="ml-4 font-medium text-foreground">
                    {item.amount}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

      </CardContent>
    </Card>
  )
}