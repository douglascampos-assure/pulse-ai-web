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

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={labelCleaned} className="px-1">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={labelCleaned}
            className="w-48 justify-between font-normal"
          >
            {dateInner ? dateInner.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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
