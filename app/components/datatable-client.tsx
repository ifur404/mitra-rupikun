import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import { useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { useIsMobile } from "~/hooks/use-mobile";

export function DataTableClient({ data = [], columns = [], resposive=false }: { data: any[]; columns: ColumnDef<any>[], resposive?:boolean }) {
    const [sorting, setSorting] = useState<SortingState>([])
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        enableMultiSort: true,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(), //provide a sorting row model
    })

    const isMobile = useIsMobile()

    if (isMobile && resposive) {
        return (
            <div className="space-y-4">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <div key={row.id} className="rounded-md border p-4 shadow-sm">
                            {row.getVisibleCells().map((cell) => {
                                // 1) Find matching header
                                const matchedHeader = table
                                    .getHeaderGroups()
                                    // Flatten all header groups into a single array of headers
                                    .flatMap((hg) => hg.headers)
                                    // Find the one for this column ID
                                    .find((header) => header.column.id === cell.column.id)

                                // 2) If found, safely flexRender with header.getContext()
                                const headerLabel = matchedHeader
                                    ? flexRender(
                                        matchedHeader.column.columnDef.header,
                                        matchedHeader.getContext()
                                    )
                                    : cell.column.id // fallback

                                // 3) Cell content
                                const cellValue = flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )

                                return (
                                    <div
                                        key={cell.id}
                                        className="flex flex-col pb-2  last:pb-0 border-b border-gray-100 last:border-none"
                                    >
                                        {/* Header Label (small, subtle) */}
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                            {headerLabel}
                                        </div>
                                        {/* Actual cell value (more prominent) */}
                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                            {cellValue}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))
                ) : (
                    <p className="text-center py-4">No results.</p>
                )}
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            const isSortable = header.column.getCanSort()
                            const sortingState = header.column.getIsSorted() // 'asc' | 'desc' | false
                            return (
                                <TableHead key={header.id}
                                    className={
                                        isSortable
                                            ? "cursor-pointer select-none"
                                            : undefined
                                    }
                                    onClick={
                                        isSortable
                                            ? header.column.getToggleSortingHandler()
                                            : undefined
                                    }
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    {sortingState === "asc" && " ▲"}
                                    {sortingState === "desc" && " ▼"}
                                </TableHead>
                            )
                        })}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                        >
                            No results.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
