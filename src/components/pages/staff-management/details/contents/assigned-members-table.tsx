'use client';

import { useState } from 'react';

import { columns } from '@/components/pages/members/table/all-members-columns';
import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { useDebounce } from '@/hooks/use-debounce';
import { filters } from '@/lib/dummy/fiters';
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setMemberFilters((prev) => ({ ...prev, page: 1 }));
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
          filters={filters}
        />
      )}
    />
  );
}
