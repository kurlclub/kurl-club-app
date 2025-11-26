'use client';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';
import { MessageSquareText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { KEdit } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { deleteStaff } from '@/services/staff';
import { StaffType } from '@/types/staff';

interface HeaderProps {
  isEditing: boolean;
  handleSave: () => void;
  toggleEdit: () => void;
  staffId: string;
  staffRole: StaffType;
}

function Header({
  isEditing,
  handleSave,
  toggleEdit,
  staffId,
  staffRole,
}: HeaderProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { showConfirm } = useAppDialog();

  const handleDeleteStaff = (id: string, role: StaffType) => {
    showConfirm({
      title: `Delete Staff`,
      description: `Are you sure you want to delete this staff from your Database? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const response = await deleteStaff(id, role);

        if (response.success) {
          toast.success(response.success);
          router.push('/settings/staff-management');
          queryClient.invalidateQueries({ queryKey: ['gymStaffs'] });
        } else {
          toast.error(response.error || 'Failed to delete staff.');
        }
      },
    });
  };

  return (
    <div className="flex pt-4 md:pt-[26px] pb-4 w-full items-center justify-between gap-3">
      <h3 className="text-white font-medium text-xl leading-normal">
        Staff management
      </h3>
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
            <Button className="h-10 w-10" variant="outline">
              <MessageSquareText className="text-primary-green-500 h-5! w-5!" />
            </Button>
            <Button className="h-10" variant="outline" onClick={toggleEdit}>
              <KEdit className="h-5! w-5!" />
              Edit
            </Button>
            <Button
              className="h-10"
              variant="destructive"
              onClick={() => handleDeleteStaff(staffId, staffRole)}
            >
              <Trash2 className="h-5! w-5!" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
