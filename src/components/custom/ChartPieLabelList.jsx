"use client";

import { TrendingUp } from "lucide-react";
import { LabelList, Pie, PieChart, Cell } from "recharts";

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

export const description = "A pie chart with a label list";


export function ChartPieLabelList({
  chartData = [],
  chartConfig = {},
  dataKey,
  nameKey,
  cardTitle,
  cardDescription,
  footerMessage,
  footerMessage2
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[1000px] max-w-[600px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey={dataKey} hideLabel />}
            />
            <Pie data={chartData} dataKey={dataKey} outerRadius={100}>
              {chartData.map((entry, index) => {
                const name = entry[nameKey];
                const color = chartConfig[name]?.color || "var(--chart-1)";
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
              <LabelList
                dataKey={nameKey}
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value) => chartConfig[value]?.label}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {footerMessage}
        </div>
        <div className="text-muted-foreground leading-none">
          {footerMessage2}
        </div>
      </CardFooter>
    </Card>
  );
}