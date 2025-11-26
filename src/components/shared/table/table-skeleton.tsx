import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showToolbar?: boolean;
}

export function TableSkeleton({
  rows = 10,
  columns = 7,
  showToolbar = true,
}: TableSkeletonProps) {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Sleek Toolbar Skeleton */}
      {showToolbar && (
        <div className="flex justify-between items-center gap-y-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Skeleton className="h-10 w-50 md:w-72" />
            <Skeleton className="h-10 w-36" />
          </div>
          <Skeleton className="h-10 w-15" />
        </div>
      )}

      {/* Sleek DataTable Skeleton */}
      <div className="rounded-xl border border-primary-blue-300/50 overflow-hidden bg-gradient-to-br from-secondary-blue-500 to-secondary-blue-600 shadow-lg">
        <div className="relative">
          <div className="overflow-x-auto">
            <Table className="border-collapse [&_td]:border-0 [&_th]:border-0">
              <TableHeader className="bg-gradient-to-r from-primary-blue-400 to-primary-blue-300 [&_tr]:border-b-0">
                <TableRow>
                  <TableHead className="sticky left-0 z-20 bg-gradient-to-r from-primary-blue-400 to-primary-blue-300">
                    <Skeleton className="h-3 w-12" />
                  </TableHead>
                  <TableHead className="sticky left-[100px] z-20 bg-gradient-to-r from-primary-blue-400 to-primary-blue-300">
                    <Skeleton className="h-3 w-16" />
                  </TableHead>
                  {Array.from({ length: columns - 3 }).map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-3 w-14" />
                    </TableHead>
                  ))}
                  <TableHead className="sticky right-0 z-20 bg-gradient-to-r from-primary-blue-400 to-primary-blue-300">
                    <Skeleton className="h-3 w-12" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-b [&_tr]:border-primary-blue-400/30">
                {Array.from({ length: rows }).map((_, i) => (
                  <TableRow
                    key={i}
                    className="relative hover:bg-secondary-blue-400/30 transition-colors"
                  >
                    <TableCell className="sticky left-0 z-10 bg-gradient-to-r from-secondary-blue-500 to-secondary-blue-600">
                      <Skeleton className="h-3 w-10" />
                    </TableCell>
                    <TableCell className="sticky left-[100px] z-10 bg-gradient-to-r from-secondary-blue-500 to-secondary-blue-600">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </TableCell>
                    {Array.from({ length: columns - 3 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton
                          className={`h-3 ${
                            j === 2 ? 'w-6' : j === 3 ? 'w-16' : 'w-12'
                          }`}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="sticky right-0 z-10 bg-gradient-to-r from-secondary-blue-500 to-secondary-blue-600 p-0">
                      <div className="flex h-full items-center justify-center">
                        <Skeleton className="h-7 w-16" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Sleek Footer Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
