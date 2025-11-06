"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";

// Ejemplo de datos por defecto
const defaultData = [
  { month: "Jul", performance: 72 },
  { month: "Aug", performance: 80 },
  { month: "Sep", performance: 77 },
  { month: "Oct", performance: 90 },
];

// Config default (para que se mantenga tu estructura)
const defaultConfig = {
  dataKey: "performance",
  xKey: "month",
  color: "var(--chart-1)",
  label: "Performance",
};

export function LinePerformanceChart({
  title = "Performance Over Time",
  description = "Team Metrics",
  chartData = defaultData,
  chartConfig = defaultConfig,
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 h-[90%]">
        <ChartContainer config={chartConfig} className="mx-auto w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey={chartConfig.xKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={<ChartTooltipContent labelKey={chartConfig.xKey} />}
              />
              <Line
                type="monotone"
                dataKey={chartConfig.dataKey}
                stroke={chartConfig.color}
                strokeWidth={3}
                dot={{ r: 4, fill: chartConfig.color }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
