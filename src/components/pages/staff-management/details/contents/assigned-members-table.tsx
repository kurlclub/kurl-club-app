'use client';

import { columns } from '@/components/pages/members/table/all-members-columns';
import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { filters } from '@/lib/dummy/fiters';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useAllGymMembers } from '@/services/member';
import { MemberListItem } from '@/types/member.types';

interface AssignedMembersTableProps {
  trainerId: string;
}

export default function AssignedMembersTable({
  trainerId,
}: AssignedMembersTableProps) {
  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId;

  const { data: gymMembers = [], isLoading } = useAllGymMembers(gymId!);

  // Filter members assigned to this trainer
  const assignedMembers = gymMembers.filter(
    (member: MemberListItem) => member.personalTrainer === parseInt(trainerId)
  );

  const { items: filteredMembers, search } = useFilterableList(
    assignedMembers,
    (items, term) =>
      items.filter(
        (member) =>
          member.name.toLowerCase().includes(term.toLowerCase()) ||
          member.memberIdentifier?.toLowerCase().includes(term.toLowerCase())
      )
  );

  return (
    <DataTable
      columns={columns}
      data={filteredMembers}
      isLoading={isLoading}
      toolbar={(table) => (
        <DataTableToolbar table={table} onSearch={search} filters={filters} />
      )}
    />
  );
}
