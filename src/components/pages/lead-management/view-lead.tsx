import { Button } from '@kurlclub/ui-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  NotepadText,
  Pencil,
  Phone,
  Star,
  Trash2,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { FeeStatusBadge, SourceBadge } from '@/components/shared/badges';
import { KSheet } from '@/components/shared/form/k-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { getAvatarColor } from '@/lib/avatar-utils';
import { getInitials, safeFormatDate } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  type CreateLeadPayload,
  deleteLead,
  updateLead,
} from '@/services/lead';
import { InterestStatus, Lead } from '@/types/lead';
import type { StaffType } from '@/types/staff';

interface ViewLeadProps {
  closeSheet: () => void;
  isOpen: boolean;
  lead?: Lead | null;
  onEdit?: (lead: Lead) => void;
  onAddMember?: (lead: Lead) => void;
  onStatusUpdated?: (lead: Lead) => void;
}

const ViewLead = ({
  closeSheet,
  isOpen,
  lead,
  onEdit,
  onAddMember,
  onStatusUpdated,
}: ViewLeadProps) => {
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

  const updateLeadStatusMutation = useMutation({
    mutationFn: ({
      gymId,
      leadId,
      status,
      payload,
    }: {
      gymId: number;
      leadId: number;
      status: InterestStatus;
      payload: CreateLeadPayload;
    }) =>
      updateLead(gymId, leadId, payload).then((result) => ({ result, status })),
    onSuccess: ({ result, status }) => {
      queryClient.invalidateQueries({ queryKey: ['leads', gymBranch?.gymId] });

      if (lead) {
        onStatusUpdated?.({ ...lead, interest: status });
      }

      toast.success(result.message || 'Lead status updated successfully');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update lead status'
      );
    },
  });

  const createStatusPayload = (
    selectedLead: Lead,
    status: InterestStatus
  ): CreateLeadPayload => {
    const payload: CreateLeadPayload = {
      name: selectedLead.leadName,
      phone: selectedLead.phone || '',
      source: selectedLead.source,
      status,
      notes: selectedLead.note || '',
    };

    if (selectedLead.followUpDate) {
      payload.followUpDate = selectedLead.followUpDate;
    }

    const assignedToUserType = selectedLead.assignedToUserType?.toLowerCase();
    if (
      selectedLead.assignedToUserId &&
      (assignedToUserType === 'staff' || assignedToUserType === 'trainer')
    ) {
      payload.assignedToUserId = selectedLead.assignedToUserId;
      payload.assignedToUserType = assignedToUserType as StaffType;
    }

    return payload;
  };

  const handleStatusChange = (
    status: Extract<InterestStatus, 'contacted' | 'interested' | 'lost'>
  ) => {
    const statusLabel =
      status === 'contacted'
        ? 'contacted'
        : status === 'interested'
          ? 'interested'
          : 'lost';

    showConfirm({
      title:
        status === 'contacted'
          ? 'Mark Lead as Contacted'
          : status === 'interested'
            ? 'Mark Lead as Interested'
            : 'Mark Lead as Lost',
      description: `Are you sure you want to mark this lead as ${statusLabel}?`,
      variant: status === 'lost' ? 'destructive' : 'default',
      confirmLabel:
        status === 'contacted'
          ? 'Mark Contacted'
          : status === 'interested'
            ? 'Mark Interested'
            : 'Mark Lost',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        if (!gymBranch?.gymId || !lead?.id) {
          toast.error(
            'Unable to update lead. Missing gym or lead information.'
          );
          return;
        }

        await updateLeadStatusMutation.mutateAsync({
          gymId: gymBranch.gymId,
          leadId: lead.id,
          status,
          payload: createStatusPayload(lead, status),
        });
      },
    });
  };

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

  const handleConvertToMember = () => {
    if (!lead) return;

    showConfirm({
      title: 'Convert Lead to Member',
      description: `Are you sure you want to convert ${lead.leadName} to a member?`,
      confirmLabel: 'Convert to Member',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        onAddMember?.(lead);
      },
    });
  };

  return (
    <KSheet
      className="w-112.5"
      title="Lead Details"
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
              {lead.interest !== 'lost' && (
                <Button onClick={handleDelete} variant="ghost" size="icon">
                  <span className="w-8.5 h-8.5 flex items-center justify-center rounded-full bg-secondary-blue-500 hover:bg-secondary-blue-400 k-transition">
                    <Trash2 className="h-4.5 w-4.5" />
                  </span>
                </Button>
              )}
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

          {lead.interest === 'new' && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outlinePrimary"
                type="button"
                onClick={() => handleStatusChange('contacted')}
              >
                <Phone className="h-4 w-4" />
                Mark as Contacted
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleStatusChange('lost')}
              >
                <XCircle className="h-4 w-4" />
                Mark as Lost
              </Button>
            </div>
          )}

          {lead.interest === 'contacted' && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outlinePrimary"
                type="button"
                onClick={() => handleStatusChange('interested')}
              >
                <Star className="h-4 w-4" />
                Mark as Interested
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleStatusChange('lost')}
              >
                <XCircle className="h-4 w-4" />
                Mark as Lost
              </Button>
            </div>
          )}

          {lead.interest === 'interested' && (
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" onClick={handleConvertToMember}>
                <UserPlus className="h-4 w-4" />
                Convert to Member
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleStatusChange('lost')}
              >
                <XCircle className="h-4 w-4" />
                Mark as Lost
              </Button>
            </div>
          )}

          {lead.interest === 'lost' && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="w-full"
            >
              <Trash2 className="h-4 w-4" />
              Delete Lead
            </Button>
          )}

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
