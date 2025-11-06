"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { toSnakeCase } from "@/src/utils/texts"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import { Label } from "@/src/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

const labelDefault = "Date"

export function CalendarField({ label = labelDefault, setDate = () => null }) {
  const [open, setOpen] = React.useState(false)
  const [dateInner, setDateInner] = React.useState(undefined)
  const labelCleaned = toSnakeCase(label)

  const buttonClasses =
    "w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white text-slate-900 font-medium justify-between focus:outline-none focus:ring-1 focus:ring-slate-500 hover:bg-slate-50"

  return (
    <div className="bg-white rounded-lg p-2 border border-gray-200">
      {/* Label */}
      <Label
        htmlFor={labelCleaned}
        className="text-xs font-semibold text-slate-700 mb-1 block"
      >
        {label}
      </Label>

      {/* Calendar Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            id={labelCleaned}
            className={buttonClasses}
          >
            <span>
              {dateInner ? dateInner.toLocaleDateString() : "Select date"}
            </span>
            <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500 ml-1" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 border border-gray-200 rounded-md shadow-sm"
          align="start"
        >
          <Calendar
            mode="single"
            selected={dateInner}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date)
              setDateInner(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
