'use client';

import * as React from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PaymentTableProps<T extends object, TValue> {
  columns: ColumnDef<T, TValue>[];
  data: T[];
  toolbar?: (table: ReturnType<typeof useReactTable<T>>) => React.ReactNode;
}

export function PaymentTable<T extends object, TValue>({
  columns,
  data,
  toolbar,
}: PaymentTableProps<T, TValue>) {
  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      {toolbar && toolbar(table)}

      <div className="rounded-md overflow-hidden bg-card">
        <div className="relative">
          <div className="overflow-x-auto">
            <div className="max-h-[230px] overflow-y-auto">
              <Table className="border-collapse [&_td]:border-0 [&_th]:border-0 bg-secondary-blue-500 w-full">
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-primary-blue-300">
                    {table.getHeaderGroups()[0].headers.map((header) => (
                      <TableHead
                        className="h-fit p-0 pb-3 text-sm text-primary-blue-100"
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-b [&_tr]:border-primary-blue-300">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell className="px-0" key={cell.id}>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
