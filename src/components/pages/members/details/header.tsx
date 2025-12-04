'use client';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import MemberStatusBadge from '@/components/shared/badges/member-status-badge';
import { KEdit } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { deleteMember } from '@/services/member';

interface HeaderProps {
  isEditing: boolean;
  handleSave: () => void;
  toggleEdit: () => void;
  memberId: string;
}

function Header({ isEditing, handleSave, toggleEdit, memberId }: HeaderProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { showConfirm } = useAppDialog();

  const handleDeleteCustomer = (id: string) => {
    showConfirm({
      title: `Delete Member`,
      description: `Are you sure you want to delete this member from your Database? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          const response = await deleteMember(id, queryClient);

          if (response.success) {
            toast.success(response.success);
            router.push('/members');
          } else {
            toast.error(response.error || 'Failed to delete member.');
          }
        } catch {
          toast.error('Failed to delete member.');
        }
      },
    });
  };

  return (
    <div className="flex sticky pt-4 md:pt-[26px] pb-4 z-20 drop-shadow-xl -top-px w-full items-center bg-primary-blue-500 justify-between gap-3 flex-wrap">
      <MemberStatusBadge status="active" />
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button variant="secondary" onClick={toggleEdit}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </>
        ) : (
          <>
            {/* TODO: Re-enable message button when the feature is ready */}
            {/* <Button className="h-10 w-10" variant="outline">
              <MessageSquareText className="text-primary-green-500 h-5! w-5!" />
            </Button> */}
            <Button className="h-10" variant="outline" onClick={toggleEdit}>
              <KEdit className="h-5! w-5!" />
              Edit
            </Button>
            <Button
              className="h-10"
              variant="destructive"
              onClick={() => handleDeleteCustomer(memberId)}
            >
              <Trash2 className="h-5! w-5!" />
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
