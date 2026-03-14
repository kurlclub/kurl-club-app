import { Button } from '@kurlclub/ui-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotepadText, Pencil, Phone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { FeeStatusBadge, SourceBadge } from '@/components/shared/badges';
import { KSheet } from '@/components/shared/form/k-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { getAvatarColor } from '@/lib/avatar-utils';
import { getInitials, safeFormatDate } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { deleteLead } from '@/services/lead';
import { Lead } from '@/types/lead';

interface ViewLeadProps {
  closeSheet: () => void;
  isOpen: boolean;
  lead?: Lead | null;
  onEdit?: (lead: Lead) => void;
}

const ViewLead = ({ closeSheet, isOpen, lead, onEdit }: ViewLeadProps) => {
  const avatarStyle = getAvatarColor(lead?.leadName || '');
  const initials = getInitials(lead?.leadName || '');
  const { showConfirm } = useAppDialog();
  const { gymBranch } = useGymBranch();
  const queryClient = useQueryClient();

  const deleteLeadMutation = useMutation({
    mutationFn: ({ gymId, leadId }: { gymId: number; leadId: number }) =>
      deleteLead(gymId, leadId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leads', gymBranch?.gymId] });
      toast.success(result.message || 'Lead deleted successfully');
      closeSheet();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete lead'
      );
    },
  });

  const handleDelete = () => {
    showConfirm({
      title: 'Confirm Delete Lead',
      description: 'Are you sure you want to delete this lead?',
      variant: 'destructive',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        if (!gymBranch?.gymId || !lead?.id) {
          toast.error(
            'Unable to delete lead. Missing gym or lead information.'
          );
          return;
        }

        deleteLeadMutation.mutate({ gymId: gymBranch.gymId, leadId: lead.id });
      },
    });
  };

  return (
    <KSheet
      className="w-112.5"
      title="View Lead"
      isOpen={isOpen}
      onClose={closeSheet}
      onCloseBtnClick={() => {
        closeSheet();
      }}
      position="right"
    >
      {lead ? (
        <div className="flex flex-col gap-4 text-white">
          {/* date and action buttons */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-sm leading-[109%] text-primary-blue-200">
              Created: {safeFormatDate(lead.createdAt)}
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => lead && onEdit?.(lead)}
              >
                <span className="w-8.5 h-8.5 flex items-center justify-center rounded-full bg-secondary-blue-500 hover:bg-secondary-blue-400 k-transition">
                  <Pencil className="h-4.5 w-4.5" />
                </span>
              </Button>
              <Button onClick={handleDelete} variant="ghost" size="icon">
                <span className="w-8.5 h-8.5 flex items-center justify-center rounded-full bg-secondary-blue-500 hover:bg-secondary-blue-400 k-transition">
                  <Trash2 className="h-4.5 w-4.5" />
                </span>
              </Button>
            </div>
          </div>

          {/* name card */}
          <div className="p-3 rounded-lg border border-primary-blue-100/10 flex justify-between gap-4 items-start">
            <div className="flex items-center gap-3 ">
              {/* avatar */}
              <Avatar className="w-11.5 h-11.5">
                {lead?.photoPath ? (
                  <AvatarImage src={lead.photoPath} alt={lead.leadName} />
                ) : (
                  <AvatarFallback
                    className="text-[20px] font-medium"
                    style={avatarStyle}
                  >
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-[16px] leading-normal text-white">
                  {lead.leadName}
                </span>
                <span className="text-[14px] leading-normal text-white flex items-center gap-1">
                  <Phone className="text-secondary-blue-100" size={15} />
                  {lead.phone}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SourceBadge status={lead.source} />
              <FeeStatusBadge status={lead.interest} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border border-primary-blue-100/10">
            {/* Follow-up Date */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-secondary-blue-200">
                Follow-up Date
              </span>
              <span className="text-sm text-white font-medium">
                {lead.followUpDate
                  ? safeFormatDate(lead.followUpDate)
                  : 'Not scheduled'}
              </span>
            </div>

            {/* Assigned To */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-secondary-blue-200">
                Assigned To
              </span>
              <span className="text-sm text-white font-medium">
                {lead.assignedTo || 'Unassigned'}{' '}
                {lead.assignedToUserType &&
                  `(${lead.assignedToUserType.charAt(0).toUpperCase() + lead.assignedToUserType.slice(1)})`}
              </span>
            </div>
          </div>

          {/* notes */}
          <div className="rounded-lg flex flex-col gap-2 bg-secondary-blue-500 p-5">
            <span className="font-semibold text-sm text-secondary-blue-200 flex items-center gap-1">
              <NotepadText size={15} className="text-secondary-blue-200" />
              Notes
            </span>
            <p className="text-white text-[14px]">{lead.note}</p>
          </div>
        </div>
      ) : (
        <div className="text-white">No lead selected.</div>
      )}
    </KSheet>
  );
};

export default ViewLead;
