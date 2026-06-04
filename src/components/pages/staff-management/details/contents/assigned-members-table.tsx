'use client';

import { useState } from 'react';

import { columns } from '@/components/pages/members/table/all-members-columns';
import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { useDebounce } from '@/hooks/use-debounce';
import { FilterConfig } from '@/lib/filters';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { MemberFilters, useTrainerAssignedMembers } from '@/services/member';

interface AssignedMembersTableProps {
  trainerId: string;
}

export default function AssignedMembersTable({
  trainerId,
}: AssignedMembersTableProps) {
  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId;
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [memberFilters, setMemberFilters] = useState<MemberFilters>({
    page: 1,
    pageSize: 10,
    sortOrder: 'desc',
  });
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[] | undefined>
  >({});

  const { data, isLoading } = useTrainerAssignedMembers(
    gymId!,
    parseInt(trainerId),
    {
      ...memberFilters,
      search: debouncedSearch || undefined,
    }
  );

  const assignedMembers = data?.data || [];
  const totalCount = data?.pagination?.totalCount || 0;
  const availableFilters = data?.availableFilters;

  const dynamicFilters: FilterConfig[] = [
    {
      columnId: 'package',
      title: 'Package',
      options:
        availableFilters?.packages?.map((pkg) => ({
          label: pkg.label,
          value: pkg.value,
          count: pkg.count,
        })) || [],
    },
    {
      columnId: 'feeStatus',
      title: 'Fee Status',
      options:
        availableFilters?.feeStatuses?.map((status) => ({
          label: status.value
            .replace('_', ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
          value: status.value,
          count: status.count,
        })) || [],
    },
    {
      columnId: 'gender',
      title: 'Gender',
      options:
        availableFilters?.genders?.map((gender) => ({
          label: gender.value.charAt(0).toUpperCase() + gender.value.slice(1),
          value: gender.value,
          count: gender.count,
        })) || [],
    },
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setMemberFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (
    columnId: string,
    values: string[] | undefined
  ) => {
    setSelectedFilters((prev) => ({ ...prev, [columnId]: values }));
    setMemberFilters((prev) => ({
      ...prev,
      [columnId]: values?.join(',') || undefined,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    setMemberFilters((prev) => ({
      page: 1,
      pageSize: prev.pageSize,
      sortOrder: prev.sortOrder,
    }));
  };

  return (
    <DataTable
      columns={columns}
      data={assignedMembers}
      totalCount={totalCount}
      pageSize={memberFilters.pageSize!}
      currentPage={memberFilters.page!}
      onPageChange={(page) => setMemberFilters((prev) => ({ ...prev, page }))}
      onPageSizeChange={(pageSize) =>
        setMemberFilters((prev) => ({ ...prev, pageSize, page: 1 }))
      }
      isLoading={isLoading}
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          onSearch={handleSearch}
          searchValue={searchTerm}
          filters={dynamicFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          selectedFilters={selectedFilters}
        />
      )}
    />
  );
}
