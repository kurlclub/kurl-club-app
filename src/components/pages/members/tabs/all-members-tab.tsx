import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { ImportCSVModal } from '@/components/shared/table/import-csv-modal';
import { useDebounce } from '@/hooks/use-debounce';
import { FilterConfig } from '@/lib/filters';
import {
  MemberFilters,
  bulkImportMembers,
  useGymMembers,
} from '@/services/member';
import { Member } from '@/types/members';

import { columns } from '../table/all-members-columns';

type AllMembersTabProps = {
  gymId?: number;
  isImportModalOpen: boolean;
  onCloseImportModal: () => void;
};

export function AllMembersTab({
  gymId,
  isImportModalOpen,
  onCloseImportModal,
}: AllMembersTabProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedFilters, setSelectedFilters] = useState<{
    feeStatus?: string[];
    package?: string[];
    gender?: string[];
  }>({});
  const [memberFilters, setMemberFilters] = useState<MemberFilters>({
    page: 1,
    pageSize: 10,
    sortOrder: 'desc',
  });

  const { data, isFetching } = useGymMembers(gymId!, {
    ...memberFilters,
    search: debouncedSearch || undefined,
  });

  // Fetch all available filters without any filters applied
  const { data: filtersData } = useGymMembers(gymId!, {
    page: 1,
    pageSize: 1,
  });

  const gymMembers = data?.data || [];
  const totalCount = data?.pagination?.totalCount || 0;
  const availableFilters =
    filtersData?.availableFilters || data?.availableFilters;

  const dynamicFilters: FilterConfig[] = [
    {
      columnId: 'package',
      title: 'Package',
      options:
        availableFilters?.packages.map((pkg) => ({
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
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
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
    setSelectedFilters((prev) => ({
      ...prev,
      [columnId]: values,
    }));

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

  const requiredFields = [
    'name',
    'package',
    'email',
    'phone',
    'feeStatus',
    'address',
    'bloodGroup',
    'dob',
    'gender',
  ];

  const memberTransformations = (row: Partial<Member>): Partial<Member> => {
    const { ...memberData } = row;
    return {
      ...memberData,
      gymId: gymId?.toString(),
      avatar: row.avatar || '/placeholder.svg?height=32&width=32',
      package: row.package || 'Monthly',
      feeStatus: row.feeStatus
        ? ((['paid', 'unpaid', 'partially_paid'].includes(
            row.feeStatus.toLowerCase()
          )
            ? row.feeStatus.toLowerCase().replace(/\s/g, '_')
            : 'unpaid') as 'paid' | 'partially_paid' | 'unpaid')
        : 'unpaid',
    };
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={gymMembers}
        totalCount={totalCount}
        pageSize={memberFilters.pageSize!}
        currentPage={memberFilters.page!}
        onPageChange={(page) => setMemberFilters((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) =>
          setMemberFilters((prev) => ({ ...prev, pageSize, page: 1 }))
        }
        isLoading={isFetching}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            onSearch={handleSearch}
            searchValue={searchTerm}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            selectedFilters={selectedFilters}
            filters={dynamicFilters}
          />
        )}
      />

      <ImportCSVModal<Member>
        isOpen={isImportModalOpen}
        onClose={onCloseImportModal}
        onImport={async (items) => {
          const result = await bulkImportMembers(items);
          if (result.success) {
            await queryClient.invalidateQueries({
              queryKey: ['gymMembers'],
            });
          } else {
            throw new Error(result.error);
          }
        }}
        requiredFields={requiredFields}
        transformations={memberTransformations}
      />
    </>
  );
}
