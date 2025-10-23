"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils"; // <-- make sure you have shadcn's `cn` utility

export function StatCard({ title, value, className }) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between items-center text-center rounded-2xl border border-border shadow-sm transition-colors",
        "bg-card text-card-foreground hover:bg-accent/10",
        "p-4 md:p-6 min-h-[180px]",
        className
      )}
    >
      <CardHeader className="w-full pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground text-left">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex justify-center items-center flex-1">
        <p className="text-5xl md:text-6xl font-semibold text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
