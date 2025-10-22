"use client"

import * as React from "react"

import { toSnakeCase } from "@/src/utils/texts"
import { useIsMobile } from "@/src/hooks/use-mobile"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/src/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

const itemsLabelDefault = "Item";
const itemsDefault = [
  {
    value: "backlog",
    label: "Backlog",
  },
  {
    value: "todo",
    label: "Todo",
  },
  {
    value: "in progress",
    label: "In Progress",
  },
  {
    value: "done",
    label: "Done",
  },
  {
    value: "canceled",
    label: "Canceled",
  },
]



export function ComboBox({ items = itemsDefault, itemsLabel = itemsLabelDefault }) {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const [selectedStatus, setSelectedStatus] = React.useState(
    null
  )
  const labelCleaned = toSnakeCase(itemsLabel, "combobox")

  if (!isMobile) {
    return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={labelCleaned} className="px-1">
        {itemsLabel}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            {selectedStatus ? <>{selectedStatus.label}</> : <>+ Set {itemsLabel}</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <StatusList items={items} itemsLabel={itemsLabel} setOpen={setOpen} setSelectedStatus={setSelectedStatus} />
        </PopoverContent>
      </Popover>
    </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={labelCleaned} className="px-1">
        {itemsLabel}
      </Label>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            {selectedStatus ? <>{selectedStatus.label}</> : <>+ Set {itemsLabel}</>}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <StatusList items={items} itemsLabel={itemsLabel} setOpen={setOpen} setSelectedStatus={setSelectedStatus} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function StatusList({
  items,
  itemsLabel,
  setOpen,
  setSelectedStatus,
}) {
  return (
    <Command>
        <CommandInput placeholder={`Filter ${itemsLabel}...`} />
        <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
            {items.map((item) => (
                <CommandItem
                key={item.value}
                value={item.value}
                onSelect={(value) => {
                    setSelectedStatus(
                    items.find((priority) => priority.value === value) || null
                    )
                    setOpen(false)
                }}
                >
                {item.label}
                </CommandItem>
            ))}
            </CommandGroup>
        </CommandList>
    </Command>
  )
}
