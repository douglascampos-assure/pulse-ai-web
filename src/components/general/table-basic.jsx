"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

const captionDefault = "A list of your recent invoices."
const columnsDefault = [
    { label: "ID", field: "id", className: "", classNameRows: "", totalRow: true, type: "identifier" },
    { label: "Invoice", field: "invoice", className: "w-[100px]", classNameRows: "font-medium", totalRow: true, type: "text" },
    { label: "Status", field: "paymentStatus", className: "", classNameRows: "", totalRow: false, type: "text" },
    { label: "Method", field: "paymentMethod", className: "", classNameRows: "", totalRow: false, type: "text" },
    { label: "Amount", field: "totalAmount", className: "text-right", classNameRows: "text-right", totalRow: true, type: "int" },
]

const rowsDefault = [
    {
        id: 1,
        invoice: "INV001",
        paymentStatus: "Paid",
        totalAmount: "250",
        paymentMethod: "Credit Card",
    },
    {
        id: 2,
        invoice: "INV002",
        paymentStatus: "Pending",
        totalAmount: "150",
        paymentMethod: "PayPal",
    },
    {
        id: 3,
        invoice: "INV003",
        paymentStatus: "Unpaid",
        totalAmount: "350",
        paymentMethod: "Bank Transfer",
    },
    {
        id: 4,
        invoice: "INV004",
        paymentStatus: "Paid",
        totalAmount: "450",
        paymentMethod: "Credit Card",
    },
    {
        id: 5,
        invoice: "INV005",
        paymentStatus: "Paid",
        totalAmount: "550",
        paymentMethod: "PayPal",
    },
    {
        id: 6,
        invoice: "INV006",
        paymentStatus: "Pending",
        totalAmount: "200",
        paymentMethod: "Bank Transfer",
    },
    {
        id: 7,
        invoice: "INV007",
        paymentStatus: "Unpaid",
        totalAmount: "300",
        paymentMethod: "Credit Card",
    },
]

function getTotalRow(columns, rows) {
    const totalRow = {};

    for (const column of columns) {
        const { field, totalRow: includeTotal, type } = column;

        if (!includeTotal || type === "text") {
            totalRow[field] = null;
        } else if (type === "int") {
            totalRow[field] = rows.reduce((sum, row) => {
                const value = parseFloat(row[field]);
                return sum + (isNaN(value) ? 0 : value);
            }, 0);
        } else if (type === "identifier") {
            totalRow[field] = `Total (${rows.length})`;
        } else {
            totalRow[field] = null;
        }
    }

    return totalRow;
}

export function TableBasic({ caption = captionDefault, columns = columnsDefault, rows = rowsDefault, showTotal = false }) {
  const [totalRows, setTotalRows] = React.useState([])

  React.useEffect(() => {
    if (columns.length && rows.length) {
        setTotalRows(getTotalRow(columns, rows))
    }
  }, [rows, columns])

  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map(column => <TableHead key={column.field} className={column.className}>{column.label}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {columns.map(column => <TableCell key={column.field + row[column.field]} className={column.classNameRows}>{row[column.field]}</TableCell>)}
          </TableRow>
        ))}
      </TableBody>
      {showTotal && (<TableFooter>
        {totalRows.map(totalRow => (
            <TableRow>
                {columns.map(column => <TableCell key={"total" + column.field} className={column.classNameRows}>{totalRow[column.field]}</TableCell>)}
            </TableRow>
        ))}
      </TableFooter>)}
    </Table>
  )
}
