import type { ReactNode } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * Minimal column-config table. The shape mirrors TanStack Table's
 * `ColumnDef` closely enough that swapping the renderer later keeps the
 * existing column definitions.
 */
export type DataTableColumn<Row> = {
  id: string
  header: ReactNode
  align?: "left" | "right"
  headerClassName?: string
  cellClassName?: string
  cell: (row: Row) => ReactNode
}

type DataTableProps<Row> = {
  columns: DataTableColumn<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => string
  className?: string
}

export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  className,
}: DataTableProps<Row>) {
  return (
    <Table className={className}>
      <TableHeader className="bg-muted">
        <TableRow className="hover:bg-transparent">
          {columns.map((column, index) => (
            <TableHead
              key={column.id}
              className={cn(
                "text-xs font-medium text-muted-foreground",
                column.align === "right" && "text-right",
                index === 0 && "pl-4",
                index === columns.length - 1 && "pr-4",
                column.headerClassName,
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={getRowKey(row)}>
            {columns.map((column, index) => (
              <TableCell
                key={column.id}
                className={cn(
                  column.align === "right" && "text-right tabular-nums",
                  index === 0 && "pl-4",
                  index === columns.length - 1 && "pr-4",
                  column.cellClassName,
                )}
              >
                {column.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
