import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@kurlclub/ui-components';
import { NotepadText, Pencil, Phone, Trash2 } from 'lucide-react';

import { FeeStatusBadge, SourceBadge } from '@/components/shared/badges';
import { KSheet } from '@/components/shared/form/k-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { getAvatarColor } from '@/lib/avatar-utils';
import { getInitials, safeFormatDate } from '@/lib/utils';
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

  // react-hook-form to manage the interest status and notes for the lead
  const form = useForm<{ interest: 'interested' | 'contacted'; note: string }>({
    defaultValues: {
      interest: lead?.interest === 'contacted' ? 'contacted' : 'interested',
      note: lead?.note || '',
    },
  });

  // reset form whenever a different lead is loaded
  useEffect(() => {
    if (lead) {
      form.reset({
        interest: lead.interest === 'contacted' ? 'contacted' : 'interested',
        note: lead.note || '',
      });
    }
  }, [lead, form]);

  const handleDelete = () => {
    showConfirm({
      title: 'Confirm Delete Lead',
      description: 'Are you sure you want to delete this lead?',
      variant: 'destructive',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        closeSheet();
      },
    });
  };

  return (
    <KSheet
      className="w-[582px]"
      title="View Lead"
      isOpen={isOpen}
      onClose={closeSheet}
      onCloseBtnClick={() => {
        closeSheet();
      }}
      position="right"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button variant="secondary" onClick={closeSheet}>
            Close
          </Button>
          <Button onClick={closeSheet}>Save changes</Button>
        </div>
      }
    >
      {lead ? (
        <FormProvider {...form}>
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
                <Avatar className="w-[54px] h-[54px]">
                  {lead?.photoPath ? (
                    <AvatarImage src={lead.photoPath} alt={lead.leadName} />
                  ) : (
                    <AvatarFallback
                      className="text-[25px] font-medium"
                      style={avatarStyle}
                    >
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-[20px] leading-normal text-white">
                    {lead.leadName}
                  </span>
                  <span className="text-[15px] leading-normal text-white flex items-center gap-1">
                    <Phone className="text-secondary-blue-100" size={20} />
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
                  {lead.assignedTo || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* interest radio group */}
            <RadioGroup
              value={form.watch('interest')}
              onValueChange={(value) =>
                form.setValue('interest', value as 'interested' | 'contacted')
              }
              className="flex items-center gap-4 mt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="interested" id="interested" />
                <label
                  htmlFor="interested"
                  className="text-white cursor-pointer"
                >
                  Mark as interested
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="contacted" id="contacted" />
                <label
                  htmlFor="contacted"
                  className="text-white cursor-pointer"
                >
                  Mark as contacted
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="lost" id="lost" />
                <label htmlFor="lost" className="text-white cursor-pointer">
                  Mark as Lost
                </label>
              </div>
            </RadioGroup>

            {/* notes */}
            <div className="rounded-lg flex flex-col gap-2 bg-secondary-blue-500 p-5">
              <span className="font-semibold text-sm text-secondary-blue-200 flex items-center gap-1">
                <NotepadText size={15} className="text-secondary-blue-200" />
                Notes
              </span>
              <p className="text-white text-[14px]">{lead.note}</p>
            </div>
          </div>
        </FormProvider>
      ) : (
        <div className="text-white">No lead selected.</div>
      )}
    </KSheet>
  );
};

export default ViewLead;
