import { Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TableFooterProps<TData> {
  table: Table<TData>;
  pageSizes?: number[];
}

interface PaginationProps {
  pageIndex?: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  goToPage?: (page: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  setPageIndex: (page: number) => void;
  getCanPreviousPage: () => boolean;
}

// Pagination Component
const Pagination = ({
  pageCount,
  canPreviousPage,
  canNextPage,
  previousPage,
  nextPage,
  setPageIndex,
  getCanPreviousPage,
}: PaginationProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* First Page Button */}
      <Button
        variant="outline"
        className="hidden h-8 w-8 p-0 lg:flex"
        onClick={() => setPageIndex(0)}
        disabled={!getCanPreviousPage()}
      >
        <span className="sr-only">Go to first page</span>
        <ChevronsLeft />
      </Button>

      {/* Previous Page Button */}
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={previousPage}
        disabled={!canPreviousPage}
      >
        <span className="sr-only">Go to previous page</span>
        <ChevronLeft />
      </Button>

      {/* Next Page Button */}
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={nextPage}
        disabled={!canNextPage}
      >
        <span className="sr-only">Go to next page</span>
        <ChevronRight />
      </Button>

      {/* Last Page Button */}
      <Button
        variant="outline"
        className="hidden h-8 w-8 p-0 lg:flex"
        onClick={() => setPageIndex(pageCount - 1)}
        disabled={!canNextPage}
      >
        <span className="sr-only">Go to last page</span>
        <ChevronsRight />
      </Button>
    </div>
  );
};

// TableFooter Component
export const TableFooter = <TData,>({
  table,
  pageSizes = [10, 20, 30, 40, 50],
}: TableFooterProps<TData>) => {
  return (
    <div className="flex items-center justify-between sm:px-3 flex-wrap gap-y-2">
      <div className="flex-1 text-sm text-muted-foreground text-nowrap mr-2">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      <div className="flex items-center gap-x-4 gap-y-1 w-full justify-between sm:w-fit flex-wrap">
        {/* Number of Results Section */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="shad-select-trigger h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent className="shad-select-content">
              {pageSizes.map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="shad-select-item"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center ">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>

          {/* Pagination Section */}
          <Pagination
            pageCount={table.getPageCount()}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            previousPage={table.previousPage}
            nextPage={table.nextPage}
            setPageIndex={table.setPageIndex}
            getCanPreviousPage={table.getCanPreviousPage}
          />
        </div>
      </div>
    </div>
  );
};
