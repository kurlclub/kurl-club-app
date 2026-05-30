import { useState } from 'react';

import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { useDebounce } from '@/hooks/use-debounce';
import { FilterConfig } from '@/lib/filters';
import { MemberFilters, useGymMembers } from '@/services/member';

import { columns } from '../table/all-members-columns';

type AllMembersTabProps = {
  gymId?: number;
  initialPackageFilter?: string;
  initialWorkoutPlanFilter?: string;
};

export function AllMembersTab({
  gymId,
  initialPackageFilter,
  initialWorkoutPlanFilter,
}: AllMembersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedFilters, setSelectedFilters] = useState<{
    feeStatus?: string[];
    package?: string[];
    workoutPlan?: string[];
    gender?: string[];
    isFrozen?: string[];
  }>({
    ...(initialPackageFilter ? { package: [initialPackageFilter] } : {}),
    ...(initialWorkoutPlanFilter
      ? { workoutPlan: [initialWorkoutPlanFilter] }
      : {}),
  });
  const [memberFilters, setMemberFilters] = useState<MemberFilters>({
    page: 1,
    pageSize: 10,
    sortOrder: 'desc',
    package: initialPackageFilter,
    workoutPlan: initialWorkoutPlanFilter,
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
      columnId: 'workoutPlan',
      title: 'Workout Plan',
      options:
        availableFilters?.workoutPlans?.map((plan) => ({
          label: plan.label,
          value: plan.value,
          count: plan.count,
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
    {
      columnId: 'isFrozen',
      title: 'Frozen',
      options: [
        {
          label: 'Frozen',
          value: 'true',
        },
        {
          label: 'Not Frozen',
          value: 'false',
        },
      ],
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
    const nextValues =
      columnId === 'isFrozen' && values?.length ? values.slice(-1) : values;
    setSelectedFilters((prev) => ({
      ...prev,
      [columnId]: nextValues,
    }));

    setMemberFilters((prev) => ({
      ...prev,
      [columnId]:
        columnId === 'isFrozen'
          ? nextValues?.[0] === undefined
            ? undefined
            : nextValues[0] === 'true'
          : nextValues?.join(',') || undefined,
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
  );
}
