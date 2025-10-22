"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";

import { Button } from "@/src/components/ui/button";

export function DropdownFilter({ title, description, items, defaultItem, onSelectItem }) {
  const [selected, setSelected] = useState(defaultItem || items[0]);

  useEffect(() => {
    if (!selected && items.length > 0) {
      setSelected(items[0]);
    }
  }, [items, selected]);

   const handleSelect = (item) => {
    setSelected(item);
    if (onSelectItem) onSelectItem(item); // 🔥 Notify parent
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="inline-flex items-center gap-2">
          {selected ? `${title}: ${selected}` : title}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="w-56">
        <DropdownMenuLabel>{description}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((it) => (
          <DropdownMenuItem
            key={it}
            onSelect={() => handleSelect(it)}
            className={`cursor-pointer ${
              selected === it ? "bg-muted font-semibold" : ""
            }`}
          >
            {it}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}