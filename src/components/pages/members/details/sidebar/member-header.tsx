import { safeParseDate } from '@kurlclub/ui-components';
import { Calendar } from 'lucide-react';

import { KDatePicker } from '@/components/shared/form/k-datepicker';
import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  base64ToFile,
  safeDateFormat,
  toUtcDateOnlyISOString,
} from '@/lib/utils';
import { MemberDetails } from '@/types/member.types';

export interface EditableSectionProps {
  isEditing: boolean;
  details: MemberDetails | null;
  onUpdate: <K extends keyof MemberDetails>(
    key: K,
    value: MemberDetails[K]
  ) => void;
}

export function MemberHeader({
  isEditing,
  details,
  onUpdate,
}: EditableSectionProps) {
  return (
    <>
      <div className="items-center mb-4">
        <div className="mb-3">
          <ProfilePictureUploader
            files={
              details?.profilePicture instanceof File
                ? details.profilePicture
                : details?.profilePicture
                  ? base64ToFile(details.profilePicture, 'profile.png')
                  : null
            }
            onChange={
              isEditing
                ? (file) => {
                    if (file) {
                      onUpdate('profilePicture', file);
                    } else {
                      onUpdate('profilePicture', null);
                    }
                  }
                : () => {}
            }
            existingImageUrl={details?.photoPath || undefined}
            isSmall
            readonly={!isEditing}
          />
        </div>
        <div>
          {isEditing ? (
            <div className="flex items-center pb-1.5 border-b gap-2 border-primary-blue-300 group focus-within:border-white hover:border-white k-transition">
              <Input
                value={details?.memberName}
                onChange={(e) => onUpdate('memberName', e.target.value)}
                className="border-0 font-medium rounded-none h-auto p-0 text-[20px]! focus-visible:outline-0 focus-visible:ring-0"
              />
            </div>
          ) : (
            <h6 className="text-xl font-medium text-white">
              {details?.memberName}
            </h6>
          )}
          {isEditing ? (
            <div className="py-3 flex flex-col gap-2">
              {/* <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
          Date of Joining
        </Label> */}
              {isEditing ? (
                <KDatePicker
                  icon={<Calendar />}
                  mode="single"
                  value={safeParseDate(details?.doj)}
                  onDateChange={(date) =>
                    onUpdate(
                      'doj',
                      date instanceof Date ? toUtcDateOnlyISOString(date) : ''
                    )
                  }
                  disabled={{ after: new Date() }}
                  label="Date of joining"
                  className="bg-transparent border-0 border-b border-primary-blue-300 rounded-none hover:bg-transparent hover:border-white k-transition p-0 h-auto w-full pb-1.5 text-white text-[15px] leading-[140%] font-normal gap-1 flex-row-reverse justify-between"
                />
              ) : (
                <p className="text-white text-[15px] leading-[140%] font-normal">
                  {safeDateFormat(details?.doj)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-primary-blue-50 mt-1">
              Member since {safeDateFormat(details?.doj)}
            </p>
          )}
        </div>
      </div>
      <Badge className="bg-neutral-ochre-500 flex items-center w-fit justify-center text-sm rounded-full h-[30px] py-[8.5px] px-4 border border-neutral-ochre-800 bg-opacity-10">
        Member ID:{' '}
        <span className="uppercase ml-1">{details?.memberIdentifier}</span>
      </Badge>
    </>
  );
}
