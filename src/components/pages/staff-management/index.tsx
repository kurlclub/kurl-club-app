'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { StudioLayout } from '@/components/shared/layout';
import {
  DataTable,
  DataTableToolbar,
  TableSkeleton,
} from '@/components/shared/table';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { useSheet } from '@/hooks/use-sheet';
import { staffFilters } from '@/lib/dummy/fiters';
import { searchItems } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useGymStaffs } from '@/services/staff';
import { Staff } from '@/types/staff';

import { columns } from './columns';
import { StaffsHeader } from './staff-header';

export default function StaffManagement() {
  const { isOpen, openSheet, closeSheet } = useSheet();
  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('return');
  const isFromSetup = searchParams.get('setup') === 'true';

  const { data: gymStaffs = [], isLoading } = useGymStaffs(gymId!);

  const { items: staffs, search } = useFilterableList<Staff>(
    gymStaffs,
    searchItems
  );

  useEffect(() => {
    // If user came from setup and has staff, redirect back to return URL
    if (isFromSetup && returnUrl && gymStaffs.length > 0) {
      router.push(`${returnUrl}?setup=true`);
    }
  }, [isFromSetup, returnUrl, gymStaffs.length, router]);

  return (
    <StudioLayout
      title="Staff Management"
      headerActions={
        <StaffsHeader
          onAddNewClick={() => openSheet()}
          isOpen={isOpen}
          closeSheet={closeSheet}
        />
      }
    >
      {isLoading ? (
        <TableSkeleton rows={8} columns={6} showToolbar />
      ) : (
        <DataTable
          columns={columns}
          data={staffs}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              onSearch={search}
              filters={staffFilters}
            />
          )}
        />
      )}
    </StudioLayout>
  );
}
