'use client';

import { Control, useWatch } from 'react-hook-form';

import { Clock, PenLine, User2 } from 'lucide-react';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import RichTextEditor from '@/components/shared/rich-text-editor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { getInitials, getProfilePictureSrc } from '@/lib/utils';
import { Member } from '@/types/members';
import { MembershipPlan } from '@/types/membership-plan';

interface MembershipPlanFormData {
  planName: string;
  billingType: 'Recurring' | 'PerSession';
  fee: string | number;
  details?: string;
  durationInDays: string | number;
  defaultSessionRate?: string | number;
}

interface OverviewProps {
  plan: MembershipPlan;
  planMembers?: Member[];
  isEditMode: boolean;
  isNewPlan?: boolean;
  onUpdatePlan: (updatedPlan: MembershipPlan) => void;
  onImmediateUpdate: (updatedPlan: MembershipPlan) => void;
  onDelete: () => void;
  onEdit: () => void;
  onShowMembers: () => void;
  control?: Control<MembershipPlanFormData>;
}

export function Overview({
  plan,
  planMembers = [],
  isEditMode,
  isNewPlan = false,
  onUpdatePlan,
  onImmediateUpdate,
  onEdit,
  onShowMembers,
  control,
}: OverviewProps) {
  const watchedBillingType = useWatch({
    control: control!,
    name: 'billingType',
    defaultValue: plan.billingType,
  });
  const billingType = control ? watchedBillingType : plan.billingType;

  const handleDefaultChange = (checked: boolean) => {
    const updatedPlan = { ...plan, isActive: checked };

    if (isNewPlan) {
      onUpdatePlan(updatedPlan);
    } else {
      onImmediateUpdate(updatedPlan);
    }
  };

  const renderOverviewCard = (data: MembershipPlan) => (
    <Card className="w-full bg-secondary-blue-500 border-secondary-blue-600 text-white rounded-md">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl leading-tight font-medium">{data.planName}</h1>
          <button
            className="text-zinc-400 hover:text-primary-green-200 transition-colors"
            onClick={onEdit}
          >
            <PenLine className="w-5 h-5" />
          </button>
        </div>
        <div className="inline-flex px-4 bg-primary-blue-400 rounded-3xl w-auto max-w-max">
          <p className="text-lg text-white font-medium leading-relaxed">
            &#8377;{new Intl.NumberFormat('en-IN').format(Number(data.fee))}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <User2 className="w-6 h-6 text-primary-blue-200 shrink-0" />
            <div>
              <p className="text-primary-blue-50 text-sm">Total Members</p>
              <div
                className="flex items-center cursor-pointer"
                onClick={onShowMembers}
              >
                <div className="flex -space-x-2">
                  {planMembers.slice(0, 3).map((member) => (
                    <Avatar
                      key={member.id}
                      className="border border-neutral-300 w-5 h-5"
                    >
                      <AvatarFallback className="bg-primary-blue-400 text-[10px]">
                        {getInitials(member.name)}
                      </AvatarFallback>
                      <AvatarImage
                        src={getProfilePictureSrc(
                          member.profilePicture,
                          member.avatar
                        )}
                        alt={member.name}
                      />
                    </Avatar>
                  ))}
                </div>
                {planMembers.length > 3 && (
                  <span className="ml-1 text-sm text-semantic-blue-500 underline">
                    + {planMembers.length - 3} others
                  </span>
                )}
                {planMembers.length === 0 && (
                  <span className="text-sm text-gray-400">
                    No members assigned
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator
            orientation="vertical"
            className="h-12 hidden sm:block bg-primary-blue-400"
          />

          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-primary-blue-200 shrink-0" />
            <div>
              <p className="text-primary-blue-50 text-sm">Duration</p>
              <p className="text-sm text-white">{data.durationInDays} Days</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div
          className="prose prose-sm flex flex-col gap-2 prose-invert max-w-none
             prose-h1:text-2xl
             prose-p:text-white prose-p:leading-relaxed
             prose-ul:flex prose-ul:flex-col prose-ul:gap-4 prose-ul:list-none
             prose-li:list-none prose-li:text-white prose-li:font-medium prose-li:text-sm
             *:m-0 *:p-0 [&_li]:m-0 [&_li]:p-0
             [&_li]:relative [&_li]:pl-5
             [&_li::before]:content-[''] [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:top-[4px]
             [&_li::before]:w-3 [&_li::before]:h-3 [&_li::before]:rounded-full
             [&_li::before]:border-[3px] [&_li::before]:border-primary-green-100
             [&_li::before]:bg-transparent [&_ul>li>p]:m-0 [&_ul>li>p]:p-0"
          dangerouslySetInnerHTML={{ __html: data.details }}
        />
      </CardFooter>
    </Card>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2>Membership details</h2>
        <div className="flex items-center gap-2">
          <span>Activate</span>
          <Switch
            checked={plan.isActive}
            onCheckedChange={handleDefaultChange}
            className="data-[state=checked]:bg-primary-green-500"
          />
        </div>
      </div>
      {isEditMode ? (
        <div className="space-y-4">
          <KFormField
            fieldType={KFormFieldType.INPUT}
            control={control!}
            name="planName"
            label="Membership Plan Name"
            placeholder="Enter plan name"
            mandetory
          />

          <KFormField
            fieldType={KFormFieldType.SELECT}
            control={control!}
            name="billingType"
            label="Billing Type"
            placeholder="Select billing type"
            mandetory
            options={[
              { label: 'Recurring (Fixed cycle)', value: 'Recurring' },
              { label: 'Per Session (Pay per visit)', value: 'PerSession' },
            ]}
          />

          <KFormField
            fieldType={KFormFieldType.INPUT}
            control={control!}
            name="fee"
            label={
              billingType === 'PerSession'
                ? 'Default Session Rate (INR)'
                : 'Amount in (INR)'
            }
            placeholder="Enter amount"
            type="number"
            mandetory
          />

          {billingType === 'PerSession' && (
            <div className="p-3 bg-primary-green-500/10 border border-primary-green-500/20 rounded-md">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 <strong>Per Session Billing:</strong> Members will be charged
                per attendance. You can set custom rates for individual members.
              </p>
            </div>
          )}

          <KFormField
            fieldType={KFormFieldType.SKELETON}
            control={control!}
            name="details"
            renderSkeleton={(field) => (
              <RichTextEditor
                content={String(field.value || '')}
                onUpdate={(value: string) => field.onChange(value)}
              />
            )}
          />

          <div className="flex flex-col w-1/2 md:flex-row gap-4">
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={control!}
              name="durationInDays"
              label={
                billingType === 'PerSession'
                  ? 'Validity (days)'
                  : 'Duration (days)'
              }
              type="number"
              placeholder="Enter duration"
              mandetory
            />
          </div>
        </div>
      ) : (
        <>{renderOverviewCard(plan)}</>
      )}
    </>
  );
}
