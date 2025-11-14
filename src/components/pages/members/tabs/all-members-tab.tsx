import { useQueryClient } from '@tanstack/react-query';

import {
  DataTable,
  DataTableToolbar,
  TableSkeleton,
} from '@/components/shared/table';
import { ImportCSVModal } from '@/components/shared/table/import-csv-modal';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { filters } from '@/lib/dummy/fiters';
import { searchItems } from '@/lib/utils';
import { bulkImportMembers, useGymMembers } from '@/services/member';
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
  const { data: gymMembers = [], isLoading } = useGymMembers(gymId!);
  const queryClient = useQueryClient();

  const { items: filteredMembers, search } = useFilterableList<Member>(
    gymMembers,
    searchItems
  );

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
      {isLoading ? (
        <TableSkeleton rows={12} columns={8} showToolbar />
      ) : (
        <DataTable
          columns={columns}
          data={filteredMembers}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              onSearch={search}
              filters={filters}
            />
          )}
        />
      )}

      <ImportCSVModal<Member>
        isOpen={isImportModalOpen}
        onClose={onCloseImportModal}
        onImport={async (items) => {
          const result = await bulkImportMembers(items);
          if (result.success) {
            await queryClient.invalidateQueries({
              queryKey: ['gymMembers', gymId],
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
