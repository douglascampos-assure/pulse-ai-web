"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

export function DateRangePicker({ onChange }) {
  const [range, setRange] = useState({
    start: "",
    end: "",
  });
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    const newRange = { ...range, [field]: value };

    // 🧠 Validation: start date cannot be after end date
    if (
      newRange.start &&
      newRange.end &&
      new Date(newRange.start) > new Date(newRange.end)
    ) {
      setError("Start date cannot be after end date");
    } else {
      setError("");
      if (onChange) onChange(newRange);
    }

    setRange(newRange);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {/* Start Date */}
        <div className="relative flex flex-col">
          <label
            htmlFor="startDate"
            className="absolute -top-2 left-2 bg-white text-xs text-muted-foreground px-1"
          >
            Start Date
          </label>
          <div className="flex items-center gap-2 border-2 border-violet-500 rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-violet-500">
            <CalendarIcon className="h-4 w-4 text-violet-500" />
            <Input
              id="startDate"
              type="date"
              value={range.start}
              onChange={(e) => handleChange("start", e.target.value)}
              className={cn(
                "border-0 focus-visible:ring-0 focus:outline-none p-0 text-sm",
                "w-[130px]"
              )}
              max={range.end || undefined} // ⛔ can't pick start > end
            />
          </div>
        </div>

        {/* End Date */}
        <div className="relative flex flex-col">
          <label
            htmlFor="endDate"
            className="absolute -top-2 left-2 bg-white text-xs text-muted-foreground px-1"
          >
            End Date
          </label>
          <div className="flex items-center gap-2 border-2 border-violet-500 rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-violet-500">
            <CalendarIcon className="h-4 w-4 text-violet-500" />
            <Input
              id="endDate"
              type="date"
              value={range.end}
              onChange={(e) => handleChange("end", e.target.value)}
              className={cn(
                "border-0 focus-visible:ring-0 focus:outline-none p-0 text-sm",
                "w-[130px]"
              )}
              min={range.start || undefined}
            />
          </div>
        </div>
      </div>

      {/* ⚠️ Error Message */}
      {error && (
        <div className="flex items-center text-red-500 text-xs mt-1 gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}