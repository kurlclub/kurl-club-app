'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { StudioLayout } from '@/components/shared/layout';
import { DataTable, DataTableToolbar } from '@/components/shared/table';
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
  const { items: searchedStaffs, search } = useFilterableList<Staff>(
    gymStaffs,
    searchItems
  );

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[] | undefined>
  >({});

  const onFilterChange = (columnId: string, values: string[] | undefined) => {
    setSelectedFilters((prev) => ({ ...prev, [columnId]: values }));
  };

  const onResetFilters = () => setSelectedFilters({});

  const staffs = useMemo(() => {
    return searchedStaffs.filter((s) => {
      return Object.entries(selectedFilters).every(([col, vals]) => {
        if (!vals || vals.length === 0) return true;

        const key = col as keyof Staff;
        const field = s[key];

        if (field === undefined || field === null) return false;

        return vals.some(
          (v) => String(field).toLowerCase() === String(v).toLowerCase()
        );
      });
    });
  }, [searchedStaffs, selectedFilters]);

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
      <DataTable
        columns={columns}
        data={staffs}
        isLoading={isLoading}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            onSearch={search}
            filters={staffFilters}
            onFilterChange={onFilterChange}
            selectedFilters={selectedFilters}
            onResetFilters={onResetFilters}
          />
        )}
      />
    </StudioLayout>
  );
}
