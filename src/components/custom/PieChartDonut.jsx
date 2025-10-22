"use client";

import { TrendingUp } from "lucide-react";
import "@/src/app/globals.css";
import { Pie, PieChart, Cell } from "recharts";

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

export const description = "A donut chart";

function resolveColor(colorVar) {
  if (!colorVar) return "#000"; // fallback
  if (!colorVar.startsWith("var(")) return colorVar;
  const varName = colorVar.slice(4, -1).trim(); // extract --chart-2
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || "#000";
}

export function PieChartDonut({
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
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={60}
            >
                {chartData.map((entry, index) => {
                    // Try from chartConfig first, fallback to chartData.fill
                    const colorVar =
                    chartConfig?.[entry[nameKey]]?.color || entry.fill;
                    const resolved = resolveColor(colorVar);

                    console.log(entry[nameKey], "→", colorVar, "→", resolved);

                    return <Cell key={`cell-${index}`} fill={resolved} />;
                })}
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
