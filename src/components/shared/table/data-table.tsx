'use client';

import * as React from 'react';

import {
  ColumnDef,
  HeaderContext,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { TableFooter } from '@/components/shared/table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData extends object, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialSorting?: SortingState;
  toolbar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
}

export function DataTable<TData extends object, TValue>({
  columns,
  data,
  initialSorting = [],
  toolbar,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const lastColumn = columns[columns.length - 1];
  const isActionsColumn =
    lastColumn && 'id' in lastColumn && lastColumn.id === 'actions';

  return (
    <div className="space-y-4">
      {toolbar && toolbar(table)}

      <div className="rounded-md border overflow-hidden border-primary-blue-300 bg-card">
        <div className="relative">
          <div className="overflow-x-auto">
            <Table className="border-collapse [&_td]:border-0 [&_th]:border-0 bg-secondary-blue-500">
              <TableHeader className="bg-primary-blue-400 [&_tr]:border-b-0">
                <TableRow>
                  {/* Fixed Columns */}
                  <TableHead className="sm:sticky left-0 z-20 bg-primary-blue-400">
                    {flexRender(
                      columns[0].header,
                      table
                        .getHeaderGroups()[0]
                        .headers[0].getContext() as HeaderContext<TData, TValue>
                    )}
                  </TableHead>
                  <TableHead className="sm:sticky left-[96px] z-20 bg-primary-blue-400">
                    {flexRender(
                      columns[1].header,
                      table
                        .getHeaderGroups()[0]
                        .headers[1].getContext() as HeaderContext<TData, TValue>
                    )}
                  </TableHead>
                  {/* Scrollable Columns */}
                  {table
                    .getHeaderGroups()[0]
                    .headers.slice(2, -1)
                    .map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  {/* Last Column */}
                  <TableHead
                    className={
                      isActionsColumn
                        ? 'sm:sticky right-0 z-20 bg-primary-blue-400'
                        : ''
                    }
                  >
                    {flexRender(
                      table.getHeaderGroups()[0].headers.slice(-1)[0].column
                        .columnDef.header,
                      table
                        .getHeaderGroups()[0]
                        .headers.slice(-1)[0]
                        .getContext()
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-b [&_tr]:border-primary-blue-400">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={
                        (row.original as TData & { uuid?: string }).uuid ||
                        row.id
                      }
                      className="relative"
                    >
                      {/* Fixed Columns */}
                      <TableCell className="sm:sticky left-0 z-10 bg-secondary-blue-500">
                        {flexRender(
                          row.getVisibleCells()[0].column.columnDef.cell,
                          row.getVisibleCells()[0].getContext()
                        )}
                      </TableCell>
                      <TableCell className="sm:sticky left-[96px] z-10 bg-secondary-blue-500">
                        {flexRender(
                          row.getVisibleCells()[1].column.columnDef.cell,
                          row.getVisibleCells()[1].getContext()
                        )}
                      </TableCell>
                      {/* Scrollable Columns */}
                      {row
                        .getVisibleCells()
                        .slice(2, -1)
                        .map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      {/* Last Column */}
                      <TableCell
                        className={
                          isActionsColumn
                            ? 'sm:sticky right-0 z-10 bg-secondary-blue-500 p-0'
                            : ''
                        }
                      >
                        <div
                          className={
                            isActionsColumn
                              ? 'flex h-full items-center justify-center'
                              : ''
                          }
                        >
                          {flexRender(
                            row.getVisibleCells().slice(-1)[0].column.columnDef
                              .cell,
                            row.getVisibleCells().slice(-1)[0].getContext()
                          )}
                        </div>
                      </TableCell>
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
          </div>
        </div>
      </div>

      {/* Table Footers */}
      <TableFooter table={table} />
    </div>
  );
}
