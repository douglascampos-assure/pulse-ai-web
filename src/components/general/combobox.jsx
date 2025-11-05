"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
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

const labelDefault = "Item"
const itemsDefault = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "canceled", label: "Canceled" },
]

export function ComboBox({
  items = itemsDefault,
  label = labelDefault,
  setSelected = () => null,
}) {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const [selectedInner, setSelectedInner] = React.useState(null)
  const labelCleaned = toSnakeCase(label, "combobox")

  const buttonClasses =
    "w-full text-xs justify-between px-2 py-1.5 border border-gray-300 rounded bg-white text-slate-900 font-medium hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-500"

  if (!isMobile) {
    return (
      <div className="bg-white rounded-lg p-2 border border-gray-200">
        <Label
          htmlFor={labelCleaned}
          className="text-xs font-semibold text-slate-700 mb-1 block"
        >
          {label}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button id={labelCleaned} variant="ghost" className={buttonClasses}>
              {selectedInner ? selectedInner.label : `Select ${label}...`}
              <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-0 border border-gray-200 rounded-md shadow-sm"
            align="start"
          >
            <ItemsList
              items={items}
              label={label}
              setOpen={setOpen}
              selected={selectedInner}
              setSelected={(value) => {
                setSelectedInner(value)
                setSelected(value)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-2 border border-gray-200">
      <Label
        htmlFor={labelCleaned}
        className="text-xs font-semibold text-slate-700 mb-1 block"
      >
        {label}
      </Label>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className={buttonClasses}>
            {selectedInner ? selectedInner.label : `Select ${label}...`}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <ItemsList
              items={items}
              label={label}
              setOpen={setOpen}
              selected={selectedInner}
              setSelected={(value) => {
                setSelectedInner(value)
                setSelected(value)
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function ItemsList({ items, label, setOpen, selected, setSelected }) {
  return (
    <Command>
      <CommandInput
        placeholder={`Filter ${label}...`}
        className="text-xs px-2 py-1"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {items.map((item) => (
            <CommandItem
              key={item.value + '|' + item.label}
              value={item.value + '|' + item.label}
              onSelect={(value) => {
                const clickedItem = items.find(
                  (itemTmp) => itemTmp.value == value.split('|')[0] && itemTmp.label === value.split('|')[1]
                )
                if (selected?.value === clickedItem?.value) {
                  setSelected(null)
                } else {
                  setSelected(clickedItem || null)
                }
                setOpen(false)
              }}
              className="text-xs py-1.5"
            >
              {item.label}
              {selected?.value === item.value && (
                <span className="ml-auto text-slate-700">✓</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
