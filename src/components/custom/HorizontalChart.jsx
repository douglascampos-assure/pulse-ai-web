"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";

export const description = "A bar chart with a custom label";

export function HorizontalChart({
    chartData,
    chartConfig,
    dataKey,
    nameKey,
    cardTitle,
    cardDescription,
    footerMessage,
    footerMessage2,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey={nameKey}
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey={dataKey} type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey={dataKey}
              layout="vertical"
              fill="var(--color-desktop)"
              radius={4}
            >
            {chartData.map((entry, index) => {
                const name = entry[nameKey];
                console.log("chart config:::: ", chartConfig)
                const color = chartConfig[name]?.color || "var(--chart-1)";
                return <Cell key={`cell-${index}`} fill={color} />;
            })}
              <LabelList
                dataKey={nameKey}
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
                style={{ fill: "#ffffff" }}
              />
              <LabelList
                dataKey={dataKey}
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {footerMessage}
        </div>
        <div className="text-muted-foreground leading-none">
          {footerMessage2}
        </div>
      </CardFooter>
    </Card>
  );
}
